import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import logo from "./assets/logo.png";
import SyncStatusBadge from "@/components/SyncStatusBadge";


import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Boxes,
  Building2,
  FileText,
  HandHelping,
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  ClipboardCheck,
  Settings,
  CalendarX2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster } from "sonner";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Medicamentos", icon: Package, page: "Medicamentos" },
  { name: "Movimentações", icon: ArrowLeftRight, page: "Movimentacoes" },
  { name: "Empréstimos", icon: HandHelping, page: "Emprestimos" },
  { name: "Estoque", icon: Boxes, page: "Estoque" },
  { name: "Vencimentos", icon: CalendarX2, page: "Vencimentos" },
  { name: "Cadastros", icon: Building2, page: "Cadastros" },
  { name: "Balanço", icon: ClipboardCheck, page: "Inventario" },
  { name: "Relatórios", icon: FileText, page: "Relatorios" },
  { name: "Configurações", icon: Settings, page: "Configuracoes" },
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("pharma_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    setUser({ full_name: "Administrador", email: "local@farmacia.clemente" });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        navigate(createPageUrl("Movimentacoes") + "?tab=entradas&action=new");
      } else if (e.key === "F12") {
        e.preventDefault();
        navigate(createPageUrl("Movimentacoes") + "?tab=saidas&action=new");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("pharma_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleLogout = () => {
    console.log("Logout local");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      <Toaster position="top-right" richColors />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] z-40 px-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-300 hover:text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-blue-500/40">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white">Clemente Ferreira</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatusBadge />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — navy escuro */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#0F172A] z-50 transition-transform duration-300 flex flex-col",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">Clemente Ferreira</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400">
              Controle de Estoque
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-4.5 h-4.5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )} style={{ width: '18px', height: '18px' }} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Sync badge */}
          <SyncStatusBadge />

          {/* User + controls */}
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 ring-1 ring-blue-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs text-slate-200 truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-7 h-7 text-slate-500 hover:text-amber-400 hover:bg-white/5"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-white/5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}