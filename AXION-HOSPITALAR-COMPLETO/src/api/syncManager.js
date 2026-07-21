/**
 * syncManager.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Sistema inteligente de sincronização SQLite ↔ Firebase Firestore.
 *
 * Estratégia:
 *  1. Na inicialização, check_db_status() decide o modo:
 *     a) Banco com dados → abre imediatamente, sync incremental em background
 *     b) Banco vazio     → carga inicial completa do Firebase, depois abre
 *  2. Escrita sempre vai para SQLite (via db.js / Tauri invoke)
 *  3. Firebase só é acessado para sincronização (nunca para leitura de tela)
 *  4. Sem internet → funciona normalmente; pendentes ficam na fila
 * ──────────────────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ENTITIES = [
  "Categoria", "Fornecedor", "Ala", "Inventario",
  "Medicamento", "Lote", "Entrada", "Saida",
  "Emprestimo", "InventarioItem", "Config",
];

const BATCH_SIZE = 400;       // máximo do Firestore WriteBatch
const UPSERT_CHUNK = 200;     // registros por invoke de upsert_from_firebase
const AUTO_SYNC_MS = 5 * 60 * 1000; // 5 min

// ─── Estado global ─────────────────────────────────────────────────────────────

let _isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let _isSyncing = false;
let _isInitializing = false;
let _initMode = null;       // "local" | "firebase" | null
let _pendingCount = 0;
let _syncProgress = 0;
let _syncCurrent = 0;
let _syncTotal = 0;
let _lastSync = null;
let _listeners = [];
let _initialized = false;
let _autoSyncInterval = null;

// ─── Notificação de estado ─────────────────────────────────────────────────────

function notify() {
  _listeners.forEach((fn) =>
    fn({
      isOnline: _isOnline,
      isSyncing: _isSyncing,
      isInitializing: _isInitializing,
      initMode: _initMode,
      pendingCount: _pendingCount,
      syncProgress: _syncProgress,
      syncCurrent: _syncCurrent,
      syncTotal: _syncTotal,
      lastSync: _lastSync,
    })
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const pause = (ms = 50) => new Promise((r) => setTimeout(r, ms));

function log(msg, ...args) {
  console.log(`[syncManager] ${msg}`, ...args);
}
function warn(msg, ...args) {
  console.warn(`[syncManager] ⚠ ${msg}`, ...args);
}
function err(msg, ...args) {
  console.error(`[syncManager] ✗ ${msg}`, ...args);
}

async function getPendingCount() {
  try {
    const pending = await invoke("get_pending_sync_records");
    return Array.isArray(pending) ? pending.length : 0;
  } catch {
    return 0;
  }
}

// ─── Carga inicial do Firebase → SQLite ────────────────────────────────────────

async function performInitialLoad() {
  log("Iniciando carga inicial completa do Firebase...");
  _syncProgress = 0;
  _syncCurrent = 0;
  _syncTotal = ENTITIES.length;
  notify();

  let totalLoaded = 0;

  for (let i = 0; i < ENTITIES.length; i++) {
    const entityName = ENTITIES[i];
    try {
      const snap = await getDocs(collection(firestoreDb, entityName));
      const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (records.length > 0) {
        // Upsert em chunks para não sobrecarregar o Tauri IPC
        for (let c = 0; c < records.length; c += UPSERT_CHUNK) {
          const chunk = records.slice(c, c + UPSERT_CHUNK);
          await invoke("upsert_from_firebase", { entityName, records: chunk });
          await pause(30);
        }
        log(`Carga inicial: ${records.length} registros de ${entityName}`);
        totalLoaded += records.length;
      }
    } catch (e) {
      warn(`Falha ao carregar ${entityName} do Firebase:`, e.message);
    }

    _syncCurrent = i + 1;
    _syncProgress = Math.round((_syncCurrent / _syncTotal) * 100);
    notify();
    await pause(80);
  }

  // Marca como concluída e registra timestamp
  const now = new Date().toISOString();
  await invoke("set_sync_metadata", {
    lastSync: now,
    appVersion: null,
    initialLoadCompleted: true,
  });
  _lastSync = now;

  log(`Carga inicial concluída. ${totalLoaded} registros carregados.`);
  return totalLoaded;
}

// ─── Sincronização incremental: Firebase → SQLite ──────────────────────────────

async function pullIncrementalFromFirebase(since) {
  log(`Iniciando sincronização incremental desde: ${since}`);
  let totalReceived = 0;

  for (const entityName of ENTITIES) {
    try {
      const q = query(
        collection(firestoreDb, entityName),
        where("updatedAt", ">", since)
      );
      const snap = await getDocs(q);
      if (snap.empty) continue;

      const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      for (let c = 0; c < records.length; c += UPSERT_CHUNK) {
        const chunk = records.slice(c, c + UPSERT_CHUNK);
        await invoke("upsert_from_firebase", { entityName, records: chunk });
        await pause(20);
      }

      log(`Pull incremental: ${records.length} registros de ${entityName}`);
      totalReceived += records.length;
    } catch (e) {
      warn(`Falha no pull incremental de ${entityName}:`, e.message);
    }
  }

  log(`Sincronização incremental concluída. ${totalReceived} registros recebidos.`);
  return totalReceived;
}

// ─── Push: SQLite (pendentes) → Firebase ──────────────────────────────────────

async function pushPendingToFirebase() {
  let pending;
  try {
    pending = await invoke("get_pending_sync_records");
  } catch (e) {
    warn("Falha ao obter pendentes:", e.message);
    return 0;
  }

  if (!pending || pending.length === 0) {
    log("Nenhum item pendente para enviar ao Firebase.");
    return 0;
  }

  log(`Enviando ${pending.length} operações pendentes ao Firebase...`);
  _syncTotal = pending.length;
  _syncCurrent = 0;
  notify();

  let sent = 0;
  let batchObj = writeBatch(firestoreDb);
  let batchCount = 0;
  const postOps = [];

  const flushBatch = async () => {
    if (batchCount === 0) return;
    await batchObj.commit();
    for (const op of postOps.splice(0)) {
      try { await op(); } catch {}
    }
    batchObj = writeBatch(firestoreDb);
    batchCount = 0;
    await pause(60);
  };

  for (const p of pending) {
    const { entity_name: entityName, record_id: recordId, operation } = p;

    try {
      if (operation === "delete") {
        batchObj.delete(doc(firestoreDb, entityName, recordId));
        batchCount++;
      } else {
        // Busca o registro atual do SQLite
        let records;
        try {
          records = await invoke("list_entities", { name: entityName, orderBy: null });
        } catch {
          records = [];
        }
        const record = records.find((r) => r.id === recordId);
        if (!record) {
          // Registro deletado localmente antes de sincronizar
          postOps.push(() => invoke("mark_synced", { entityName, recordId }));
          _syncCurrent++;
          notify();
          continue;
        }

        const { created_at, ...rest } = record;
        const firestoreData = {
          ...rest,
          updatedAt: new Date().toISOString(),
          created_at: created_at ?? new Date().toISOString(),
        };

        batchObj.set(doc(firestoreDb, entityName, recordId), firestoreData, { merge: true });
        batchCount++;
      }

      postOps.push(() => invoke("mark_synced", { entityName, recordId }));
      sent++;
    } catch (e) {
      warn(`Erro ao preparar ${entityName}/${recordId}:`, e.message);
    }

    _syncCurrent++;
    _syncProgress = Math.round((_syncCurrent / _syncTotal) * 100);
    notify();

    if (batchCount >= BATCH_SIZE) {
      try { await flushBatch(); } catch (e) {
        err("Erro ao commit do batch:", e.message);
      }
    }
  }

  try { await flushBatch(); } catch (e) {
    err("Erro no flush final:", e.message);
  }

  log(`Push concluído: ${sent} operações enviadas.`);
  return sent;
}

// ─── Ciclo completo de sincronização ──────────────────────────────────────────

export async function sync() {
  if (_isSyncing || !_isOnline) {
    if (!_isOnline) log("Offline — sincronização adiada.");
    return;
  }

  _isSyncing = true;
  _syncProgress = 0;
  _syncCurrent = 0;
  _syncTotal = 0;
  notify();

  log("Iniciando ciclo de sincronização...");

  try {
    // 1. Envia pendentes locais → Firebase
    const pushed = await pushPendingToFirebase();

    // 2. Puxa alterações do Firebase → SQLite (incremental)
    let meta;
    try {
      meta = await invoke("get_sync_metadata");
    } catch {
      meta = { lastSync: null, initialLoadCompleted: false };
    }

    const since = meta.last_sync;
    let pulled = 0;
    if (since) {
      pulled = await pullIncrementalFromFirebase(since);
    }

    // 3. Atualiza last_sync
    const now = new Date().toISOString();
    await invoke("set_sync_metadata", {
      lastSync: now,
      appVersion: null,
      initialLoadCompleted: null,
    });
    _lastSync = now;
    _pendingCount = await getPendingCount();
    _syncProgress = 100;

    if (_pendingCount === 0) {
      toast.success(`Sincronização concluída! ↑${pushed} ↓${pulled} registros.`);
      log(`Sincronização concluída. Enviados: ${pushed}, Recebidos: ${pulled}`);
    } else {
      toast.warning(`Sincronização parcial: ${_pendingCount} itens ainda pendentes.`);
    }
  } catch (e) {
    err("Erro durante sync:", e.message ?? e);
    toast.error("Erro durante sincronização: " + (e.message ?? e));
  } finally {
    _isSyncing = false;
    _pendingCount = await getPendingCount();
    notify();
  }
}

// ─── Inicialização inteligente ─────────────────────────────────────────────────

/**
 * Deve ser chamado UMA VEZ ao iniciar o app.
 * Decide automaticamente entre:
 *   - Abrir com dados locais + sync incremental em background
 *   - Fazer carga inicial do Firebase (banco vazio ou novo)
 *
 * @returns {Promise<{ mode: string, counts: object }>}
 */
