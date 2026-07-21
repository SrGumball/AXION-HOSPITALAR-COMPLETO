const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");

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

function parseApresentacao(raw) {
    let apr = "";
    let dos = "";
    const str = raw.toUpperCase();

    if (str.includes("COMP") || str.includes("CP")) {
        apr = "comprimido";
        dos = str.replace(/COMP|CP|RIMIDO/g, "").trim();
    } else if (str.includes("CAPS") || str.includes("CAP")) {
        apr = "capsula";
        dos = str.replace(/CAPSULA|CAPS|CAP/g, "").trim();
    } else if (str.includes("GOTAS") || str.includes("GTS")) {
        apr = "gotas";
        dos = str.replace(/GOTAS|GTS/g, "").trim();
    } else if (str.includes("XPE") || str.includes("XAROPE")) {
        apr = "xarope";
        dos = str.replace(/XAROPE|XPE/g, "").trim();
    } else if (str.includes("AMP")) {
        apr = "ampola";
        dos = str.replace(/AMPOLA|AMP/g, "").trim();
    } else if (str.includes("ENV")) {
        apr = "envelope";
        dos = str.replace(/ENVELOPE|ENV/g, "").trim();
    } else if (str.includes("TB") || str.includes("TUBO") || str.includes("CREME") || str.includes("POM")) {
        apr = "tubo";
        dos = str.replace(/CREME|POMADA|POM|TUBO|TB/g, "").trim();
    } else if (str.includes("FR")) {
        apr = "frasco";
        dos = str.replace(/FRASCO|FR/g, "").trim();
    } else if (str.includes("INJ")) {
        apr = "injetavel";
        dos = str.replace(/INJ/g, "").trim();
    } else if (str.includes("SUP")) {
        apr = "supositorio";
        dos = str.replace(/SUPOSITORIO|SUP/g, "").trim();
    } else if (str.includes("SPRAY")) {
        apr = "spray";
        dos = str.replace(/SPRAY/g, "").trim();
    } else if (str.includes("SACHE")) {
        apr = "sache";
        dos = str.replace(/SACHE/g, "").trim();
    } else {
        apr = "";
        dos = str;
    }

    // Clean up trailing/leading dashes or spaces
    dos = dos.replace(/^[-:\s]+/, "").replace(/[-:\s]+$/, "");
    if (dos === "" || dos === "S/C" || dos === "-") {
        dos = "-";
    }

    return { apresentacao: apr, unidade_medida: dos };
}

async function main() {
    const snap = await getDocs(collection(db, "Medicamento"));
    const batch = writeBatch(db);
    let count = 0;

    for (const d of snap.docs) {
        const data = d.data();
        // Só atualizar os que foram padronizados agora (que devem ter unidade_medida == "un" ou "cx" ou "frasco")
        // Ou simplesmente atualizar todos os padronizado == 1
        if (data.padronizado === 1) {
            // The raw presentation is currently stored in data.apresentacao (e.g. "ENV 600 MG")
            const parsed = parseApresentacao(data.apresentacao);
            
            // Only update if it actually parsed a known type
            if (parsed.apresentacao !== "") {
                batch.update(doc(db, "Medicamento", d.id), {
                    apresentacao: parsed.apresentacao,
                    unidade_medida: parsed.unidade_medida,
                    updatedAt: new Date().toISOString()
                });
                count++;
                console.log(`Original: ${data.apresentacao} -> Apres: ${parsed.apresentacao}, Dos: ${parsed.unidade_medida}`);
            }
        }
    }

    if (count > 0) {
        console.log(`Atualizando ${count} medicamentos...`);
        await batch.commit();
        console.log("Atualizacao concluida!");
    }
}

main().catch(console.error);
