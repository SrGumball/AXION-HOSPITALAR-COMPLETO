const XLSX = require("xlsx");
const path = require("path");

const excelPath = path.resolve("./Padronização  2026 e 2027 separada por class terapêutica NOVO.xls");
const workbook = XLSX.readFile(excelPath);

const sheetClinicos = workbook.Sheets["CLÍNICOS"];
const sheetPsico = workbook.Sheets["PSICOTRÓPICOS"];

function processSheet(sheetObj, baseCategoria) {
    if (!sheetObj) return [];
    const rows = XLSX.utils.sheet_to_json(sheetObj, { header: 1 });
    const results = [];
    let currentSubcategory = "";
    
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
        
        const col0 = row[0] ? row[0].toString().trim() : "";
        const col1 = row[1] ? row[1].toString().trim() : "";
        const col2 = row[2] ? row[2].toString().trim() : "";
        
        if (col0 && !col1 && !col2) {
            currentSubcategory = col0;
            continue;
        }
        if (col0 && col2) {
            results.push({
                nome: col0
            });
        }
    }
    return results;
}

const clinicos = processSheet(sheetClinicos, "CLÍNICOS");
const psicos = processSheet(sheetPsico, "PSICOTRÓPICOS");
const allMeds = [...clinicos, ...psicos];

console.log(`Found ${clinicos.length} Clínicos and ${psicos.length} Psicotrópicos. Total: ${allMeds.length}`);
