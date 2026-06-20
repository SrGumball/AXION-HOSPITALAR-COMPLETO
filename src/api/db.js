/**
 * db.js — Camada de dados: SQLite (via Tauri invoke) como fonte principal.
 *
 * Fluxo:
 *  - Leitura: SQLite local (instantâneo, sem rede)
 *  - Escrita: SQLite local → enfileira operação pendente → dispara sync background
 *  - O Firebase só é usado via syncManager para sincronização
 */

import { invoke } from "@tauri-apps/api/core";
import { scheduleSyncAfterWrite } from "./syncManager";

// ─── Helper ────────────────────────────────────────────────────────────────────

async function tauriCreate(entityName, data) {
  const result = await invoke("create_entity", { name: entityName, data });
  // Marcar como pendente de sync
  try {
    await invoke("mark_pending_sync", {
      entityName,
      recordId: result.id,
      operation: "create",
    });
  } catch (e) {
    console.warn("[db] Falha ao marcar pending_sync:", e);
  }
  return result;
}

async function tauriUpdate(entityName, id, data) {
  const result = await invoke("update_entity", { name: entityName, id, data });
  try {
    await invoke("mark_pending_sync", {
      entityName,
      recordId: id,
      operation: "update",
    });
  } catch (e) {
    console.warn("[db] Falha ao marcar pending_sync:", e);
  }
  return result;
}

async function tauriDelete(entityName, id) {
  await invoke("delete_entity", { name: entityName, id });
  try {
    await invoke("mark_pending_sync", {
      entityName,
      recordId: id,
      operation: "delete",
    });
  } catch (e) {
    console.warn("[db] Falha ao marcar pending_sync:", e);
  }
}

// ─── Proxy de entidade ─────────────────────────────────────────────────────────

const createEntityProxy = (entityName) => ({
  list: (orderBy) =>
    invoke("list_entities", { name: entityName, orderBy: orderBy ?? null }),

  get: async (id) => {
    const all = await invoke("list_entities", { name: entityName, orderBy: null });
    return all.find((item) => item.id === id) ?? null;
  },

  create: async (data) => {
    const item = await tauriCreate(entityName, data);
    scheduleSyncAfterWrite();
    return item;
  },

  update: async (id, data) => {
    const item = await tauriUpdate(entityName, id, data);
    scheduleSyncAfterWrite();
    return item;
  },

  delete: async (id) => {
    await tauriDelete(entityName, id);
    scheduleSyncAfterWrite();
  },
});

// ─── Exportação ────────────────────────────────────────────────────────────────

export const db = {
  entities: {
    Medicamento: createEntityProxy("Medicamento"),
    Lote: createEntityProxy("Lote"),
    Entrada: createEntityProxy("Entrada"),
    Saida: createEntityProxy("Saida"),
    Fornecedor: createEntityProxy("Fornecedor"),
    Ala: createEntityProxy("Ala"),
    Emprestimo: createEntityProxy("Emprestimo"),
    Categoria: createEntityProxy("Categoria"),
    Inventario: createEntityProxy("Inventario"),
    InventarioItem: createEntityProxy("InventarioItem"),
    Config: createEntityProxy("Config"),
  },
};
