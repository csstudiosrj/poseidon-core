// src/app/actions/notas.ts
"use server";

import { createClient } from "@/lib/supabase/server";

interface NotaFiscal {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_emissao: string;
  status: string;
  glosa_motivo?: string;
}

export async function listarNotasFiscais(
  projetoId: string
): Promise<{ notas: NotaFiscal[] } | { error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { notas: data as NotaFiscal[] };
}

export async function criarNotaFiscalAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const projetoId = formData.get("projeto_id") as string;
  const fonteId = (formData.get("fonte_id") as string) || null;
  const descricao = formData.get("descricao") as string;
  const categoria = formData.get("categoria") as string;
  const valorStr = formData.get("valor") as string;
  const arquivoUrl = (formData.get("arquivo_url") as string) || null;

  if (!projetoId || !descricao || !categoria || !valorStr) {
    return { error: "Todos os campos são obrigatórios." };
  }

  const valor = parseFloat(valorStr);
  if (isNaN(valor) || valor <= 0) {
    return { error: "Valor inválido." };
  }

  // Verifica permissão
  const { data: proponente } = await supabase
    .from("proponentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!proponente) return { error: "Proponente não encontrado." };

  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, proponente_id")
    .eq("id", projetoId)
    .eq("proponente_id", proponente.id)
    .single();

  if (!projeto) return { error: "Projeto não encontrado ou sem permissão." };

  // Validação contra tetos e saldo (se houver fonte)
  let status: "validada" | "glosada" = "validada";
  let glosaMotivo: string | null = null;

  if (fonteId) {
    const { data: fonte } = await supabase
      .from("projeto_fontes")
      .select("valor_captacao, configuracao_regras")
      .eq("id", fonteId)
      .single();

    if (fonte) {
      const regras = fonte.configuracao_regras as any;
      const tetos = regras?.tetos || [];

      // Soma os valores já lançados na mesma categoria e fonte
      const { data: notasExistentes } = await supabase
        .from("notas_fiscais")
        .select("valor")
        .eq("projeto_id", projetoId)
        .eq("fonte_id", fonteId)
        .eq("categoria", categoria)
        .eq("status", "validada");

      const totalCategoria = (notasExistentes || []).reduce(
        (soma, n) => soma + Number(n.valor),
        0
      );
      const novoTotal = totalCategoria + valor;

      // Verifica teto
      const teto = tetos.find((t: any) => t.categoria === categoria);
      if (teto) {
        const maximo = (fonte.valor_captacao * teto.percentual_maximo) / 100;
        if (novoTotal > maximo) {
          status = "glosada";
          glosaMotivo = `Teto excedido: ${teto.descricao} (máximo R$ ${maximo.toFixed(2)}, atual R$ ${novoTotal.toFixed(2)})`;
        }
      }

      // Verifica saldo da fonte
      const { data: todasNotas } = await supabase
        .from("notas_fiscais")
        .select("valor")
        .eq("projeto_id", projetoId)
        .eq("fonte_id", fonteId)
        .eq("status", "validada");

      const totalExecutado = (todasNotas || []).reduce(
        (soma, n) => soma + Number(n.valor),
        0
      );
      if (totalExecutado + valor > fonte.valor_captacao) {
        status = "glosada";
        glosaMotivo = `Saldo insuficiente: executado R$ ${totalExecutado.toFixed(2)} + R$ ${valor.toFixed(2)} = R$ ${(totalExecutado + valor).toFixed(2)} > R$ ${fonte.valor_captacao.toFixed(2)}`;
      }
    }
  }

  const { error: insertError } = await supabase.from("notas_fiscais").insert({
    projeto_id: projetoId,
    fonte_id: fonteId,
    descricao,
    categoria,
    valor,
    arquivo_url: arquivoUrl,
    status,
    glosa_motivo: glosaMotivo,
  });

  if (insertError) return { error: "Erro ao salvar nota fiscal." };

  return { success: true };
}

export async function getResumoFinanceiro(projetoId: string) {
  const supabase = await createClient();

  const { data: notas } = await supabase
    .from("notas_fiscais")
    .select("categoria, valor, status")
    .eq("projeto_id", projetoId);

  const { data: fontes } = await supabase
    .from("projeto_fontes")
    .select("id, tipo, nome_fonte, valor_captacao, configuracao_regras, biblioteca_regras (mecanismo_nome)")
    .eq("projeto_id", projetoId);

  if (!notas || !fontes) return { error: "Erro ao carregar dados." };

  // Calcula rubricas
  const rubricas: Record<string, { categoria: string; orcado: number; executado: number; glosa: number; tetoLegal: number }> = {};

  for (const fonte of fontes) {
    const regras = fonte.configuracao_regras as any;
    const tetos = regras?.tetos || [];

    for (const teto of tetos) {
      if (!rubricas[teto.categoria]) {
        rubricas[teto.categoria] = {
          categoria: teto.categoria,
          orcado: 0,
          executado: 0,
          glosa: 0,
          tetoLegal: 0,
        };
      }
      const maximo = (fonte.valor_captacao * teto.percentual_maximo) / 100;
      rubricas[teto.categoria].orcado += maximo;
      rubricas[teto.categoria].tetoLegal += maximo;
    }
  }

  for (const nota of notas) {
    if (rubricas[nota.categoria]) {
      if (nota.status === "validada") {
        rubricas[nota.categoria].executado += Number(nota.valor);
      } else if (nota.status === "glosada") {
        rubricas[nota.categoria].glosa += Number(nota.valor);
      }
    }
  }

  return {
    rubricas: Object.values(rubricas),
    totalCaptado: fontes.reduce((s, f) => s + Number(f.valor_captacao), 0),
    totalExecutado: notas.filter((n) => n.status === "validada").reduce((s, n) => s + Number(n.valor), 0),
    totalGlosado: notas.filter((n) => n.status === "glosada").reduce((s, n) => s + Number(n.valor), 0),
  };
}