export async function initializeApp() {
  if (_isInitializing) return;
  _isInitializing = true;
  notify();

  let dbStatus;
  try {
    dbStatus = await invoke("check_db_status");
    log("Status do banco SQLite:", dbStatus);
  } catch (e) {
    err("Falha ao verificar status do banco:", e.message);
    _isInitializing = false;
    notify();
    return { mode: "error", error: e.message };
  }

  let mode;

  if (dbStatus.has_data && dbStatus.initial_load_completed) {
    // ── MODO A: Banco com dados válidos ─────────────────────────────────────
    if (dbStatus.last_sync) {
      log(`Banco SQLite com dados encontrado. Última sync: ${dbStatus.last_sync}`);
      log("Abrindo sistema imediatamente com dados locais.");
      log("Sincronização incremental iniciará em background.");
    } else {
      log("Banco SQLite importado de outro computador detectado (sem last_sync).");
      log("Usando dados locais. Sincronização incremental em background.");
    }
    mode = "local";
    _initMode = "local";
    _isInitializing = false;
    notify();

    // Sync incremental em background (não bloqueia a UI)
    if (_isOnline) {
      setTimeout(() => sync(), 2000);
    }
  } else {
    // ── MODO B: Banco vazio ou não inicializado ──────────────────────────────
    if (!dbStatus.has_data) {
      log("Banco SQLite vazio. Iniciando carga inicial do Firebase...");
    } else {
      log("Carga inicial não concluída. Retomando carga do Firebase...");
    }
    mode = "firebase";
    _initMode = "firebase";
    notify();

    if (_isOnline) {
      try {
        const loaded = await performInitialLoad();
        log(`Carga inicial concluída. ${loaded} registros carregados.`);
        toast.success(`Sistema inicializado com ${loaded} registros do Firebase.`);
      } catch (e) {
        err("Falha na carga inicial:", e.message);
        toast.error("Falha na carga inicial: " + e.message);
      }
    } else {
      warn("Banco vazio e sem conexão. O sistema iniciará sem dados.");
      toast.warning("Sem conexão com a internet. Conecte para baixar os dados.");
    }

    _isInitializing = false;
    _initMode = "local";
    notify();
  }

  _lastSync = dbStatus.last_sync;
  return { mode, counts: dbStatus.record_counts };
}

