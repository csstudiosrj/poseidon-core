// src/app/(dashboard)/escrita/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { gerarProjetoAction, buscarProjetosRascunho, buscarConteudoFonte } from "@/app/actions/escrita";
import { createClient } from "@/lib/supabase/client";
import "../../globals.css";

// interfaces e etapas...

function EscritaContent() {
  // estados...
  // useEffect para carregar projetos...
  // useEffect para carregar conteúdo existente quando edita (projetoSelecionado e fonteSelecionada)

  // ... restante da lógica
}

export default function EscritaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sea-950 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>}>
      <EscritaContent />
    </Suspense>
  );
}