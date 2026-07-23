import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Key, Copy, Check, Trash2, Ban, ShieldCheck, LogOut } from 'lucide-react';
import { generateLicenseKey, getAllLicenses, revokeLicense, deleteLicense, reactivateLicense } from '../lib/license';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState([]);
  
  const [plan, setPlan] = useState('1');
  const [maxComputers, setMaxComputers] = useState('1');
  const [offlineLimit, setOfflineLimit] = useState('15');
  
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) {
      navigate('/');
      return;
    }
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const data = await getAllLicenses();
      setLicenses(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      toast.error('Erro ao carregar licenças');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const months = parseInt(plan, 10);
      const planName = months === 0 ? 'Vitalício' : `${months} Meses`;
      
      const license = await generateLicenseKey(planName, months, maxComputers, offlineLimit);
      setGeneratedKey(license.key);
      setCopied(false);
      toast.success('Chave gerada com sucesso!');
      fetchLicenses();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar chave. Verifique a conexão com o banco.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success('Chave copiada para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleRevoke = async (key) => {
    if (window.confirm('Tem certeza que deseja BLOQUEAR esta licença? O cliente perderá o acesso.')) {
      await revokeLicense(key);
      toast.success('Licença bloqueada.');
      fetchLicenses();
    }
  };

  const handleReactivate = async (key) => {
    await reactivateLicense(key);
    toast.success('Licença reativada.');
    fetchLicenses();
  };

  const handleDelete = async (key) => {
    if (window.confirm('Tem certeza que deseja EXCLUIR esta licença definitivamente?')) {
      await deleteLicense(key);
      toast.success('Licença excluída.');
      fetchLicenses();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Axion Admin Center</h1>
              <p className="text-slate-500 text-sm">Gerenciador de Licenças</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gerador de Chave */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-blue-500" />
              Nova Licença
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Plano (Validade)</label>
                <select 
                  value={plan} 
                  onChange={e => setPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1">1 Mês</option>
                  <option value="3">3 Meses</option>
                  <option value="6">6 Meses</option>
                  <option value="12">1 Ano</option>
                  <option value="0">Vitalício</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Máx. Computadores Simultâneos</label>
                <input 
                  type="number" 
                  min="1" 
                  value={maxComputers}
                  onChange={e => setMaxComputers(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Limite Offline (Dias)</label>
                <select 
                  value={offlineLimit} 
                  onChange={e => setOfflineLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="7">7 Dias</option>
                  <option value="15">15 Dias</option>
                  <option value="30">30 Dias</option>
                </select>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading} 
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mt-2 disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar Chave (Serial Key)'}
              </button>

              {generatedKey && (
                <div className="mt-4 p-4 border border-blue-500/30 rounded-xl bg-blue-500/5 flex flex-col items-center justify-center space-y-3">
                  <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Chave Gerada</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-bold tracking-widest text-blue-100">
                      {generatedKey}
                    </code>
                    <button onClick={copyToClipboard} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Licenças */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Licenças Ativas no Banco de Dados</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-3 font-medium text-sm">Chave (Serial)</th>
                    <th className="pb-3 font-medium text-sm">Plano</th>
                    <th className="pb-3 font-medium text-sm">Computadores</th>
                    <th className="pb-3 font-medium text-sm">Criado em</th>
                    <th className="pb-3 font-medium text-sm">Status</th>
                    <th className="pb-3 font-medium text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {licenses.map(lic => (
                    <tr key={lic.key} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-sm font-mono text-slate-300">{lic.key}</td>
                      <td className="py-4 text-sm text-slate-400">{lic.plan}</td>
                      <td className="py-4 text-sm text-slate-400">
                        <span className="text-slate-300">{lic.activeComputers?.length || 0}</span> / {lic.maxComputers}
                      </td>
                      <td className="py-4 text-sm text-slate-400">
                        {new Date(lic.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4">
                        {lic.status === 'revoked' ? (
                          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full font-medium">Bloqueada</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium">Ativa</span>
                        )}
                      </td>
                      <td className="py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lic.status === 'revoked' ? (
                          <button onClick={() => handleReactivate(lic.key)} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-md" title="Reativar">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleRevoke(lic.key)} className="p-1.5 text-orange-400 hover:bg-orange-400/10 rounded-md" title="Bloquear">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(lic.key)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">
                        Nenhuma licença encontrada no banco de dados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
