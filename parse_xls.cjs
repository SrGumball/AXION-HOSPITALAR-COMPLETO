const XLSX = require("xlsx");
const workbook = XLSX.readFile("Padronização  2026 e 2027 separada por class terapêutica NOVO.xls");
const result = {};
workbook.SheetNames.forEach(sheetName => {
    result[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]).slice(0, 5);
});
console.log(JSON.stringify(result, null, 2));
