// src/app/(dashboard)/DashboardShell.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  CreditCard,
  LogOut,
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  Menu,
} from "lucide-react";
import "../globals.css";

/* ─── TIPOS ─────────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

/* ─── NAVEGAÇÃO ─────────────────────────────────────────────────── */
const mainNav: NavItem[] = [
  { label: "Hub", href: "/hub", icon: Layers },
  { label: "Novo Projeto", href: "/setup", icon: FileText },
  { label: "Escrita", href: "#", icon: Sparkles, badge: "Em breve" },
  { label: "Auditoria", href: "#", icon: ShieldCheck, badge: "Em breve" },
];

const bottomNav: NavItem[] = [
  { label: "Configurações", href: "#", icon: Settings },
  { label: "Pagamentos", href: "#", icon: CreditCard },
];

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────────── */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fecha os menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-sea-950 text-slate-200 antialiased font-sans flex">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full bg-sea-900 border-r border-white/5 flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18" stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={16} cy={16} r={13} stroke="rgba(34,211,238,0.2)" strokeWidth={1.5} strokeDasharray="4 3" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Poseidon</span>
            </div>
          ) : (
            <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 mx-auto">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18" stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-white/5 transition-colors text-white/40 hover:text-white/70 cursor-pointer shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.href === "#";
            return (
              <Link
                key={item.label}
                href={isDisabled ? "#" : item.href}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                title={item.label}
              >
                <item.icon size={18} className={isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/50"} />
                {sidebarOpen && (
                  <span className="text-xs font-medium flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-semibold whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="py-3 px-2 border-t border-white/5 space-y-1">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.href === "#";
            return (
              <Link
                key={item.label}
                href={isDisabled ? "#" : item.href}
                onClick={(e) => isDisabled && e.preventDefault()}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                title={item.label}
              >
                <item.icon size={18} className={isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/50"} />
                {sidebarOpen && <span className="text-xs font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>
        {/* HEADER */}
        <header className="h-16 bg-sea-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile: toggle sidebar (sobrepõe a sidebar) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded hover:bg-white/5 transition-colors text-white/50 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <span className="text-[10px] text-white/30 font-mono hidden sm:inline">
              {pathname === "/hub"
                ? "console://hub"
                : pathname === "/setup"
                ? "console://setup"
                : "console://poseidon"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sininho de Notificações */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
              >
                <Bell size={17} className="text-white/40 hover:text-white/70 transition-colors" />
                {/* Indicador de alerta */}
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-sea-950 animate-pulse" />
              </button>
              {/* Dropdown Notificações */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-sea-900 border border-white/5 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-md z-40 p-4">
                  <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wide mb-3">Alertas Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-white/60 leading-relaxed">
                        Compliance atualizado para a Lei Rouanet 2025. Novos tetos disponíveis.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-white/60 leading-relaxed">
                        Projeto "Festival Raízes" está com 30% de execução e prazo se aproximando.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar / User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  <User size={16} />
                </div>
                <ChevronRight size={12} className={`text-white/30 transition-transform ${userMenuOpen ? "rotate-90" : ""}`} />
              </button>
              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-sea-900 border border-white/5 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-md z-40 py-1.5">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs text-white font-medium">Admin</p>
                    <p className="text-[10px] text-white/30">admin@poseidon.com</p>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <User size={14} />
                    <span>Perfil</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <Settings size={14} />
                    <span>Configurações</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <CreditCard size={14} />
                    <span>Pagamentos</span>
                  </button>
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}