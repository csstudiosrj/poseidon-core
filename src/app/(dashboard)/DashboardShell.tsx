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

/* ─── ÍCONE DO TRIDENTE (SVG) ─────────────────────────────────── */
function TridentIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22d3ee"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Haste central */}
      <line x1="12" y1="4" x2="12" y2="22" />
      {/* Pontas do tridente */}
      <line x1="6" y1="4" x2="12" y2="10" />
      <line x1="12" y1="10" x2="18" y2="4" />
      {/* Arco inferior (onda) */}
      <path d="M8 20 Q12 16 16 20" />
      {/* Traços laterais decorativos */}
      <line x1="8" y1="14" x2="8" y2="18" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  );
}

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
  { label: "Escrita", href: "/escrita", icon: Sparkles },
  { label: "Auditoria", href: "#", icon: ShieldCheck, badge: "Em breve" },
];

const bottomNav: NavItem[] = [
  { label: "Configurações", href: "/configuracoes", icon: Settings },
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

  const consolePath =
    pathname === "/hub"
      ? "console://hub"
      : pathname === "/setup"
      ? "console://setup"
      : pathname === "/escrita"
      ? "console://escrita"
      : pathname === "/orcamento"
      ? "console://orcamento"
      : pathname === "/configuracoes"
      ? "console://configuracoes"
      : pathname.startsWith("/projeto/")
      ? `console://projeto/${pathname.split("/")[2]}`
      : "console://poseidon";

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
                <TridentIcon size={18} />
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Poseidon</span>
            </div>
          ) : (
            <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 mx-auto">
              <TridentIcon size={18} />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-white/5 transition-colors text-white/40 hover:text-white/70 cursor-pointer shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                title={item.label}
              >
                <item.icon size={20} className={isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white/60"} />
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-semibold whitespace-nowrap">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                title={item.label}
              >
                <item.icon size={20} className={isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white/60"} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
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
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded hover:bg-white/5 transition-colors text-white/50 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-white/40 font-mono hidden sm:inline">
              {consolePath}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sininho de Notificações */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
              >
                <Bell size={20} className="text-white/50 hover:text-white/80 transition-colors" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-sea-950 animate-pulse" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-sea-900 border border-white/5 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-md z-40 p-4">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">Alertas Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <p className="text-sm text-white/60 leading-relaxed">
                        Compliance atualizado para a Lei Rouanet 2025. Novos tetos disponíveis.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <p className="text-sm text-white/60 leading-relaxed">
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                  <User size={18} />
                </div>
                <ChevronRight size={14} className={`text-white/40 transition-transform ${userMenuOpen ? "rotate-90" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-sea-900 border border-white/5 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-md z-40 py-1.5">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm text-white font-medium">Admin</p>
                    <p className="text-xs text-white/40">admin@poseidon.com</p>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <User size={16} />
                    <span>Perfil</span>
                  </button>
                  <Link href="/configuracoes" className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <Settings size={16} />
                    <span>Configurações</span>
                  </Link>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <CreditCard size={16} />
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
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