// src/app/actions/portfolio.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { analisarPortfolio } from "@/lib/ia/portfolio";

export async function uploadPortfolioAction(
  _prevState: { error?: string; success?: boolean; pdfUrl?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; pdfUrl?: string } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const curriculo = formData.get("curriculo") as string;
  const links = formData.get("links") as string;
  const fotosUrlsRaw = formData.get("fotosUrls") as string;

  if (!curriculo || curriculo.trim().length < 10) {
    return { error: "O currículo deve ter pelo menos 10 caracteres." };
  }

  let fotosUrls: string[] = [];
  try {
    fotosUrls = JSON.parse(fotosUrlsRaw);
    if (!Array.isArray(fotosUrls)) fotosUrls = [];
  } catch { fotosUrls = []; }

  const linksArray = links
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("nome_razao_social")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Proponente não encontrado." };

  const conteudoPDF = analisarPortfolio({
    fotos: fotosUrls,
    links: linksArray,
    curriculo,
    nome: proponente.nome_razao_social,
  });

  const { error: updateError } = await supabase
    .from("proponentes")
    .update({
      portfolio_data: {
        curriculo,
        fotos: fotosUrls,
        links: linksArray,
        conteudo_pdf: conteudoPDF,
        pdf_gerado_em: new Date().toISOString(),
      },
    })
    .eq("user_id", user.id);

  if (updateError) return { error: "Erro ao salvar dados do portfólio." };

  return { success: true };
}

export async function getPortfolioData() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("portfolio_data, nome_razao_social")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente) return { error: "Proponente não encontrado." };

  return {
    nome: proponente.nome_razao_social,
    portfolio: proponente.portfolio_data || {},
  };
}

export async function gerarPDFPortfolioAction(): Promise<{ pdfBase64?: string; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data: proponente, error: propError } = await supabase
    .from("proponentes")
    .select("portfolio_data, nome_razao_social")
    .eq("user_id", user.id)
    .single();

  if (propError || !proponente || !proponente.portfolio_data?.curriculo) {
    return { error: "Portfólio não encontrado. Cadastre seu currículo primeiro." };
  }

  // Gera o PDF usando o módulo de IA (que retorna o conteúdo textual)
  const conteudo = analisarPortfolio({
    fotos: proponente.portfolio_data.fotos || [],
    links: proponente.portfolio_data.links || [],
    curriculo: proponente.portfolio_data.curriculo,
    nome: proponente.nome_razao_social,
  });

  // Retorna o conteúdo para renderização no frontend com @react-pdf/renderer
  return { pdfBase64: Buffer.from(conteudo).toString("base64") };
}