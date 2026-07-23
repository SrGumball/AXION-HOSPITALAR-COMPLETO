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

  const batch = writeBatch(db);
  let updates = 0;

  for (const d of snap.docs) {
    batch.update(doc(db, "Medicamento", d.id), { padronizado: 0, updatedAt: new Date().toISOString() });
    updates++;
  }

  if (updates > 0) {
    console.log("Revertendo para nao-padronizado no Firebase...");
    await batch.commit();
    console.log("Reverts aplicados: ", updates);
  }

  process.exit(0);
}
main();
