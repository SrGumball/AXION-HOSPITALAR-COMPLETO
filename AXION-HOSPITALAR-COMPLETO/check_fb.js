import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

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
  const q = query(collection(db, "Medicamento"), limit(10));
  const snap = await getDocs(q);
  console.log("Total docs fetched:", snap.docs.length);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`Nome: ${data.nome} | padronizado: ${data.padronizado} (type: ${typeof data.padronizado})`);
  });
  process.exit(0);
}
main();
