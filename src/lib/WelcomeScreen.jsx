/**
 * WelcomeScreen.jsx
 * Tela inicial antes de entrar no sistema.
 * Exibe os módulos do hospital — clique em qualquer um para abrir o login.
 */

import { useState, useEffect } from "react";
import logo from "../assets/logo-tr.png";
import { Toaster, toast } from "sonner";
import { addLog } from "./logger";

// ─── Ícones SVG ───────────────────────────────────────────────────────────────

const IconEstoqueFarmacia = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Caixas empilhadas */}
    <path
      d="M2 7l10-5 10 5v10l-10 5L2 17V7z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      fill={color + "18"}
    />
    <path
      d="M12 2l10 5-10 5L2 7l10-5z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      fill={color + "28"}
    />
    <line x1="12" y1="12" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="9.5" x2="7" y2="19.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <line x1="17" y1="9.5" x2="17" y2="19.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const IconFarmaciaSatelite = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Frasco + satélite */}
    <path d="M9 3h6l1 4H8L9 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color + "22"} />
    <path d="M8 7v9a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    {/* Sinal satélite */}
    <path d="M17 5 q2-1 2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M18.5 3.5 q3-1 3 3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
    <circle cx="17" cy="5" r="0.6" fill={color} />
  </svg>
);

const IconAdministrador = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Escudo + estrela */}
    <path
      d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round"
      fill={color + "18"}
    />
    <path
      d="M12 7l1.12 2.27L15.5 9.64l-1.75 1.7.41 2.41L12 12.6l-2.16 1.15.41-2.41-1.75-1.7 2.38-.37L12 7z"
      stroke={color} strokeWidth="1" strokeLinejoin="round"
      fill={color + "66"}
    />
  </svg>
);

// ─── Módulos ──────────────────────────────────────────────────────────────────

const MODULES = [
  {
    key: "estoque_farmacia",
    label: "Estoque",
    sub: "Gestão e Envio",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.3)",
    border: "rgba(167,139,250,0.4)",
    bg: "rgba(167,139,250,0.08)",
    Icon: IconEstoqueFarmacia,
  },
  {
    key: "farmacia_satelite",
    label: "Farmácia Satélite",
    sub: "Dispensação",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.3)",
    border: "rgba(251,146,60,0.4)",
    bg: "rgba(251,146,60,0.08)",
    Icon: IconFarmaciaSatelite,
  },
  {
    key: "responsavel_tecnico",
    label: "Responsável Técnico",
    sub: "Gestão de Usuários",
    color: "#34d399",
    glow: "rgba(52,211,153,0.3)",
    border: "rgba(52,211,153,0.4)",
    bg: "rgba(52,211,153,0.08)",
    Icon: IconAdministrador,
  }
];

// ─── Card de módulo ───────────────────────────────────────────────────────────

