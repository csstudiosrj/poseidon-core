// src/app/(dashboard)/projeto/[id]/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { getProjeto } from "@/app/actions/projeto";
import {
  FileText,
  Calendar,
  DollarSign,
  Tag,
  ArrowLeft,
  Edit3,
  Layers,
  Clock,
} from "lucide-react";
import Link from "next/link";
import "../../../globals.css";

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjeto(id);

  if ("error" in data) {
    redirect("/hub");
  }

  const { projeto } = data;

  // Trata biblioteca_regras (vem como array)
  const biblioteca = Array.isArray(projeto.biblioteca_regras)
    ? projeto.biblioteca_regras[0]
    : projeto.biblioteca_regras;

  const conteudo = projeto.conteudo_escrita || {};
  const itens = projeto.itens_orcamentarios || [];
  const orcamentoTotal = itens.reduce(
    (soma: number, item: any) => soma + Number(item.valor) * Number(item.quantidade),
    0
  );

  return (
    <div className="min-h-screen bg-sea-950 p-6 md:p-10 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link
          href="/hub"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/70"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {projeto.nome_projeto}
          </h1>
          <p className="text-sm text-white/40 flex items-center gap-2 mt-1">
            <Layers size={14} />
            {biblioteca?.mecanismo_nome || "Mecanismo não informado"} ·{" "}
            {biblioteca?.esfera || ""}
          </p>
        </div>
        <span className="badge badge-warning">{projeto.status}</span>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de conteúdo escrito */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seções do conteúdo */}
          {conteudo.justificativa && (
            <SectionCard
              title="Justificativa"
              content={conteudo.justificativa}
              icon={FileText}
            />
          )}
          {conteudo.objetivos && (
            <SectionCard
              title="Objetivos"
              content={conteudo.objetivos}
              icon={Target}
            />
          )}
          {conteudo.publico_alvo && (
            <SectionCard
              title="Público-Alvo"
              content={conteudo.publico_alvo}
              icon={Users}
            />
          )}
          {conteudo.acessibilidade && (
            <SectionCard
              title="Acessibilidade"
              content={conteudo.acessibilidade}
              icon={Accessibility}
            />
          )}
          {conteudo.contrapartida && (
            <SectionCard
              title="Contrapartida Social"
              content={conteudo.contrapartida}
              icon={Heart}
            />
          )}
          {conteudo.democratizacao && (
            <SectionCard
              title="Democratização do Acesso"
              content={conteudo.democratizacao}
              icon={Globe}
            />
          )}
          {conteudo.descricao_projeto && (
            <SectionCard
              title="Descrição do Projeto"
              content={conteudo.descricao_projeto}
              icon={FileText}
            />
          )}

          {Object.keys(conteudo).length === 0 && (
            <div className="card p-6 text-center">
              <FileText size={24} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">
                O conteúdo ainda não foi gerado. Acesse a{" "}
                <Link
                  href={`/escrita?projeto=${projeto.id}`}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Fábrica de Escrita
                </Link>{" "}
                para gerar o texto técnico.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar de resumo */}
        <aside className="space-y-6">
          {/* Card de informações */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Informações</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Status</span>
                <span className="text-white font-medium">{projeto.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Criado em</span>
                <span className="text-white font-medium">
                  {new Date(projeto.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Atualizado</span>
                <span className="text-white font-medium">
                  {new Date(projeto.updated_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Mecanismo</span>
                <span className="text-white font-medium">
                  {biblioteca?.mecanismo_nome || "—"}
                </span>
              </div>
            </div>
            <Link
              href={`/escrita?projeto=${projeto.id}`}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-semibold h-9 px-4 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.2)]"
            >
              <Edit3 size={14} />
              Editar na Escrita
            </Link>
          </div>

          {/* Orçamento */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-cyan-400" />
              Orçamento
            </h3>
            {itens.length > 0 ? (
              <>
                <div className="space-y-2">
                  {itens.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs border-b border-white/5 pb-2"
                    >
                      <div>
                        <p className="text-white/70">{item.descricao}</p>
                        <p className="text-white/30 text-[10px]">
                          {item.categoria} · Qtd: {item.quantidade}
                        </p>
                      </div>
                      <span className="text-white font-mono tabular-nums">
                        {Number(item.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-semibold text-white/60">Total</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {orcamentoTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-white/40 text-xs">
                Nenhum item orçamentário cadastrado.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Componentes auxiliares de ícones (fictícios para evitar imports extras) */
function Target({ size, className }: { size?: number; className?: string }) {
  return <FileText size={size} className={className} />;
}
function Users({ size, className }: { size?: number; className?: string }) {
  return <FileText size={size} className={className} />;
}
function Accessibility({ size, className }: { size?: number; className?: string }) {
  return <FileText size={size} className={className} />;
}
function Heart({ size, className }: { size?: number; className?: string }) {
  return <FileText size={size} className={className} />;
}
function Globe({ size, className }: { size?: number; className?: string }) {
  return <FileText size={size} className={className} />;
}

/* Card de seção */
function SectionCard({
  title,
  content,
  icon: Icon,
}: {
  title: string;
  content: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="card p-5 space-y-3">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Icon size={16} className="text-cyan-400" />
        {title}
      </h2>
      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}