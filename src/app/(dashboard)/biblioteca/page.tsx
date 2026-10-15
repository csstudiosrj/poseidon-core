// src/app/(dashboard)/biblioteca/page.tsx
import React from "react";
import "../globals.css";
import { AlertCircle, LibraryBig } from "lucide-react";
import { listarRegras } from "@/app/actions/biblioteca";
import { BibliotecaList } from "./BibliotecaList";

export default async function BibliotecaPage() {
  const data = await listarRegras();

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <LibraryBig size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-xl font-extrabold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.03em" }}
            >
              Biblioteca
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Referência de mecanismos de fomento e suas diretrizes
            </p>
          </div>
        </div>

        <BibliotecaList regras={data} />

      </main>
    </div>
  );
}
