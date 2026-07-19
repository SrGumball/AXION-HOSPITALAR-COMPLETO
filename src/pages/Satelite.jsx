import React, { useState } from "react";
import { Pill, CheckCircle2, AlertCircle, Package, Search, ShieldAlert, FileText, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";

export default function Satelite() {
  const [paciente, setPaciente] = useState("");
  const [buscaMed, setBuscaMed] = useState("");
  const [medSelecionado, setMedSelecionado] = useState(null);
  const [liberadas, setLiberadas] = useState([]);

  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const medsFiltrados = buscaMed.length > 2 
    ? medicamentos.filter(m => m.nome.toLowerCase().includes(buscaMed.toLowerCase()))
    : [];

  const handleSelecionarMed = (med) => {
    setMedSelecionado(med);
    setBuscaMed(med.nome);
  };

  const handleDispensar = () => {
    if (!paciente || !medSelecionado) {
      toast.error("Preencha Paciente e selecione o Medicamento.");
      return;
    }

    const novaLiberacao = {
      id: Date.now(),
      paciente,
      medicamento: medSelecionado.nome,
      data: new Date().toLocaleTimeString()
    };

    setLiberadas([novaLiberacao, ...liberadas]);
    toast.success("Medicação dispensada com sucesso!");
    
    // Limpar form
    setPaciente("");
    setBuscaMed("");
    setMedSelecionado(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          Farmácia Satélite
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dispensação manual de medicamentos para pacientes internados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Painel de Dispensação */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500" /> Nova Dispensação
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Paciente</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input 
                    placeholder="Nome do paciente..." 
                    className="pl-10" 
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-slate-700">Medicamento</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input 
                  placeholder="Digite para buscar o medicamento..." 
                  className="pl-10"
                  value={buscaMed}
                  onChange={(e) => {
                    setBuscaMed(e.target.value);
                    if(medSelecionado && e.target.value !== medSelecionado.nome) {
                      setMedSelecionado(null);
                    }
                  }}
                />
              </div>
              
              {/* Autocomplete Dropdown */}
              {buscaMed.length > 2 && !medSelecionado && medsFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                  {medsFiltrados.map(med => (
                    <div 
                      key={med.id} 
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-100 last:border-0"
                      onClick={() => handleSelecionarMed(med)}
                    >
                      <div className="font-medium text-sm text-slate-700 dark:text-slate-200">{med.nome}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleDispensar} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 h-12 text-md shadow-lg shadow-blue-600/20">
              Dispensar Medicamento
            </Button>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Dispensações Realizadas</h2>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto p-2">
            {liberadas.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhum histórico recente.</div>
            ) : liberadas.map(p => (
              <div key={p.id} className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{p.medicamento}</h3>
                  <span className="text-xs text-slate-400">{p.data}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{p.paciente}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
