import { useState } from "react";
import { db } from "@/api/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Book, Printer, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { isPsicotropico, getPortaria344List } from "@/utils/mavUtils";

export default function SatelitePortaria() {
  const [selectedLista, setSelectedLista] = useState("");
  const [selectedLivroMedId, setSelectedLivroMedId] = useState("");
  const [isPerdaModalOpen, setIsPerdaModalOpen] = useState(false);
  const [perdaQtd, setPerdaQtd] = useState("");
  const [perdaMotivo, setPerdaMotivo] = useState("");
  const [perdaResp, setPerdaResp] = useState("");
  const [perdaLote, setPerdaLote] = useState("");
  const queryClient = useQueryClient();
  
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const { data: saidasLivro = [] } = useQuery({
    queryKey: ['saidas', 'livro344'],
    queryFn: () => db.entities.Saida.list('-created_date'),
  });

  const { data: entradasLivro = [] } = useQuery({
    queryKey: ['entradas', 'livro344'],
    queryFn: () => db.entities.Entrada.list('-created_date'),
  });

  const handleRegistrarPerda = async (e) => {
    e.preventDefault();
    if (!perdaQtd || !perdaMotivo || !perdaResp) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await db.entities.Saida.create({
        medicamento_id: selectedLivroMedId,
        quantidade: parseInt(perdaQtd, 10),
        destino: "Perda",
        motivo: perdaMotivo,
        responsavel: perdaResp,
        numero_lote: perdaLote,
        data_saida: new Date().toISOString()
      });
      toast.success("Perda registrada com sucesso.");
      setIsPerdaModalOpen(false);
      setPerdaQtd(""); setPerdaMotivo(""); setPerdaResp(""); setPerdaLote("");
      queryClient.invalidateQueries(['saidas', 'livro344']);
    } catch (err) {
      toast.error("Erro ao registrar perda.");
    }
  };
  const historicoMovimentos = (() => {
    if (!selectedLivroMedId) return [];

    // 1. ENTRADAS: Compras reais do fornecedor (ignora transferências internas)
    const entradas = entradasLivro.filter(e => e.medicamento_id === selectedLivroMedId).map(e => ({
      ...e,
      tipo: 'ENTRADA',
      dataObj: parseISO(e.data_entrada || e.created_at)
    }));
    
    // 2. SAÍDAS: Dispensações para pacientes e Perdas (ignora transferências internas)
    const saidas = saidasLivro
      .filter(s => s.medicamento_id === selectedLivroMedId && s.motivo !== 'Transferência de Estoque')
      .map(s => ({
        ...s,
        tipo: s.destino === 'Perda' || s.motivo === 'Perda' ? 'PERDA' : 'SAIDA',
        dataObj: parseISO(s.data_saida || s.created_at)
      }));
    
    // Juntar e ordenar cronologicamente (se a data for igual, desempata pela data exata de criação no sistema)
    const todos = [...entradas, ...saidas].sort((a, b) => {
      // Isolar apenas o dia (YYYY-MM-DD) na timezone local usando o date-fns
      const dayA = format(a.dataObj, 'yyyy-MM-dd');
      const dayB = format(b.dataObj, 'yyyy-MM-dd');

      // Se forem de dias diferentes, o dia mais antigo vem primeiro
      if (dayA !== dayB) return dayA.localeCompare(dayB);
      
      // Se for no MESMO DIA, usar a hora/minuto/segundo que foi registrado no sistema (created_at)
      const createdA = new Date(a.created_at || 0).getTime();
      const createdB = new Date(b.created_at || 0).getTime();
      return createdA - createdB;
    });
    
    let saldoAtual = 0;
    const historico = todos.map(mov => {
      if (mov.tipo === 'ENTRADA') {
        saldoAtual += (mov.quantidade || 0);
      } else {
        saldoAtual -= (mov.quantidade || 0);
      }
      return { ...mov, saldo: saldoAtual };
    });
    
    // Retornar em ordem cronológica (mais antigo primeiro, como em um livro físico)
    return historico;
  })();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Book className="w-7 h-7 text-indigo-600" />
          Folha do Livro de Registro Específico
        </h1>
        <p className="text-slate-500 text-sm">Controle de Saídas de Medicamentos Sujeitos a Controle Especial na Farmácia Satélite</p>
      </div>

      <Card className="p-6 border-0 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl no-print">
          <div className="flex-1">
            <Label className="mb-2 block">1. Selecione a Lista (Portaria 344)</Label>
            <Select 
              value={selectedLista} 
              onValueChange={(val) => {
                setSelectedLista(val);
                setSelectedLivroMedId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha a categoria da receita..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entorpecentes (Listas A1 e A2)">Entorpecentes (Listas A1 e A2)</SelectItem>
                <SelectItem value="Psicotrópicos (Listas A3, B1 e B2)">Psicotrópicos (Listas A3, B1 e B2)</SelectItem>
                <SelectItem value="Controle Especial (Listas C1, C2, C4 e C5)">Controle Especial (Listas C1, C2, C4 e C5)</SelectItem>
                <SelectItem value="Imunossupressores (Lista C3)">Imunossupressores (Lista C3)</SelectItem>
                <SelectItem value="Outros Controlados">Outros Controlados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label className="mb-2 block">2. Selecione o Medicamento</Label>
            <Select value={selectedLivroMedId} onValueChange={setSelectedLivroMedId} disabled={!selectedLista}>
              <SelectTrigger>
                <SelectValue placeholder={selectedLista ? "Escolha o medicamento..." : "Selecione a lista primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {medicamentos
                  .filter(m => isPsicotropico(m.categoria) && getPortaria344List(m.nome) === selectedLista)
                  .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
                  .map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.nome} {med.unidade_medida && med.unidade_medida.toLowerCase() !== 'un' ? `- ${med.unidade_medida}` : ""} {med.apresentacao ? `- ${med.apresentacao}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedLivroMedId ? (
          <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-700">
                Folha do Livro: {(() => {
                  const m = medicamentos.find(m => m.id === selectedLivroMedId);
                  return m ? `${m.nome} ${m.unidade_medida && m.unidade_medida.toLowerCase() !== 'un' ? `- ${m.unidade_medida}` : ""} ${m.apresentacao ? `- ${m.apresentacao}` : ""}` : "";
                })()}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPerdaModalOpen(true)} className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <AlertTriangle className="w-4 h-4" />
                  Registrar Perda
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <Printer className="w-4 h-4" />
                  Imprimir Folha
                </Button>
              </div>
            </div>
            
            <div id="livro-print-area">
              <div className="hidden print-only mb-6 text-center">
                <h1 className="text-xl font-bold uppercase underline mb-2">FOLHA DO LIVRO DE REGISTRO ESPECÍFICO</h1>
                <h2 className="text-lg font-bold">Medicamento: {(() => {
                  const m = medicamentos.find(m => m.id === selectedLivroMedId);
                  return m ? `${m.nome} ${m.unidade_medida && m.unidade_medida.toLowerCase() !== 'un' ? `- ${m.unidade_medida}` : ""} ${m.apresentacao ? `- ${m.apresentacao}` : ""}` : "";
                })()}</h2>
                <p className="text-sm mt-2">Portaria SVS/MS nº 344/1998</p>
                <p className="text-xs mt-1 text-slate-500">Unidade: Farmácia Satélite</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead className="font-bold text-slate-700 text-center border-b border-slate-200" colSpan={3}>DATA</TableHead>
                    <TableHead className="font-bold text-slate-700 border-b border-slate-200" rowSpan={2}>HISTÓRICO</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center border-b border-slate-200" colSpan={3}>MOVIMENTO</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center border-b border-slate-200" rowSpan={2}>ESTOQUE</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center border-b border-slate-200" rowSpan={2}>ASSINATURA DO RESP. TÉCNICO</TableHead>
                    <TableHead className="font-bold text-slate-700 border-b border-slate-200" rowSpan={2}>OBSERVAÇÕES</TableHead>
                  </TableRow>
                  <TableRow className="bg-slate-100">
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-10 px-1 border-r border-slate-200">Dia</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-10 px-1 border-r border-slate-200">Mês</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-12 px-1">Ano</TableHead>
                    
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-16 px-1 border-l border-r border-slate-200">Entrada</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-16 px-1 border-r border-slate-200">Saída</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center text-xs w-16 px-1">Perdas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoMovimentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-slate-500 italic">
                          Nenhum registro encontrado para este medicamento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historicoMovimentos.map((mov) => {
                        const d = mov.dataObj;
                        return (
                          <TableRow key={mov.id + mov.tipo}>
                            <TableCell className="text-center font-mono text-xs px-1 border-r border-slate-200">{String(d.getDate()).padStart(2, '0')}</TableCell>
                            <TableCell className="text-center font-mono text-xs px-1 border-r border-slate-200">{String(d.getMonth() + 1).padStart(2, '0')}</TableCell>
                            <TableCell className="text-center font-mono text-xs px-1">{d.getFullYear()}</TableCell>
                            
                            <TableCell className="font-medium text-slate-800 uppercase text-[10px] sm:text-xs">
                              {mov.tipo === 'ENTRADA' ? (mov.fornecedor_nome || 'Estoque Central') : 
                               (mov.tipo === 'PERDA' ? 'PERDA / QUEBRA' : (mov.paciente_nome || mov.ala_nome || mov.destino || 'Paciente'))}
                            </TableCell>
                            
                            <TableCell className="text-center font-bold text-emerald-600 bg-emerald-50/30 px-1 border-l border-r border-slate-200">{mov.tipo === 'ENTRADA' ? mov.quantidade : '-'}</TableCell>
                            <TableCell className="text-center font-bold text-blue-600 bg-blue-50/30 px-1 border-r border-slate-200">{mov.tipo === 'SAIDA' ? mov.quantidade : '-'}</TableCell>
                            <TableCell className="text-center font-bold text-red-600 bg-red-50/30 px-1">{mov.tipo === 'PERDA' ? mov.quantidade : '-'}</TableCell>
                            
                            <TableCell className="text-center font-bold text-slate-900 bg-slate-50 border-l border-r border-slate-200">{mov.saldo}</TableCell>
                            <TableCell className="border-r border-slate-200 p-0">
                              <div className="min-h-[2rem] w-full"></div>
                            </TableCell>
                            <TableCell className="text-[10px] text-slate-600 min-w-[120px] break-words whitespace-normal" title={`Lote: ${mov.numero_lote || mov.lote || '-'} | Resp: ${mov.responsavel || '-'}`}>
                              Lote: {mov.numero_lote || mov.lote || "-"} {mov.motivo ? `| ${mov.motivo}` : ''}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 no-print">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Selecione um medicamento acima para visualizar sua respectiva Folha do Livro de Registro.</p>
          </div>
        )}
      </Card>

      <Dialog open={isPerdaModalOpen} onOpenChange={setIsPerdaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Quebra / Perda</DialogTitle>
            <DialogDescription>
              Informe os dados da perda de estoque para ser registrada no Livro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegistrarPerda} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade Perdida</Label>
                <Input type="number" min="1" value={perdaQtd} onChange={e => setPerdaQtd(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Número do Lote</Label>
                <Input value={perdaLote} onChange={e => setPerdaLote(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo da Perda</Label>
              <Input value={perdaMotivo} onChange={e => setPerdaMotivo(e.target.value)} placeholder="Ex: Quebra de ampola" required />
            </div>
            <div className="space-y-2">
              <Label>Responsável (Farmacêutico)</Label>
              <Input value={perdaResp} onChange={e => setPerdaResp(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPerdaModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Salvar Registro</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
            background-color: white !important;
          }
          .no-print, nav, header, footer, button, aside { display: none !important; }
          .print-only { display: block !important; }
          .p-6 { padding: 0 !important; }
          
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; }
          .bg-slate-100 { background-color: #f1f5f9 !important; }
        }
      `}</style>
    </div>
  );
}
