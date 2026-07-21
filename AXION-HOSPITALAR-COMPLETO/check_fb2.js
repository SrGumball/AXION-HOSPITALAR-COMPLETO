import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";

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
  console.log("Total docs em Medicamento:", snap.docs.length);
  let countComPadronizado = 0;
  let countSemPadronizado = 0;

  const batch = writeBatch(db);
  let updates = 0;

  for (const d of snap.docs) {
    const data = d.data();
    if (data.padronizado !== undefined && data.padronizado !== null && data.padronizado !== "") {
      countComPadronizado++;
    } else {
      countSemPadronizado++;
      batch.update(doc(db, "Medicamento", d.id), { padronizado: 1, updatedAt: new Date().toISOString() });
      updates++;
    }
  }

  console.log(`Com padronizado: ${countComPadronizado}, Sem: ${countSemPadronizado}`);
  
  if (updates > 0) {
    console.log("Executando update no Firebase...");
    await batch.commit();
    console.log("Updates aplicados: ", updates);
  }

  process.exit(0);
}
main();
