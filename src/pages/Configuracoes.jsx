import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Settings, Building2, Plus, Bed } from "lucide-react";

export default function Configuracoes() {

    // Estrutura do Hospital
    const [setores, setSetores] = useState(() => {
        const saved = localStorage.getItem("hospital_estrutura");
        return saved ? JSON.parse(saved) : [
            { id: 1, nome: "Ala Feminina", owner: "geral", leitos: [{ id: 101, numero: "01", status: "Livre" }] },
            { id: 2, nome: "Ala Masculina", owner: "geral", leitos: [] }
        ];
    });

    const [novoSetor, setNovoSetor] = useState("");
    const [novoLeito, setNovoLeito] = useState("");
    const [setorSelecionado, setSetorSelecionado] = useState(null);

    useEffect(() => {
        localStorage.setItem("hospital_estrutura", JSON.stringify(setores));
    }, [setores]);

    const handleAddSetor = () => {
        if (!novoSetor) return;
        setSetores([...setores, { id: Date.now(), nome: novoSetor, owner: "geral", leitos: [] }]);
        setNovoSetor("");
    };

    const handleTransferSector = (setorId, newOwner) => {
        setSetores(setores.map(s => {
            if (s.id === setorId) {
                return { ...s, owner: newOwner };
            }
            return s;
        }));
    };

    const handleAddLeito = (setorId) => {
        if (!novoLeito) return;
        setSetores(setores.map(s => {
            if (s.id === setorId) {
                return {
                    ...s,
                    leitos: [...s.leitos, { id: Date.now(), numero: novoLeito, status: "Livre" }]
                };
            }
            return s;
        }));
        setNovoLeito("");
        setSetorSelecionado(null);
    };

    const handleRemoveLeito = (setorId, leitoId) => {
        setSetores(setores.map(s => {
            if (s.id === setorId) {
                return { ...s, leitos: s.leitos.filter(l => l.id !== leitoId) };
            }
            return s;
        }));
    };

    const handleRemoveSetor = (setorId) => {
        setSetores(setores.filter(s => s.id !== setorId));
    };




    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Settings className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Administrador Geral</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestão de Estrutura, Aparência e Dados do sistema</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ESTRUTURA DO HOSPITAL */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-500" />
                            Estrutura Hospitalar (Setores e Leitos)
                        </CardTitle>
                        <CardDescription>
                            Crie novos setores/alas e gerencie os leitos disponíveis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-6 max-w-sm">
                            <Input 
                                placeholder="Nome do novo setor..." 
                                value={novoSetor} 
                                onChange={(e) => setNovoSetor(e.target.value)}
                            />
                            <Button onClick={handleAddSetor} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="w-4 h-4" /> Setor
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {setores.map(setor => (
                                <div key={setor.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-700 dark:text-slate-200">{setor.nome}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${setor.owner === 'terceirizado' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {setor.owner === 'terceirizado' ? 'Terceirizado' : 'Gestão Geral'}
                                                </span>
                                                <select 
                                                    className="text-[10px] bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-500"
                                                    value={setor.owner || 'geral'}
                                                    onChange={(e) => handleTransferSector(setor.id, e.target.value)}
                                                >
                                                    <option value="geral">Transferir para Adm Geral</option>
                                                    <option value="terceirizado">Transferir para Terceirizado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveSetor(setor.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        {setorSelecionado === setor.id ? (
                                            <>
                                                <Input 
                                                    placeholder="Nº/Nome do Leito" 
                                                    value={novoLeito}
                                                    onChange={(e) => setNovoLeito(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                                <Button size="sm" onClick={() => handleAddLeito(setor.id)} className="h-8">Adicionar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setSetorSelecionado(null)} className="h-8">Cancelar</Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => setSetorSelecionado(setor.id)} className="w-full text-sm border-dashed">
                                                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Leito
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {setor.leitos.length === 0 ? (
                                            <p className="text-xs text-slate-500 text-center py-2">Nenhum leito cadastrado.</p>
                                        ) : setor.leitos.map(leito => (
                                            <div key={leito.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Bed className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-medium">{leito.numero}</span>
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase">{leito.status}</span>
                                                </div>
                                                <button onClick={() => handleRemoveLeito(setor.id, leito.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
