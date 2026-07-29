// import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { firestoreDb } from './firebase';
import { supabase } from './supabase';
export async function generateLicenseKey(planName, months, maxComputers, offlineLimit) {
  const raw = `${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`.replace(/[^A-Z0-9]/g, 'X');
  const key = `AXION-${raw.substring(0,4)}-${raw.substring(4,8)}-${raw.substring(8,12)}`;
  
  // const docRef = doc(collection(firestoreDb, 'licenses'), key);
  const licenseData = {
    id: key,
    key,
    plan: planName,
    months: parseInt(months, 10),
    maxComputers: parseInt(maxComputers, 10),
    offlineDaysLimit: parseInt(offlineLimit, 10),
    usedComputers: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  // await setDoc(docRef, licenseData);
  await supabase.from('licenses').insert(licenseData);
  return licenseData;
}

export async function getAllLicenses() {
  // const snapshot = await getDocs(collection(firestoreDb, 'licenses'));
  // return snapshot.docs.map(doc => doc.data());
  const { data, error } = await supabase.from('licenses').select('*');
  if (error) throw error;
  return data;
}

export async function revokeLicense(key) {
  // const docRef = doc(firestoreDb, 'licenses', key);
  // await updateDoc(docRef, { status: 'revoked' });
  await supabase.from('licenses').update({ status: 'revoked' }).eq('id', key);
}

export async function deleteLicense(key) {
  // const docRef = doc(firestoreDb, 'licenses', key);
  // await deleteDoc(docRef);
  await supabase.from('licenses').delete().eq('id', key);
}

export async function reactivateLicense(key) {
  // const docRef = doc(firestoreDb, 'licenses', key);
  // await updateDoc(docRef, { status: 'active' });
  await supabase.from('licenses').update({ status: 'active' }).eq('id', key);
}
