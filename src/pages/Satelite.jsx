import { useState, useMemo } from "react";
import Saidas from "./Saidas";
import { getApresentacaoEDosagem } from "./Medicamentos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowUpFromLine, LayoutDashboard, Building2, Stethoscope, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function PainelDashboard() {
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const { data: saidas = [] } = useQuery({
    queryKey: ['saidas'],
    queryFn: () => db.entities.Saida.list(),
  });

  const stats = useMemo(() => {
    let totalSatelite = 0;
    let uniqueMeds = 0;
    let criticoSatelite = 0;
    
    // Calculate stock stats
    medicamentos.forEach(m => {
      const sateliteStock = m.estoque_satelite || 0;
      if (sateliteStock > 0) {
        totalSatelite += sateliteStock;
        uniqueMeds++;
      }
      if (sateliteStock > 0 && sateliteStock <= 5) {
        criticoSatelite++;
      }
    });

    // Calculate today's dispenses
    const todaySaidas = saidas.filter(s => {
      if (!s.data_saida) return false;
      try {
        // Ignora transferências no dashboard do satélite
        if (s.motivo === "Transferência de Estoque") return false;
        return isToday(parseISO(s.data_saida));
      } catch (e) {
        return false;
      }
    });

    const dispensesToday = todaySaidas.length;

    // Chart Data: Top 8 with most stock in satellite
    const chartData = medicamentos
      .filter(m => (m.estoque_satelite || 0) > 0)
      .sort((a, b) => (b.estoque_satelite || 0) - (a.estoque_satelite || 0))
      .slice(0, 8)
      .map(m => ({
        name: m.nome.substring(0, 15) + (m.nome.length > 15 ? '...' : ''),
        "Volume em Estoque": m.estoque_satelite || 0,
      }));

    // Recent Dispenses (Last 10)
    const recentSaidas = saidas
      .filter(s => s.motivo !== "Transferência de Estoque")
      .sort((a, b) => new Date(b.created_at || b.data_saida) - new Date(a.created_at || a.data_saida))
      .slice(0, 8);

    return { totalSatelite, uniqueMeds, criticoSatelite, dispensesToday, chartData, recentSaidas };
  }, [medicamentos, saidas]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow bg-indigo-50/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Unidades Disponíveis</p>
              <h3 className="text-3xl font-bold text-indigo-700 mt-1">{stats.totalSatelite}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
            Total de comprimidos/frascos
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Medicamentos Únicos</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.uniqueMeds}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Stethoscope className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
            Tipos diferentes de medicamentos
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Itens Acabando</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.criticoSatelite}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Estoque menor que 5
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Dispensações (Hoje)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.dispensesToday}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ArrowUpFromLine className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
            Saídas registradas hoje
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <Card className="p-6 col-span-2 shadow-sm border border-slate-200 h-full flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top 8 Maior Volume (Satélite)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Volume em Estoque" fill="#6366f1" radius={[4, 4, 0, 0]} name="Unidades no Satélite" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Saídas Recentes</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.recentSaidas.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-10">Nenhuma saída recente.</p>
            ) : (
              stats.recentSaidas.map(saida => (
                <div key={saida.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center group hover:bg-slate-100 transition-colors">
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs text-slate-700 truncate" title={saida.medicamento_nome}>
                      {saida.medicamento_nome}
                    </p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[10px] text-slate-500 font-mono">{saida.ala_nome || "Sem Ala"}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 shadow-sm">
                      -{saida.quantidade}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function EstoqueSateliteList() {
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const sateliteMeds = medicamentos
    .filter(m => (m.estoque_satelite || 0) > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="p-4 bg-white border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Itens na Farmácia Satélite</h3>
        <p className="text-xs text-slate-500">Medicamentos atualmente disponíveis para dispensação</p>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-24">Cód.</TableHead>
              <TableHead>Medicamento</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sateliteMeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum medicamento na farmácia satélite.
                </TableCell>
              </TableRow>
            ) : (
              sateliteMeds.map(med => (
                <TableRow key={med.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {med.codigo || "S/C"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{med.nome}</TableCell>
                  <TableCell className="text-right font-bold text-indigo-700">
                    {med.estoque_satelite}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { ClipboardCheck, Printer } from "lucide-react";

function FolhaEvolucaoList() {
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const medsSorted = useMemo(() => {
    return [...medicamentos].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [medicamentos]);

  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-white dark:bg-slate-900 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Folha de Evolução e Requisição de Insumos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Planilha padronizada de medicamentos com campos em branco (Pedida / Atendida) para preenchimento manual a caneta.
          </p>
        </div>
        <Button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-md"
        >
          <Printer className="w-4 h-4" />
          Imprimir Folha de Evolução
        </Button>
      </div>

        {/* ÁREA IMPRESSA / VISUALIZAÇÃO A4 ULTRA COMPACTA */}
        <div className="print:p-0">
          {/* Cabeçalho da Folha Físico de Impressão */}
          <div className="hidden print:block mb-3 border-b border-slate-900 pb-1.5">
            <h1 className="text-sm font-black text-center uppercase tracking-wider text-slate-900">
              FOLHA DE EVOLUÇÃO E PEDIDO DE MEDICAMENTOS — FARMÁCIA SATÉLITE
            </h1>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-800 mt-2">
              <div>Data: ____/____/________</div>
              <div>Setor / Ala: __________________</div>
              <div>Turno: (  ) Manhã  (  ) Tarde  (  ) Noite</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="border-collapse border border-slate-400 dark:border-slate-800 w-full text-[11px] print:text-[10px]">
              <TableHeader className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <TableRow className="print:h-5">
                  <TableHead className="border border-slate-400 font-bold text-slate-900 py-1 px-2">Nome do Medicamento</TableHead>
                  <TableHead className="border border-slate-400 font-bold text-slate-900 w-24 py-1 px-2">Dosagem</TableHead>
                  <TableHead className="border border-slate-400 font-bold text-slate-900 w-28 py-1 px-2">Apresentação</TableHead>
                  <TableHead className="border border-slate-400 font-bold text-slate-900 text-center w-20 py-1 px-1">Qtd. Pedida</TableHead>
                  <TableHead className="border border-slate-400 font-bold text-slate-900 text-center w-20 py-1 px-1">Qtd. Atendida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medsSorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                      Nenhum medicamento cadastrado na padronização.
                    </TableCell>
                  </TableRow>
                ) : (
                  medsSorted.map((med) => {
                    const info = getApresentacaoEDosagem(med);
                    return (
                      <TableRow key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 print:h-5">
                        <TableCell className="border border-slate-400 font-semibold text-slate-900 dark:text-slate-100 py-0.5 px-2">
                          {med.nome}
                        </TableCell>
                        <TableCell className="border border-slate-400 font-mono text-slate-900 dark:text-slate-100 font-bold py-0.5 px-2">
                          {info.dosagem}
                        </TableCell>
                        <TableCell className="border border-slate-400 text-slate-700 dark:text-slate-300 py-0.5 px-2">
                          {info.apresentacao}
                        </TableCell>
                        <TableCell className="border border-slate-400 text-center py-0.5 px-1 h-5 bg-slate-50/20">
                          {/* Espaço em branco para escrita manual a caneta */}
                        </TableCell>
                        <TableCell className="border border-slate-400 text-center py-0.5 px-1 h-5 bg-slate-50/20">
                          {/* Espaço em branco para escrita manual a caneta */}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé de Impressão — Apenas Farmacêutico */}
          <div className="hidden print:flex flex-col items-center justify-center mt-4 pt-3 border-t border-slate-400 text-center text-xs">
            <div className="w-64 border-b border-slate-900 h-6 mb-1"></div>
            <p className="font-bold text-slate-900 text-[11px] uppercase">Assinatura do Farmacêutico Responsável</p>
            <p className="text-slate-600 text-[9px]">CRF: __________________ • Farmácia Satélite</p>
          </div>
        </div>
    </Card>
  );
}

export default function Satelite() {
  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Satélite</h1>
        <p className="text-slate-500 text-sm">Visão geral, controle de estoque e evolução da farmácia satélite</p>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full flex-1 flex flex-col">
        <TabsList className="w-fit bg-slate-100/50 p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="estoque" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Estoque Atual</TabsTrigger>
          <TabsTrigger value="evolucao" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Evolução
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="flex-1 mt-4">
          <PainelDashboard />
        </TabsContent>
        
        <TabsContent value="estoque" className="flex-1 mt-4">
          <EstoqueSateliteList />
        </TabsContent>

        <TabsContent value="evolucao" className="flex-1 mt-4">
          <FolhaEvolucaoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
