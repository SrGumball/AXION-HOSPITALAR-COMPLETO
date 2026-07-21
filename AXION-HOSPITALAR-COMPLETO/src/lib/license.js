import { collection, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { addDays, differenceInDays, isAfter } from 'date-fns';

const LICENSE_KEY_LOCAL = 'axion_license_key';
const MACHINE_ID_LOCAL = 'axion_machine_id';
const LAST_VALIDATION_LOCAL = 'axion_last_validation';

// Obter ou criar um ID persistente para este computador
export function getMachineId() {
  let machineId = localStorage.getItem(MACHINE_ID_LOCAL);
  if (!machineId) {
    machineId = uuidv4();
    localStorage.setItem(MACHINE_ID_LOCAL, machineId);
  }
  return machineId;
}

// Obter a chave salva localmente
export function getSavedLicenseKey() {
  return localStorage.getItem(LICENSE_KEY_LOCAL);
}

// Verifica a licença no Firebase (Online)
// Retorna: { valid: boolean, message: string, data?: any }
export async function validateLicenseOnline(serialKey) {
  try {
    const docRef = doc(firestoreDb, 'licenses', serialKey);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { valid: false, message: 'Chave de licença inválida ou não encontrada.' };
    }

    const data = docSnap.data();
    const now = new Date();

    // 1. Verifica se expirou
    if (data.expiresAt) {
      const expiryDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
      if (isAfter(now, expiryDate)) {
        return { valid: false, message: 'Esta licença expirou.' };
      }
    }

    // 2. Verifica se a máquina já está registrada
    const machineId = getMachineId();
    let usedComputers = data.usedComputers || [];

    if (!usedComputers.includes(machineId)) {
      // Máquina nova tentando usar a chave
      if (usedComputers.length >= (data.maxComputers || 1)) {
        return { valid: false, message: 'Limite de computadores excedido para esta chave.' };
      }
      // Registra a máquina
      usedComputers.push(machineId);
      await updateDoc(docRef, {
        usedComputers
      });
    }

    // Sucesso - Salva os dados locais para validação offline
    localStorage.setItem(LICENSE_KEY_LOCAL, serialKey);
    localStorage.setItem(LAST_VALIDATION_LOCAL, now.toISOString());
    
    // Guarda no localStorage também os limites para uso offline
    localStorage.setItem('axion_offline_limit', data.offlineDaysLimit?.toString() || '15');
    if (data.expiresAt) {
      const expiryDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
      localStorage.setItem('axion_license_expiry', expiryDate.toISOString());
    } else {
      localStorage.removeItem('axion_license_expiry'); // Vitalício
    }

    return { valid: true, message: 'Licença ativada com sucesso!', data };

  } catch (error) {
    console.error("Erro ao validar licença online:", error);
    // Se der erro de rede, tenta validar offline (fallback)
    return validateLicenseOffline();
  }
}

// Verifica a licença baseada no estado local (Offline)
export function validateLicenseOffline() {
  const serialKey = getSavedLicenseKey();
  const lastValidationStr = localStorage.getItem(LAST_VALIDATION_LOCAL);
  const offlineLimitStr = localStorage.getItem('axion_offline_limit') || '15';
  const expiryStr = localStorage.getItem('axion_license_expiry');

  if (!serialKey || !lastValidationStr) {
    return { valid: false, message: 'Nenhuma licença ativa encontrada neste computador.', requireKey: true };
  }

  const lastValidation = new Date(lastValidationStr);
  const now = new Date();

  // 1. Verificar expiração absoluta da chave
  if (expiryStr) {
    const expiryDate = new Date(expiryStr);
    if (isAfter(now, expiryDate)) {
      return { valid: false, message: 'Sua licença expirou.', requireKey: true };
    }
  }

  // 2. Verificar limite de dias offline
  const offlineDaysLimit = parseInt(offlineLimitStr, 10);
  const daysSinceLastValidation = differenceInDays(now, lastValidation);

  if (daysSinceLastValidation > offlineDaysLimit) {
    return { 
      valid: false, 
      message: `Tempo máximo sem internet (${offlineDaysLimit} dias) excedido. Conecte à internet para revalidar.`,
      requireInternet: true
    };
  }

  return { valid: true, message: 'Licença local validada com sucesso.' };
}

// Função utilitária para gerar nova chave (chamada na tela de admin)
export async function generateLicenseKey(planName, months, maxComputers, offlineDaysLimit) {
  const newKey = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  // Exemplo: 8D72A6F1C2B4E93F -> Formatar para 8D72-A6F1-C2B4-E93F
  const formattedKey = newKey.match(/.{1,4}/g).join('-');

  let expiresAt = null;
  if (months > 0) {
    expiresAt = addDays(new Date(), months * 30);
  }

  const licenseData = {
    key: formattedKey,
    plan: planName,
    maxComputers: parseInt(maxComputers, 10),
    usedComputers: [],
    createdAt: new Date(),
    offlineDaysLimit: parseInt(offlineDaysLimit, 10),
  };

  if (expiresAt) {
    licenseData.expiresAt = expiresAt;
  }

  const docRef = doc(firestoreDb, 'licenses', formattedKey);
  await setDoc(docRef, licenseData);

  return licenseData;
}

export function removeLocalLicense() {
  localStorage.removeItem(LICENSE_KEY_LOCAL);
  localStorage.removeItem(LAST_VALIDATION_LOCAL);
  localStorage.removeItem('axion_offline_limit');
  localStorage.removeItem('axion_license_expiry');
}
