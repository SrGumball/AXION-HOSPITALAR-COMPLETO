import React, { useState, useEffect } from "react";
import { Pill, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Satelite() {
  const [prescricoes, setPrescricoes] = useState([]);

  useEffect(() => {
    loadPrescricoes();
  }, []);

  const loadPrescricoes = () => {
    const p = localStorage.getItem("hospital_prescricoes");
    if (p) setPrescricoes(JSON.parse(p).reverse());
  };

  const handleLiberar = (id) => {
    const updated = prescricoes.map(p => 
      p.id === id ? { ...p, status_farmacia: "Liberado" } : p
    );
    setPrescricoes(updated);
    localStorage.setItem("hospital_prescricoes", JSON.stringify(updated.slice().reverse()));
    toast.success("Medicação liberada para a Enfermagem!");
  };

  const pendentes = prescricoes.filter(p => p.status_farmacia === "Pendente");
  const liberadas = prescricoes.filter(p => p.status_farmacia === "Liberado").slice(0, 20); // show last 20

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          Farmácia Satélite
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Liberação de medicamentos prescritos pelo corpo clínico para a Enfermagem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pendentes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Aguardando Liberação</h2>
            <span className="ml-auto bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendentes.length}
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendentes.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhuma prescrição pendente.</div>
            ) : pendentes.map(p => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-slate-400" /> {p.medicamento}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <p><strong>Paciente:</strong> {p.pacienteNome} (Pront: {p.prontuario})</p>
                    <p><strong>Destino:</strong> {p.leito}</p>
                    <p><strong>Posologia:</strong> {p.posologia} - {p.via}</p>
                  </div>
                </div>
                <Button onClick={() => handleLiberar(p.id)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                  Liberar Medicação
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Liberadas recentemente */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Liberadas Recentemente</h2>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {liberadas.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhum histórico recente.</div>
            ) : liberadas.map(p => (
              <div key={p.id} className="p-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{p.medicamento}</h3>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-bold uppercase">
                    Liberado
                  </span>
                </div>
                <p className="text-xs text-slate-500">{p.pacienteNome} • {p.leito}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
