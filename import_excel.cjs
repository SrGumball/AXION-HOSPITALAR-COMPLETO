const XLSX = require("xlsx");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const excelPath = path.resolve("./Padronização  2026 e 2027 separada por class terapêutica NOVO.xls");
if (!fs.existsSync(excelPath)) {
    console.error("Excel file not found at:", excelPath);
    process.exit(1);
}

const dbPath = "/home/alef/.local/share/com.axion.saude/pharmacy.db";
if (!fs.existsSync(dbPath)) {
    console.error("Database not found at:", dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

// Ensure the padronizado column exists (Tauri migration should have done it, but just in case)
try {
    db.exec("ALTER TABLE Medicamento ADD COLUMN nome_comercial TEXT");
} catch(e) {}
try {
    db.exec("ALTER TABLE Medicamento ADD COLUMN padronizado BOOLEAN DEFAULT 0");
} catch(e) {}
try {
    db.exec("ALTER TABLE Medicamento ADD COLUMN estoque_satelite INTEGER DEFAULT 0");
} catch(e) {}

const workbook = XLSX.readFile(excelPath);

const sheetClinicos = workbook.Sheets["CLÍNICOS"];
const sheetPsico = workbook.Sheets["PSICOTRÓPICOS"];

function processSheet(sheetObj, baseCategoria) {
    if (!sheetObj) return [];
    
    // Convert to JSON, getting raw array of arrays to handle the weird headers
    const rows = XLSX.utils.sheet_to_json(sheetObj, { header: 1 });
    
    const results = [];
    let currentSubcategory = "";
    
    // Find the starting row
    let startIdx = 0;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i] && typeof rows[i][0] === "string" && rows[i][0].includes("NOME GENÉRICO")) {
            startIdx = i + 1;
            break;
        }
    }
    
    for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // If it only has 1 non-empty cell in the first column, it's a subcategory
        const col0 = row[0] ? row[0].toString().trim() : "";
        const col1 = row[1] ? row[1].toString().trim() : "";
        const col2 = row[2] ? row[2].toString().trim() : "";
        
        if (col0 && !col1 && !col2) {
            currentSubcategory = col0;
            continue;
        }
        
        if (col0 && col2) { // Genérico e Apresentação são obrigatórios
            let apresentacaoRaw = col2.toUpperCase();
            
            // Intelligence for abbreviations
            let unidade_medida = "";
            let apresentacao = apresentacaoRaw;
            
            if (apresentacaoRaw.includes("COMP") || apresentacaoRaw.includes("CP")) unidade_medida = "un";
            else if (apresentacaoRaw.includes("AMP") || apresentacaoRaw.includes("FR")) unidade_medida = "un";
            else if (apresentacaoRaw.includes("TB") || apresentacaoRaw.includes("TUBO")) {
                apresentacao = apresentacao.replace("TB", "TUBO");
                unidade_medida = "un";
            }
            else if (apresentacaoRaw.includes("GTS") || apresentacaoRaw.includes("GOTAS")) unidade_medida = "frasco";
            else if (apresentacaoRaw.includes("CX") || apresentacaoRaw.includes("CAIXA")) unidade_medida = "cx";
            else unidade_medida = "un"; // default
            
            results.push({
                nome: col0,
                nome_comercial: col1 || "",
                apresentacao: apresentacao,
                unidade_medida: unidade_medida,
                categoria: baseCategoria + (currentSubcategory ? " - " + currentSubcategory : ""),
            });
        }
    }
    
    return results;
}

const clinicos = processSheet(sheetClinicos, "CLÍNICOS");
const psicos = processSheet(sheetPsico, "PSICOTRÓPICOS");

const allMeds = [...clinicos, ...psicos];

console.log(`Found ${clinicos.length} Clínicos and ${psicos.length} Psicotrópicos. Total: ${allMeds.length}`);

let inserted = 0;
const stmt = db.prepare(`
    INSERT INTO Medicamento (id, nome, nome_comercial, apresentacao, unidade_medida, categoria, padronizado, ativo, estoque_minimo, estoque_atual)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, 0)
`);

db.transaction(() => {
    for (const med of allMeds) {
        // Simple check if it already exists to avoid duplicates if run multiple times
        const exists = db.prepare("SELECT id FROM Medicamento WHERE nome = ? AND apresentacao = ?").get(med.nome, med.apresentacao);
        if (!exists) {
            stmt.run(uuidv4(), med.nome, med.nome_comercial, med.apresentacao, med.unidade_medida, med.categoria);
            inserted++;
        }
    }
})();

console.log(`Successfully inserted ${inserted} new padronizado medications.`);

db.close();
