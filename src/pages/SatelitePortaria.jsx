import { useState, useRef } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Book, Printer } from "lucide-react";
import { safeFormatDate } from "@/utils/dateUtils";
import { isPsicotropico, getPortaria344List } from "@/utils/mavUtils";

export default function SatelitePortaria() {
  const [selectedLista, setSelectedLista] = useState("");
  const [selectedLivroMedId, setSelectedLivroMedId] = useState("");
  
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const { data: saidasLivro = [] } = useQuery({
    queryKey: ['saidas', 'livro344'],
    queryFn: () => db.entities.Saida.list('-created_date'),
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Book className="w-7 h-7 text-indigo-600" />
          Livros de Registro Específico (Portaria 344/98)
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
                      {med.nome} {med.unidade_medida ? `- ${med.unidade_medida}` : ""} {med.apresentacao ? `- ${med.apresentacao}` : ""}
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
                Livro: {(() => {
                  const m = medicamentos.find(m => m.id === selectedLivroMedId);
                  return m ? `${m.nome} ${m.unidade_medida ? `- ${m.unidade_medida}` : ""} ${m.apresentacao ? `- ${m.apresentacao}` : ""}` : "";
                })()}
              </h3>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Printer className="w-4 h-4" />
                Imprimir Livro
              </Button>
            </div>
            
            <div id="livro-print-area">
              <div className="hidden print-only mb-6 text-center">
                <h1 className="text-xl font-bold uppercase underline mb-2">LIVRO DE REGISTRO ESPECÍFICO</h1>
                <h2 className="text-lg font-bold">Medicamento: {(() => {
                  const m = medicamentos.find(m => m.id === selectedLivroMedId);
                  return m ? `${m.nome} ${m.unidade_medida ? `- ${m.unidade_medida}` : ""} ${m.apresentacao ? `- ${m.apresentacao}` : ""}` : "";
                })()}</h2>
                <p className="text-sm mt-2">Portaria SVS/MS nº 344/1998</p>
                <p className="text-xs mt-1 text-slate-500">Unidade: Farmácia Satélite</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead className="font-bold text-slate-700">Data</TableHead>
                    <TableHead className="font-bold text-slate-700">Lote</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Quantidade</TableHead>
                    <TableHead className="font-bold text-slate-700">Nome do Paciente</TableHead>
                    <TableHead className="font-bold text-slate-700">Destino/Ala</TableHead>
                    <TableHead className="font-bold text-slate-700">Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saidasLivro
                    .filter(s => s.medicamento_id === selectedLivroMedId)
                    .sort((a, b) => new Date(b.data_saida || b.created_at) - new Date(a.data_saida || a.created_at))
                    .length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 italic">
                          Nenhum registro de saída encontrado para este medicamento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      saidasLivro
                        .filter(s => s.medicamento_id === selectedLivroMedId)
                        .sort((a, b) => new Date(b.data_saida || b.created_at) - new Date(a.data_saida || a.created_at))
                        .map((saida) => (
                          <TableRow key={saida.id}>
                            <TableCell className="whitespace-nowrap">
                              {safeFormatDate(saida.data_saida || saida.created_at)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{saida.numero_lote || "-"}</TableCell>
                            <TableCell className="text-center font-bold text-indigo-700">{saida.quantidade}</TableCell>
                            <TableCell className="font-medium text-slate-800 uppercase">
                              {saida.paciente_nome || <span className="text-slate-400 font-normal italic">Não informado</span>}
                            </TableCell>
                            <TableCell>{saida.ala_nome || saida.destino || "-"}</TableCell>
                            <TableCell className="text-slate-600">{saida.responsavel || "-"}</TableCell>
                          </TableRow>
                        ))
                    )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 no-print">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Selecione um medicamento acima para visualizar seu respectivo Livro de Registro.</p>
          </div>
        )}
      </Card>
      
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
