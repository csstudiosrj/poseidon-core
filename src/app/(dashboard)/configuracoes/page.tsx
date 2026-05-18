// src/app/(dashboard)/configuracoes/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, FileText, Link, Camera, ArrowLeft } from "lucide-react";
import { uploadPortfolioAction, getPortfolioData } from "@/app/actions/portfolio";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import "../../globals.css";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [curriculo, setCurriculo] = useState("");
  const [links, setLinks] = useState("");
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const data = await getPortfolioData();
      if ("portfolio" in data) {
        setNome(data.nome || "");
        if (data.portfolio?.curriculo) setCurriculo(data.portfolio.curriculo);
        if (data.portfolio?.links) setLinks(data.portfolio.links.join("\n"));
        if (data.portfolio?.fotos) setFotosUrls(data.portfolio.fotos);
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  async function handleSalvar() {
    setEnviando(true);
    setErro("");
    setSucesso(false);

    const formData = new FormData();
    formData.append("curriculo", curriculo);
    formData.append("links", links);
    formData.append("fotosUrls", JSON.stringify(fotosUrls)); // envia as URLs já salvas

    const result = await uploadPortfolioAction(null, formData);

    if (result?.error) {
      setErro(result.error);
    } else if (result?.success) {
      setSucesso(true);
    }
    setEnviando(false);
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-sea-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Configurações</h1>
            <p className="text-white/40 text-xs mt-1">Gerencie seu portfólio profissional</p>
          </div>
        </div>

        {sucesso && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-400">
            Portfólio salvo com sucesso!
          </div>
        )}

        {erro && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {erro}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText size={16} className="text-cyan-400" />
            Currículo Profissional
          </h2>
          <textarea
            className="w-full bg-sea-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all min-h-[200px] resize-y"
            placeholder="Descreva sua trajetória profissional, principais projetos realizados, prêmios e reconhecimentos..."
            value={curriculo}
            onChange={(e) => setCurriculo(e.target.value)}
          />
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Link size={16} className="text-cyan-400" />
            Links e Referências
          </h2>
          <p className="text-white/40 text-xs">Cole links de matérias, vídeos, portfólios online (um por linha)</p>
          <textarea
            className="w-full bg-sea-950 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all min-h-[120px] resize-y"
            placeholder="https://exemplo.com/materia-jornal&#10;https://youtube.com/video-projeto&#10;https://instagram.com/perfil"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Camera size={16} className="text-cyan-400" />
            Fotos de Projetos Anteriores
          </h2>

          {fotosUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {fotosUrls.map((url, i) => (
                <img key={i} src={url} alt={`Foto ${i + 1}`} className="rounded-lg w-full h-24 object-cover" />
              ))}
            </div>
          )}

          <UploadDropzone<OurFileRouter, "portfolioPhotos">
            endpoint="portfolioPhotos"
            onClientUploadComplete={(res) => {
              const novasUrls = res?.map((file) => file.url) || [];
              setFotosUrls((prev) => [...prev, ...novasUrls]);
            }}
            onUploadError={(error) => {
              console.error(error);
              setErro("Erro ao enviar foto.");
            }}
            className="border border-dashed border-white/10 rounded-lg p-8 text-xs text-white/40 ut-label:text-white/60 ut-button:bg-cyan-500 ut-button:text-sea-950 ut-button:text-xs ut-button:h-9 ut-button:rounded-lg ut-button:cursor-pointer"
          />
          <p className="text-[10px] text-white/30">Máximo 10 fotos, até 8MB cada.</p>
        </div>

        <button
          onClick={handleSalvar}
          disabled={enviando || !curriculo.trim()}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{enviando ? "Salvando..." : "Salvar Portfólio"}</span>
        </button>
      </div>
    </div>
  );
}