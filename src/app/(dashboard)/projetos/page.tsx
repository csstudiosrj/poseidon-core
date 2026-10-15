// src/app/(dashboard)/projetos/page.tsx
import React from "react";
import "../globals.css";
import { AlertCircle, FolderKanban } from "lucide-react";
import { listarProjetos } from "@/app/actions/projetos";
import { ProjetosList } from "./ProjetosList";

export default async function ProjetosPage() {
  const data = await listarProjetos();

  if ("error" in data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#020b18" }}
      >
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <FolderKanban size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-xl font-extrabold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
            >
              Projetos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie seus projetos culturais e acompanhe o status de cada um
            </p>
          </div>
        </div>

        <ProjetosList projetos={data} />

      </main>
    </div>
  );
}
