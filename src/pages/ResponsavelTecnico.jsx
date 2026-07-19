import { useState } from "react";
import { Users, UserPlus, ShieldCheck, Mail, Key } from "lucide-react";

export default function ResponsavelTecnico() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Painel do Responsável Técnico (RT)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestão técnica da farmácia e administração de usuários do sistema.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20 font-medium"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Voltar ao Painel" : "Cadastrar Usuário"}
        </button>
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            Novo Usuário do Sistema
          </h2>
          <form className="max-w-2xl space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" className="pl-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm outline-none focus:border-blue-500 transition-colors" placeholder="Ex: João Silva" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email / Login</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="email" className="pl-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm outline-none focus:border-blue-500 transition-colors" placeholder="joao@hospital.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Senha Inicial</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="password" className="pl-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm outline-none focus:border-blue-500 transition-colors">
                  <option>Estoque Central</option>
                  <option>Farmácia Satélite</option>
                  <option>Responsável Técnico</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
                Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Gestão de Usuários</h3>
            <p className="text-sm text-slate-500 mt-2">Controle os acessos ao estoque e farmácia satélite.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-medium text-sm hover:underline">Gerenciar Usuários &rarr;</button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Auditoria</h3>
            <p className="text-sm text-slate-500 mt-2">Acompanhe as ações e movimentações críticas no sistema.</p>
            <button className="mt-4 text-emerald-600 font-medium text-sm hover:underline">Ver Relatórios &rarr;</button>
          </div>
        </div>
      )}
    </div>
  );
}
