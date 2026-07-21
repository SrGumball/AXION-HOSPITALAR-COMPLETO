const XLSX = require("xlsx");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, writeBatch, doc } = require("firebase/firestore");
const { v4: uuidv4 } = require("uuid");

const firebaseConfig = {
  apiKey: "AIzaSyCuT1iqlYge9NOltYNrJNzOd8HgdhPfO18",
  authDomain: "caislins.firebaseapp.com",
  projectId: "caislins",
  storageBucket: "caislins.firebasestorage.app",
  messagingSenderId: "966199346132",
  appId: "1:966199346132:web:fde5fd93ccaaae75fb0c41"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
            let apresentacaoRaw = col2.toUpperCase();
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
            else unidade_medida = "un";
            
            results.push({
                nome: col0,
                nome_comercial: col1 || "",
                apresentacao: apresentacao,
                unidade_medida: unidade_medida,
                categoria: baseCategoria + (currentSubcategory ? " - " + currentSubcategory : ""),
                padronizado: 1,
                ativo: 1,
                estoque_minimo: 0,
                estoque_atual: 0,
                estoque_satelite: 0,
                codigo: "" // Deixando vazio conforme pedido pelo usuário
            });
        }
    }
    return results;
}

async function main() {
    const clinicos = processSheet(sheetClinicos, "CLÍNICOS");
    const psicos = processSheet(sheetPsico, "PSICOTRÓPICOS");
    const allMeds = [...clinicos, ...psicos];

    console.log(`Encontrados ${allMeds.length} medicamentos padronizados.`);

    let batch = writeBatch(db);
    let count = 0;
    let total = 0;

    for (const med of allMeds) {
        const id = uuidv4();
        const docRef = doc(db, "Medicamento", id);
        const dataToSave = {
            id,
            ...med,
            created_at: new Date().toISOString(),
            updatedAt: new Date().toISOString() // Required for syncManager to pull it down
        };
        
        batch.set(docRef, dataToSave);
        count++;
        total++;

        if (count === 400) {
            console.log(`Enviando batch de ${count}...`);
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
        }
    }

    if (count > 0) {
        console.log(`Enviando ultimo batch de ${count}...`);
        await batch.commit();
    }

    console.log(`Total inserido no Firebase: ${total}`);
    process.exit(0);
}

main().catch(console.error);
