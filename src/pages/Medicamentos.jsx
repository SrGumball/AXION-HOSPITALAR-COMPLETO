import { useState } from "react";
import { db } from "@/api/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, Printer, Settings2, Lock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { isMav, isPsicotropico } from "@/utils/mavUtils";
import MedicamentoForm from "@/components/forms/MedicamentoForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIA_LABELS = {
  analgesico: "Analgésico",
  antitermico: "Antitérmico",
  anti_inflamatorio: "Anti-inflamatório",
  antibiotico: "Antibiótico",
  antialergico: "Antialérgico",
  antihipertensivo: "Antihipertensivo",
  antidiabetico: "Antidiabético",
  controlado: "Controlado",
  psicotropico: "Psicotrópico",
  hormonio: "Hormônio",
};

const APRESENTACAO_LABELS = {
  comprimido: "Comprimido",
  capsula: "Cápsula",
  gotas: "Gotas",
  xarope: "Xarope",
  injetavel: "Injetável",
  pomada: "Pomada",
  creme: "Creme",
  spray: "Spray",
  supositorio: "Supositório",
  envelope: "Envelope",
  shampoo: "Shampoo",
  ampola: "Ampola",
  tubo: "Tubo",
  frasco: "Frasco",
  seringa: "Seringa",
  sache: "Sachê",
};

export function getApresentacaoEDosagem(med) {
  if (!med) return { apresentacao: "-", dosagem: "-" };

  let rawApres = (med.apresentacao || med.forma || "").trim();
  let rawDosagem = (med.dosagem || med.concentracao || "").trim();
  let rawUnidade = (med.unidade_medida || "").trim();

  const mapSiglas = {
    'ENV': 'Envelope',
    'COMP': 'Comprimido',
    'CPR': 'Comprimido',
    'CAPS': 'Cápsula',
    'CAP': 'Cápsula',
    'TUBO': 'Tubo',
    'AMP': 'Ampola',
    'FRASCO': 'Frasco',
    'FA': 'Frasco-Ampola',
    'SOL': 'Solução',
    'XRP': 'Xarope',
    'GTS': 'Gotas'
  };

  if (rawDosagem && !["un", "unidade", "unid", "-", ""].includes(rawDosagem.toLowerCase())) {
    const apresClean = mapSiglas[rawApres.toUpperCase()] || APRESENTACAO_LABELS[rawApres] || rawApres;
    return {
      apresentacao: apresClean || "-",
      dosagem: rawDosagem
    };
  }

  const regexDose = /\b(\d+([\.,]\d+)?\s*(mg|g|ml|mcg|ui|%|mmeq|meq))\b/i;
  const match = rawApres.match(regexDose);

  if (match) {
    const extractedDosagem = match[0].toUpperCase();
    let extractedApres = rawApres.replace(match[0], "").trim();

    const apresUpper = extractedApres.toUpperCase();
    const finalApres = mapSiglas[apresUpper] || APRESENTACAO_LABELS[extractedApres] || extractedApres || rawApres;

    return {
      apresentacao: finalApres,
      dosagem: extractedDosagem
    };
  }

  if (rawUnidade && !["un", "unidade", "unid", "-", ""].includes(rawUnidade.toLowerCase())) {
    const apresClean = mapSiglas[rawApres.toUpperCase()] || APRESENTACAO_LABELS[rawApres] || rawApres;
    return {
      apresentacao: apresClean || "-",
      dosagem: rawUnidade
    };
  }

  const apresClean = mapSiglas[rawApres.toUpperCase()] || APRESENTACAO_LABELS[rawApres] || rawApres;
  return {
    apresentacao: apresClean || "-",
    dosagem: rawDosagem && !["un", "unidade"].includes(rawDosagem.toLowerCase()) ? rawDosagem : "-"
  };
}

