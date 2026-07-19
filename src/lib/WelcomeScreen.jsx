/**
 * WelcomeScreen.jsx
 * Tela inicial antes de entrar no sistema.
 * Exibe os módulos do hospital — clique em qualquer um para entrar no Dashboard.
 */

import { useState, useEffect } from "react";
import logo from "../assets/logo-tr.png";

// ─── Ícones SVG ───────────────────────────────────────────────────────────────

const IconRecepcao = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Balcão de recepção */}
    <rect x="2" y="14" width="20" height="3" rx="1" stroke={color} strokeWidth="1.5" fill={color + "22"} />
    <path d="M5 14V10a7 7 0 0 1 14 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="7" r="2.5" stroke={color} strokeWidth="1.5" fill={color + "22"} />
    <path d="M9 14v-1.5a3 3 0 0 1 6 0V14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconMedico = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Estetoscópio */}
    <circle cx="18" cy="17" r="3" stroke={color} strokeWidth="1.5" fill={color + "22"} />
    <path d="M15 17H9a5 5 0 0 1-5-5V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 6V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 6V4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 6h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18" cy="17" r="1" fill={color} />
  </svg>
);

const IconEnfermagem = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Cruz + silhueta enfermeira */}
    <circle cx="12" cy="6" r="3" stroke={color} strokeWidth="1.5" fill={color + "22"} />
    <path d="M7 21v-2a5 5 0 0 1 10 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Cruz */}
    <rect x="14" y="3" width="7" height="7" rx="1" fill={color + "22"} stroke={color} strokeWidth="1.2" />
    <line x1="17.5" y1="4.5" x2="17.5" y2="8.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="15.5" y1="6.5" x2="19.5" y2="6.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
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

const IconTerceirizado = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    {/* Maleta / Briefcase */}
    <rect x="4" y="9" width="16" height="11" rx="2" stroke={color} strokeWidth="1.5" fill={color + "18"} />
    <path d="M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="14" r="1.5" fill={color} />
  </svg>
);

// ─── Módulos ──────────────────────────────────────────────────────────────────

const MODULES = [
  {
    key: "estoque_farmacia",
    label: "Estoque",
    sub: "Gestão e Envio para Satélite",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.3)",
    border: "rgba(167,139,250,0.4)",
    bg: "rgba(167,139,250,0.08)",
    Icon: IconEstoqueFarmacia,
  },
  {
    key: "farmacia_satelite",
    label: "Farmácia Satélite",
    sub: "Dispensação para Paciente",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.3)",
    border: "rgba(251,146,60,0.4)",
    bg: "rgba(251,146,60,0.08)",
    Icon: IconFarmaciaSatelite,
  },
  {
    key: "responsavel_tecnico",
    label: "Responsável Técnico",
    sub: "Gestão e Usuários",
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
      {/* Ícone */}
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

      {/* Textos */}
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
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showEnfermagemMenu, setShowEnfermagemMenu] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleModuleClick = (mod) => {
    setExiting(true);
    setTimeout(() => onEnter(mod.key), 550);
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
