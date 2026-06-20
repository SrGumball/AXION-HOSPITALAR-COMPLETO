import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Entradas from "./Entradas";
import Saidas from "./Saidas";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Movimentacoes() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "saidas" ? "saidas" : "entradas";
  });

  // React if the URL changes (e.g. user navigates back with browser)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "saidas" || tab === "entradas") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Movimentações</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gerenciamento de Entradas e Saídas do Estoque</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="entradas" className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Entradas
          </TabsTrigger>
          <TabsTrigger value="saidas" className="flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            Saídas
          </TabsTrigger>
        </TabsList>
        <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <TabsContent value="entradas" className="m-0 border-none outline-none">
            <Entradas isTab={true} />
          </TabsContent>
          <TabsContent value="saidas" className="m-0 border-none outline-none">
            <Saidas isTab={true} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