export default function Medicamentos() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("padronizados");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    codigo: true,
    medicamento: true,
    dosagem: true,
    apresentacao: true,
    categoria: true,
    estoque: true,
    acoes: true
  });

  const queryClient = useQueryClient();

  const { data: medicamentos = [], isLoading } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Medicamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      setFormOpen(false);
      toast.success("Medicamento cadastrado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Medicamento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      setFormOpen(false);
      setEditingMed(null);
      toast.success("Medicamento atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Medicamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      toast.success("Medicamento excluído com sucesso!");
    },
  });

  const handleSave = (data) => {
    if (editingMed) {
      updateMutation.mutate({ id: editingMed.id, data });
    } else {
      createMutation.mutate({ ...data, estoque_atual: 0 });
    }
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este medicamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMeds = medicamentos.filter(m => {
    // Aba filter
    if (activeTab === "padronizados" && !m.padronizado) return false;
    if (activeTab === "nao_padronizados" && m.padronizado) return false;
    
    // Search filter
    return (
      m.nome?.toLowerCase().includes(search.toLowerCase()) ||
      m.principio_ativo?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo_barras?.includes(search)
    );
  }).sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  return (
    <div className="p-6 space-y-4 h-[calc(100vh)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medicamentos</h1>
          <p className="text-slate-500 text-sm">Cadastro e gerenciamento de medicamentos</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white border-0 gap-2">
            <Printer className="w-4 h-4" />
            Imprimir Lista
          </Button>
          <Button onClick={() => { setEditingMed(null); setFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Medicamento
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="w-4 h-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.keys(visibleColumns).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  className="capitalize"
                  checked={visibleColumns[col]}
                  onCheckedChange={(checked) =>
                    setVisibleColumns((prev) => ({ ...prev, [col]: checked }))
                  }
                >
                  {col === "codigo" ? "Cód." :
                    col === "apresentacao" ? "Apresentação" :
                      col === "acoes" ? "Ações" : col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="padronizados">Padronizados</TabsTrigger>
          <TabsTrigger value="nao_padronizados">Não Padronizados</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, princípio ativo ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm relative h-[calc(100vh-280px)]">
        <Table className="min-w-[1000px] w-full" containerClassName="absolute inset-0 border-0">
          <TableHeader className="sticky top-0 z-20 shadow-sm bg-white">
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {visibleColumns.codigo && <TableHead className="w-24">Código</TableHead>}
              {visibleColumns.medicamento && <TableHead>Medicamento</TableHead>}
              {visibleColumns.dosagem && <TableHead>Dosagem</TableHead>}
              {visibleColumns.apresentacao && <TableHead>Apresentação</TableHead>}
              {visibleColumns.categoria && <TableHead>Categoria</TableHead>}
              {visibleColumns.estoque && <TableHead className="text-center">Estoque</TableHead>}
              {visibleColumns.acoes && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredMeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhum medicamento encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMeds.map((med) => (
                <TableRow key={med.id} className="hover:bg-slate-50/50">
                  {visibleColumns.codigo && (
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {med.codigo || "S/C"}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.medicamento && (
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={cn("font-medium text-slate-800", isMav(med) && "text-red-600 font-bold flex items-center gap-1.5")}>
                            {med.nome}
                            {isMav(med) && <Badge variant="destructive" className="text-[10px] py-0 px-1">MAV</Badge>}
                            {isPsicotropico(med.categoria) && <User className="inline-block w-4 h-4 ml-1 text-indigo-600" title="Requer nome do paciente" />}
                          </p>
                        </div>
                        {med.nome_comercial && (
                          <p className="text-xs text-indigo-600 font-medium">Comercial: {med.nome_comercial}</p>
                        )}
                        {med.principio_ativo && (
                          <p className="text-[10px] text-slate-500">{med.principio_ativo}</p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.dosagem && (
                    <TableCell className="text-slate-800 font-bold font-mono">
                      {getApresentacaoEDosagem(med).dosagem}
                    </TableCell>
                  )}
                  {visibleColumns.apresentacao && (
                    <TableCell className="text-slate-600 font-medium">
                      {getApresentacaoEDosagem(med).apresentacao}
                    </TableCell>
                  )}
                  {visibleColumns.categoria && (
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORIA_LABELS[med.categoria] || med.categoria}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.estoque && (
                    <TableCell className="text-center">
                      <Badge
                        className={
                          (med.estoque_atual || 0) <= (med.estoque_minimo || 0)
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      >
                        {med.estoque_atual || 0}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.acoes && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(med)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(med.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <MedicamentoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        medicamento={editingMed}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Relatório Oculto para Impressão */}
      <div id="print-area" className="hidden print:block p-8 bg-white text-slate-900 font-sans">
        <div className="border-b-2 border-blue-600 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-blue-950 uppercase tracking-tight">AXION SAÚDE — RELATÓRIO DE MEDICAMENTOS</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">ESTOQUE CENTRAL HOSPITALAR • LISTA DE PADRONIZAÇÃO DE MEDICAMENTOS</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Emissão: <span className="font-bold text-slate-800">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></p>
            <p>Total de itens: <span className="font-bold text-slate-800">{filteredMeds.length}</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
              <th className="border border-blue-800 py-2 px-3 text-center w-16">Cód</th>
              <th className="border border-blue-800 py-2 px-3">Medicamento / Princípio Ativo</th>
              <th className="border border-blue-800 py-2 px-3">Categoria</th>
              <th className="border border-blue-800 py-2 px-3">Apresentação / Dosagem</th>
              <th className="border border-blue-800 py-2 px-3 text-center">Estoque Atual</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeds.map((med, idx) => (
              <tr key={med.id} className={idx % 2 === 0 ? "bg-slate-50/50" : "bg-white"}>
                <td className="border border-slate-200 py-2 px-3 text-[10px] font-mono text-center">
                  {med.codigo || "S/C"}
                </td>
                <td className="border border-slate-200 py-2 px-3 text-sm">
                  <p className={cn("font-bold", isMav(med.nome) && "text-red-900")}>
                    {med.nome} {isMav(med.nome) && "(MAV)"}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">{med.principio_ativo || ""}</p>
                </td>
                <td className="border border-slate-200 py-2 px-3 text-xs">
                  {CATEGORIA_LABELS[med.categoria] || med.categoria}
                </td>
                <td className="border border-slate-200 py-2 px-3 text-xs font-medium">
                  {getApresentacaoEDosagem(med).apresentacao} — <span className="font-bold font-mono">{getApresentacaoEDosagem(med).dosagem}</span>
                </td>
                <td className="border border-slate-200 py-2 px-3 text-center font-bold text-blue-700 text-sm">
                  {med.estoque_atual || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
            background-color: white !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
          }
          
          .no-print, nav, header, footer, button, [role="combobox"], [role="menu"] { display: none !important; }
          .print-only { display: block !important; }
          .p-6 { padding: 0 !important; }
          
          .bg-white { border: none !important; padding: 0 !important; }
          
          table { 
            width: 100% !important;
            page-break-inside: auto;
            border-collapse: collapse !important;
          }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          
          h1, h2, h3 { 
            page-break-after: avoid; 
            color: black !important;
          }
          
          .border-b-2.border-blue-600 {
            border-bottom-color: #2563eb !important;
            border-bottom-width: 2px !important;
          }
          
          .bg-blue-600 { background-color: #2563eb !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .text-blue-700 { color: #1d4ed8 !important; }
        }
      `}</style>
    </div>
  );
}
