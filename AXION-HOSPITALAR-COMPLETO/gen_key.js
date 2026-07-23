import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

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

async function run() {
  const raw = `${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`.replace(/[^A-Z0-9]/g, 'X');
  const key = `AXION-${raw.substring(0,4)}-${raw.substring(4,8)}-${raw.substring(8,12)}`;
  
  const docRef = doc(collection(db, 'licenses'), key);
  await setDoc(docRef, {
    key,
    plan: 'Vitalício',
    months: 0,
    maxComputers: 10,
    offlineLimit: 15,
    activeComputers: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  });
  console.log('CHAVE GERADA:', key);
  process.exit(0);
}
run();
