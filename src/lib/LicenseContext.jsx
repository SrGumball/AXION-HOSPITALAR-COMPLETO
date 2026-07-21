import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateLicenseOnline, validateLicenseOffline, getSavedLicenseKey } from './license';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const LicenseContext = createContext();

export function useLicense() {
  return useContext(LicenseContext);
}

export function LicenseProvider({ children }) {
  const [licenseStatus, setLicenseStatus] = useState({ valid: true, checking: true, message: '' });
  const [showModal, setShowModal] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [loading, setLoading] = useState(false);

  const checkLicense = async () => {
    const savedKey = getSavedLicenseKey();
    
    // 1. Validação local / offline rápida
    const offlineCheck = validateLicenseOffline();
    
    if (!offlineCheck.valid) {
      if (navigator.onLine && savedKey) {
        // Se a local falhou por dias offline, mas tem internet, vamos tentar online
        const onlineCheck = await validateLicenseOnline(savedKey);
        setLicenseStatus({ valid: onlineCheck.valid, message: onlineCheck.message, checking: false });
        if (!onlineCheck.valid) setShowModal(true);
      } else {
        setLicenseStatus({ valid: false, message: offlineCheck.message, checking: false });
        setShowModal(true);
      }
      return;
    }

    // 2. Se offline está válido e tem internet, vamos sincronizar/validar online em background
    setLicenseStatus({ valid: true, message: 'Validado localmente', checking: false });
    
    if (navigator.onLine && savedKey) {
      validateLicenseOnline(savedKey).then(res => {
        if (!res.valid) {
          setLicenseStatus({ valid: false, message: res.message, checking: false });
          setShowModal(true);
        }
      });
    }
  };

  useEffect(() => {
    checkLicense();
    
    // Checa a cada 1 hora para manter sincronizado
    const interval = setInterval(checkLicense, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = async () => {
    if (!serialInput.trim()) return;
    
    setLoading(true);
    try {
      const result = await validateLicenseOnline(serialInput.trim());
      if (result.valid) {
        toast.success(result.message);
        setLicenseStatus({ valid: true, message: 'Ativado', checking: false });
        setShowModal(false);
        setSerialInput('');
      } else {
        toast.error(result.message || 'Chave inválida.');
      }
    } catch (e) {
      toast.error('Erro ao conectar com o servidor de validação.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    ...licenseStatus,
    openModal: () => setShowModal(true)
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}

      <Dialog open={showModal} onOpenChange={(open) => {
        // Se a licença for inválida, não permite fechar o modal clicando fora
        if (licenseStatus.valid) {
          setShowModal(open);
        }
      }}>
        <DialogContent className="sm:max-w-md" hideCloseButton={!licenseStatus.valid}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Ativação do Sistema
            </DialogTitle>
            <DialogDescription>
              {licenseStatus.message || 'Por favor, insira uma Serial Key válida para continuar utilizando o sistema Axion Saúde.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={serialInput}
              onChange={e => setSerialInput(e.target.value.toUpperCase())}
              className="text-center font-mono tracking-widest uppercase"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleActivate} disabled={loading || !serialInput} className="w-full">
              {loading ? 'Validando...' : 'Ativar Licença'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LicenseContext.Provider>
  );
}