function ModuleCard({ mod, delay, visible, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? mod.bg.replace("0.08", "0.16") : mod.bg,
        border: `1.5px solid ${hovered ? mod.border.replace("0.4", "0.8") : mod.border}`,
        borderRadius: 20,
        padding: "28px 20px 22px",
        cursor: "pointer",
        outline: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width: 160,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: visible
          ? hovered ? "translateY(-8px) scale(1.04)" : "translateY(0) scale(1)"
          : "translateY(30px) scale(0.9)",
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        boxShadow: hovered
          ? `0 8px 40px ${mod.glow}, 0 0 0 1px ${mod.border.replace("0.4", "0.2")}`
          : "0 2px 12px rgba(0,0,0,0.3)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{
        width: 76,
        height: 76,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hovered
          ? `radial-gradient(circle, ${mod.glow} 0%, transparent 70%)`
          : "transparent",
        transition: "background 0.3s ease",
        filter: hovered ? `drop-shadow(0 0 10px ${mod.color})` : "none",
      }}>
        <mod.Icon color={mod.color} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: hovered ? mod.color : "#cbd5e1",
          letterSpacing: 0.4,
          transition: "color 0.25s ease",
          lineHeight: 1.3,
        }}>
          {mod.label}
        </div>
        <div style={{
          fontSize: 10,
          color: hovered ? mod.color + "aa" : "#475569",
          marginTop: 4,
          transition: "color 0.25s ease",
          lineHeight: 1.4,
        }}>
          {mod.sub}
        </div>
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function WelcomeScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  
  // Login State
  const [selectedModule, setSelectedModule] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Make sure at least default admin exists
  useEffect(() => {
    const saved = localStorage.getItem("axion_users");
    let users = saved ? JSON.parse(saved) : [];
    
    const adminIndex = users.findIndex(u => u.username === "admin");
    if (adminIndex === -1) {
      users.push({
        id: "1",
        nome: "Administrador RT",
        username: "admin",
        password: "admin123",
        modules: ["estoque_farmacia", "farmacia_satelite", "responsavel_tecnico"],
        first_login: false
      });
      localStorage.setItem("axion_users", JSON.stringify(users));
    } else {
      // Force admin password to always be admin123 on load to prevent locking out
      if (users[adminIndex].password !== "admin123") {
        users[adminIndex].password = "admin123";
        localStorage.setItem("axion_users", JSON.stringify(users));
      }
    }
  }, []);

  const handleModuleClick = (mod) => {
    setSelectedModule(mod);
    setUsername("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsFirstLogin(false);
    setLoggedInUser(null);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("axion_users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      toast.error("Usuário ou senha incorretos.");
      return;
    }

    if (!user.modules.includes(selectedModule.key)) {
      toast.error(`Você não tem permissão para acessar: ${selectedModule.label}`);
      return;
    }

    if (user.first_login) {
      setIsFirstLogin(true);
      setLoggedInUser(user);
      return;
    }

    // Success login
    sessionStorage.setItem("axion_active_user", JSON.stringify(user));
    addLog(user.nome, "Login", `Acessou o módulo: ${selectedModule.label}`);
    
    setExiting(true);
    setTimeout(() => onEnter(selectedModule.key), 550);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 3) {
      toast.error("A senha deve ter pelo menos 3 caracteres.");
      return;
    }

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem("axion_users") || "[]");
    const updatedUser = { ...loggedInUser, password: newPassword, first_login: false };
    const updatedUsers = users.map(u => {
      if (u.id === loggedInUser.id) {
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem("axion_users", JSON.stringify(updatedUsers));
    
    sessionStorage.setItem("axion_active_user", JSON.stringify(updatedUser));
    addLog(updatedUser.nome, "Login", `Acessou o módulo: ${selectedModule.label} (Senha alterada)`);

    toast.success("Senha alterada com sucesso! Entrando...");
    setExiting(true);
    setTimeout(() => onEnter(selectedModule.key), 550);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "linear-gradient(145deg, #07111f 0%, #0b1a2e 40%, #060e1c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
        opacity: exiting ? 0 : visible ? 1 : 0,
        transition: "opacity 0.55s ease",
      }}
    >
      <Toaster position="top-right" richColors />
      
      {/* Grade de fundo */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(96,165,250,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(96,165,250,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        pointerEvents: "none",
      }} />

      {/* Brilho radial */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 12,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-16px)",
        transition: "opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s",
      }}>
        <img src={logo} alt="Axion" style={{ width: 44, height: 44, objectFit: "contain" }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", letterSpacing: 0.5 }}>
            Axion Saúde
          </div>
          <div style={{ fontSize: 10.5, color: "#334155", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 2 }}>
            Sistema de Gestão Hospitalar
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {!selectedModule ? (
          <>
            <div style={{
              fontSize: 16,
              color: "#475569",
              marginBottom: 44,
              letterSpacing: 0.5,
              fontWeight: 500,
            }}>
              Selecione o módulo para acessar
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              perspective: "1000px"
            }}>
              {MODULES.map((mod, i) => (
                <ModuleCard
                  key={mod.key}
                  mod={mod}
                  delay={100 + i * 80}
                  visible={visible && !exiting}
                  onClick={() => handleModuleClick(mod)}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "32px",
            width: "360px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.3s ease-out forwards",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <style>{`
              @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
            
            <div style={{ textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.2rem", fontWeight: "600" }}>
                Acesso: {selectedModule.label}
              </h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                {isFirstLogin ? "Primeiro Acesso: Altere sua senha" : "Insira suas credenciais"}
              </p>
            </div>

            {!isFirstLogin ? (
              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "6px" }}>Usuário</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.2)", color: "#fff", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "6px" }}>Senha</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.2)", color: "#fff", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setSelectedModule(null)} style={{
                    flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent", color: "#e2e8f0", cursor: "pointer", fontWeight: "500"
                  }}>
                    Voltar
                  </button>
                  <button type="submit" style={{
                    flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                    background: selectedModule.color, color: "#fff", cursor: "pointer", fontWeight: "600",
                    boxShadow: `0 4px 14px ${selectedModule.glow}`
                  }}>
                    Entrar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "6px" }}>Nova Senha</label>
                  <input
                    required
                    autoFocus
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.2)", color: "#fff", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "6px" }}>Confirmar Nova Senha</label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.2)", color: "#fff", outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setSelectedModule(null)} style={{
                    flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent", color: "#e2e8f0", cursor: "pointer", fontWeight: "500"
                  }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{
                    flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                    background: selectedModule.color, color: "#fff", cursor: "pointer", fontWeight: "600",
                    boxShadow: `0 4px 14px ${selectedModule.glow}`
                  }}>
                    Salvar e Entrar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Linha divisória + rodapé */}
      <div style={{
        marginTop: 48,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: visible ? 0.5 : 0,
        transition: "opacity 0.7s ease 0.7s",
      }}>
        <div style={{ width: 80, height: 1, background: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: 10, color: "#1e3a5f", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Axion Saúde © 2025 — v1.0
        </span>
        <div style={{ width: 80, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}
