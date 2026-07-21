/**
 * sync-to-firebase.js
 * Lê o arquivo de backup SQLite (.db) e envia todos os dados para o Firebase Firestore.
 *
 * USO:
 *   1. Coloque o arquivo .db na pasta do projeto (ex: "backup.db")
 *   2. Execute: node sync-to-firebase.js
 *   3. Se quiser especificar o arquivo: node sync-to-firebase.js meubackup.db
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch } from "firebase/firestore";
import Database from "better-sqlite3";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyCuT1iqlYge9NOltYNrJNzOd8HgdhPfO18",
  authDomain: "caislins.firebaseapp.com",
  projectId: "caislins",
  storageBucket: "caislins.firebasestorage.app",
  messagingSenderId: "966199346132",
  appId: "1:966199346132:web:fde5fd93ccaaae75fb0c41"
};

const BATCH_SIZE = 400;

// Mapeamento: nome da tabela SQLite → nome da coleção no Firebase
const TABLE_MAP = {
  medicamentos:   "Medicamento",
  lotes:          "Lote",
  entradas:       "Entrada",
  saidas:         "Saida",
  fornecedores:   "Fornecedor",
  alas:           "Ala",
  emprestimos:    "Emprestimo",
  categorias:     "Categoria",
  inventarios:    "Inventario",
  inventario_itens: "InventarioItem",
  // Também tenta nomes no singular/plural variado
  medicamento:    "Medicamento",
  lote:           "Lote",
  entrada:        "Entrada",
  saida:          "Saida",
  fornecedor:     "Fornecedor",
  ala:            "Ala",
  emprestimo:     "Emprestimo",
  categoria:      "Categoria",
  inventario:     "Inventario",
  inventario_item: "InventarioItem",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Pausa para liberar memória entre lotes
const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendToFirebase(collectionName, rows) {
  if (rows.length === 0) return 0;

  let sent = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db._app ? db : db);
    const firestoreBatch = writeBatch(getFirestore(app));

    for (const row of chunk) {
      // Converte campos snake_case para camelCase e limpa dados
      const clean = {};
      for (const [key, val] of Object.entries(row)) {
        // Mapeia campos comuns
        const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        clean[camel] = val !== null && val !== undefined ? val : "";
      }

      // Garante que tem id
      const itemId = String(clean.id || row.id || "");
      clean.updatedAt = clean.updatedAt || clean.updated_at || new Date().toISOString();
      clean.createdAt = clean.createdAt || clean.created_at || new Date().toISOString();

      let ref;
      if (itemId && !itemId.startsWith("local_")) {
        ref = doc(db, collectionName, itemId);
      } else {
        ref = doc(collection(db, collectionName));
        clean.id = ref.id;
      }

      firestoreBatch.set(ref, clean, { merge: true });
    }

    try {
      await firestoreBatch.commit();
      sent += chunk.length;
      const percent = Math.round((i + chunk.length) / rows.length * 100);
      process.stdout.write(`  ✓ ${sent}/${rows.length} itens (${percent}%)\r`);
    } catch (err) {
      console.error(`\n  ❌ Erro no lote de ${collectionName}:`, err.message);
      if (err.message.includes("Missing or insufficient permissions")) {
        console.error("  ⛔ PERMISSÃO NEGADA! Verifique as Regras do Firebase:");
        console.error("     allow read, write: if true;");
        process.exit(1);
      }
    }

    await pause(150);
  }
  return sent;
}

async function main() {
  // Descobre o arquivo .db a usar
  let dbPath = process.argv[2];

  if (!dbPath) {
    // Procura automaticamente por arquivos .db na pasta
    const files = readdirSync(__dirname).filter(f => f.endsWith(".db") || f.endsWith(".sqlite"));
    if (files.length === 0) {
      console.error("❌ Nenhum arquivo .db encontrado nesta pasta!");
      console.log("\nColoque o arquivo de backup (.db) nesta pasta e execute novamente:");
      console.log("   node sync-to-firebase.js");
      console.log("\nOu especifique o caminho completo:");
      console.log("   node sync-to-firebase.js C:\\caminho\\para\\backup.db");
      process.exit(1);
    }
    if (files.length === 1) {
      dbPath = join(__dirname, files[0]);
      console.log(`✅ Arquivo encontrado automaticamente: ${files[0]}`);
    } else {
      console.log("📁 Vários arquivos .db encontrados:");
      files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
      dbPath = join(__dirname, files[0]);
      console.log(`\n➡ Usando o primeiro: ${files[0]}`);
      console.log("   (Para usar outro: node sync-to-firebase.js nome-do-arquivo.db)\n");
    }
  }

  if (!existsSync(dbPath)) {
    console.error(`❌ Arquivo não encontrado: ${dbPath}`);
    process.exit(1);
  }

  console.log(`\n📂 Abrindo banco de dados: ${dbPath}`);

  let sqliteDb;
  try {
    sqliteDb = new Database(dbPath, { readonly: true });
  } catch (e) {
    console.error("❌ Erro ao abrir o arquivo .db:", e.message);
    process.exit(1);
  }

  // Lista todas as tabelas
  const tables = sqliteDb.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all().map(r => r.name);

  console.log(`\n📋 Tabelas encontradas no banco: ${tables.join(", ")}\n`);

  let totalSent = 0;
  let tablesProcessed = 0;

  for (const tableName of tables) {
    const collectionName = TABLE_MAP[tableName.toLowerCase()];
    if (!collectionName) {
      console.log(`⚠ Tabela '${tableName}' não mapeada → ignorando`);
      continue;
    }

    let rows;
    try {
      rows = sqliteDb.prepare(`SELECT * FROM "${tableName}"`).all();
    } catch (e) {
      console.warn(`⚠ Erro ao ler tabela ${tableName}:`, e.message);
      continue;
    }

    if (rows.length === 0) {
      console.log(`○ ${tableName} (${collectionName}): vazio → pulando`);
      continue;
    }

    console.log(`\n→ ${tableName} → ${collectionName}: ${rows.length} itens`);
    const sent = await sendToFirebase(collectionName, rows);
    totalSent += sent;
    tablesProcessed++;
    console.log(`  ✅ Concluído!\n`);

    await pause(300);
  }

  sqliteDb.close();

  console.log("═══════════════════════════════════════════");
  console.log(`✅ SINCRONIZAÇÃO CONCLUÍDA!`);
  console.log(`   ${tablesProcessed} tabelas processadas`);
  console.log(`   ${totalSent} itens enviados para o Firebase`);
  console.log("═══════════════════════════════════════════");

  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Erro fatal:", err.message);
  process.exit(1);
});
