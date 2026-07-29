import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SateliteEstoque() {
  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: () => db.entities.Medicamento.list(),
  });

  const sateliteMeds = medicamentos
    .filter(m => (m.estoque_satelite || 0) > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Estoque Atual (Satélite)</h1>
        <p className="text-slate-500 text-sm">Medicamentos atualmente disponíveis para dispensação na farmácia satélite</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                    <TableCell className="font-medium text-slate-800">
                      {med.nome}
                      {med.unidade_medida && med.unidade_medida.toLowerCase() !== 'un' && (
                        <span className="text-slate-400 text-xs ml-1">- {med.unidade_medida}</span>
                      )}
                    </TableCell>
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
    </div>
  );
}
