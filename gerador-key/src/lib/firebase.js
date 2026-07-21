import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuT1iqlYge9NOltYNrJNzOd8HgdhPfO18",
  authDomain: "caislins.firebaseapp.com",
  projectId: "caislins",
  storageBucket: "caislins.firebasestorage.app",
  messagingSenderId: "966199346132",
  appId: "1:966199346132:web:fde5fd93ccaaae75fb0c41"
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
