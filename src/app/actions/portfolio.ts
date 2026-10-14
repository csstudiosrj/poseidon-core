// src/app/actions/portfolio.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProjetoDestaque {
  nome: string;
  ano: number;
  mecanismo: string;
}

export interface PortfolioData {
  bio: string;
  areas: string[];
  links: {
    site?: string;
    instagram?: string;
    linkedin?: string;
  };
  projetos_destaque: ProjetoDestaque[];
}

export interface PortfolioPageData {
  proponente_id: string;
  nome_razao_social: string;
  portfolio: PortfolioData;
}

export const AREAS_CULTURAIS = [
  "Artes Cênicas",
  "Artes Visuais",
  "Audiovisual",
  "Circo",
  "Dança",
  "Design",
  "Literatura",
  "Moda",
  "Música",
  "Ópera",
  "Patrimônio Cultural",
  "Teatro",
];

const EMPTY_PORTFOLIO: PortfolioData = {
  bio: "",
  areas: [],
  links: {},
  projetos_destaque: [],
};

/* ─── Buscar dados do portfolio ─────────────────────────────────── */
export async function getPortfolioData(): Promise<
  PortfolioPageData | { error: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const { data, error } = await supabase
    .from("proponentes")
    .select("id, nome_razao_social, portfolio_data")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { error: "Perfil não encontrado." };

  const raw = data.portfolio_data as Record<string, unknown> | null;

  const portfolio: PortfolioData = {
    bio:
      typeof raw?.bio === "string" ? raw.bio : EMPTY_PORTFOLIO.bio,
    areas:
      Array.isArray(raw?.areas) ? (raw.areas as string[]) : EMPTY_PORTFOLIO.areas,
    links:
      raw?.links && typeof raw.links === "object"
        ? (raw.links as PortfolioData["links"])
        : EMPTY_PORTFOLIO.links,
    projetos_destaque:
      Array.isArray(raw?.projetos_destaque)
        ? (raw.projetos_destaque as ProjetoDestaque[])
        : EMPTY_PORTFOLIO.projetos_destaque,
  };

  return {
    proponente_id: data.id,
    nome_razao_social: data.nome_razao_social,
    portfolio,
  };
}

/* ─── Salvar portfolio ──────────────────────────────────────────── */
export async function salvarPortfolioAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const bio = ((formData.get("bio") as string) ?? "").trim();
  const areas = formData.getAll("areas") as string[];
  const site = ((formData.get("link_site") as string) ?? "").trim() || undefined;
  const instagram = ((formData.get("link_instagram") as string) ?? "").trim() || undefined;
  const linkedin = ((formData.get("link_linkedin") as string) ?? "").trim() || undefined;

  // Projetos destaque: enviados como JSON string
  let projetos_destaque: ProjetoDestaque[] = [];
  try {
    const raw = formData.get("projetos_destaque") as string;
    if (raw) projetos_destaque = JSON.parse(raw) as ProjetoDestaque[];
  } catch {
    // ignore parse error
  }

  // Validação básica
  if (bio.length > 1000)
    return { error: "Bio deve ter no máximo 1000 caracteres." };

  if (projetos_destaque.length > 5)
    return { error: "Máximo de 5 projetos em destaque." };

  const portfolio_data: PortfolioData = {
    bio,
    areas,
    links: { site, instagram, linkedin },
    projetos_destaque,
  };

  const { error: updateError } = await supabase
    .from("proponentes")
    .update({
      portfolio_data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Erro ao salvar portfolio:", updateError);
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/portfolio");
  return { success: true };
}
