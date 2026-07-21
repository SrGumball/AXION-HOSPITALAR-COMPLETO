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

async function main() {
    const snap = await getDocs(collection(db, "Medicamento"));
    let batch = writeBatch(db);
    let count = 0;
    let totalUpdates = 0;

    for (const d of snap.docs) {
        const data = d.data();
        let nome = data.nome;
        const dosagem = data.unidade_medida;

        if (nome && dosagem && dosagem !== "" && dosagem !== "-") {
            // Check if dosagem is in nome (case insensitive)
            const regex = new RegExp(`\\s*${dosagem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
            
            if (regex.test(nome)) {
                let novoNome = nome.replace(regex, ' ').trim();
                
                // Sometimes the name might end up with trailing hyphens or spaces if it was "NAME - DOSAGE"
                novoNome = novoNome.replace(/\s*-\s*$/, '').trim();
                novoNome = novoNome.replace(/\s+/, ' '); // remove double spaces

                if (novoNome !== nome) {
                    batch.update(doc(db, "Medicamento", d.id), {
                        nome: novoNome,
                        updatedAt: new Date().toISOString()
                    });
                    
                    console.log(`Atualizando: "${nome}" -> "${novoNome}" (removido: "${dosagem}")`);
                    count++;
                    totalUpdates++;
                    
                    // Firestore batches are limited to 500 operations
                    if (count === 450) {
                        await batch.commit();
                        console.log(`Commit de lote de 450...`);
                        batch = writeBatch(db);
                        count = 0;
                    }
                }
            }
        }
    }

    if (count > 0) {
        await batch.commit();
    }
    console.log(`Processo finalizado. Total de medicamentos atualizados: ${totalUpdates}`);
    process.exit(0);
}

main().catch(console.error);