// ─── initSyncManager (listeners de rede + auto-sync) ──────────────────────────

export function initSyncManager() {
  if (_initialized) return;
  _initialized = true;

  window.addEventListener("online", async () => {
    _isOnline = true;
    log("Conexão restaurada. Iniciando sincronização...");
    notify();
    await sync();
  });

  window.addEventListener("offline", async () => {
    _isOnline = false;
    _pendingCount = await getPendingCount();
    warn("Conexão perdida. O sistema continua funcionando offline.");
    notify();
  });

  // Auto-sync periódico
  if (_autoSyncInterval) clearInterval(_autoSyncInterval);
  _autoSyncInterval = setInterval(async () => {
    if (_isOnline && !_isSyncing) {
      const pc = await getPendingCount();
      if (pc > 0) {
        log(`Auto-sync: ${pc} pendentes`);
        sync();
      }
    }
  }, AUTO_SYNC_MS);
}

// ─── Hook React ───────────────────────────────────────────────────────────────

export function useSyncStatus() {
  const [status, setStatus] = useState({
    isOnline: _isOnline,
    isSyncing: _isSyncing,
    isInitializing: _isInitializing,
    initMode: _initMode,
    pendingCount: _pendingCount,
    syncProgress: _syncProgress,
    syncCurrent: _syncCurrent,
    syncTotal: _syncTotal,
    lastSync: _lastSync,
  });

  useEffect(() => {
    const listener = (s) => setStatus({ ...s });
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  return status;
}

// ─── scheduleSyncAfterWrite (chamado pelo db.js) ───────────────────────────────

export function scheduleSyncAfterWrite() {
  // Atualiza contagem sem bloquear
  getPendingCount().then((pc) => {
    _pendingCount = pc;
    notify();
  });

  if (_isOnline) {
    clearTimeout(window._syncTimeout);
    window._syncTimeout = setTimeout(() => sync(), 1500);
  }
}

// ─── Utilitários exportados ────────────────────────────────────────────────────

export async function forceFullResync() {
  log("Forçando re-sincronização completa...");
  await invoke("set_sync_metadata", {
    lastSync: null,
    appVersion: null,
    initialLoadCompleted: false,
  });
  await invoke("clear_all_data");
  return initializeApp();
}

export function getLastSync() {
  return _lastSync;
}

export async function getPendingDetails() {
  try {
    return await invoke("get_pending_sync_records");
  } catch {
    return [];
  }
}
