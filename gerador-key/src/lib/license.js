import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';

export async function generateLicenseKey(planName, months, maxComputers, offlineLimit) {
  const raw = `${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`.replace(/[^A-Z0-9]/g, 'X');
  const key = `AXION-${raw.substring(0,4)}-${raw.substring(4,8)}-${raw.substring(8,12)}`;
  
  const docRef = doc(collection(firestoreDb, 'licenses'), key);
  const licenseData = {
    key,
    plan: planName,
    months: parseInt(months, 10),
    maxComputers: parseInt(maxComputers, 10),
    offlineLimit: parseInt(offlineLimit, 10),
    activeComputers: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  await setDoc(docRef, licenseData);
  return licenseData;
}

export async function getAllLicenses() {
  const snapshot = await getDocs(collection(firestoreDb, 'licenses'));
  return snapshot.docs.map(doc => doc.data());
}

export async function revokeLicense(key) {
  const docRef = doc(firestoreDb, 'licenses', key);
  await updateDoc(docRef, { status: 'revoked' });
}

export async function deleteLicense(key) {
  const docRef = doc(firestoreDb, 'licenses', key);
  await deleteDoc(docRef);
}

export async function reactivateLicense(key) {
  const docRef = doc(firestoreDb, 'licenses', key);
  await updateDoc(docRef, { status: 'active' });
}
