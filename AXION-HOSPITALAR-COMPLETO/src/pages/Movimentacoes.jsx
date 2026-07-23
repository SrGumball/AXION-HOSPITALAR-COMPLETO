import Entradas from "./Entradas";
import { ArrowDownToLine } from "lucide-react";

export default function Movimentacoes() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Movimentações</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gerenciamento de Entradas do Estoque</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Entradas isTab={false} />
      </div>
    </div>
  );
}
