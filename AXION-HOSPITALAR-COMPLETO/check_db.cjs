const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.env.APPDATA, '..', 'Local', 'com.axion.saude', 'pharmacy.db');
const db = new Database(dbPath);

const padronizados = db.prepare("SELECT count(*) as count, padronizado FROM Medicamento GROUP BY padronizado").all();
console.log('Grouping by padronizado:', padronizados);

const sample = db.prepare("SELECT id, nome, padronizado FROM Medicamento LIMIT 5").all();
console.log('Sample medications:', sample);

// Also check the sync_manager pending_sync table to see if anything was uploaded
const syncs = db.prepare("SELECT count(*) as count FROM pending_sync").get();
console.log('Pending syncs:', syncs);
