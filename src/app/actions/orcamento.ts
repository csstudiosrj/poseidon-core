// src/app/actions/orcamento.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  processarComando,
  extrairPromessas,
  validarContraTetos,
  sugerirDistribuicao,
  ContextoOrcamento,
  MensagemChat,
} from "@/lib/ia/orcamentista";
import { RegrasMecanismo } from "@/lib/ia/tipos";

export async function enviarMensagemAction(
  _prevState: { historico: MensagemChat[]; contexto?: ContextoOrcamento; erro?: string } | null,
  formData: FormData
): Promise<{ historico: MensagemChat[]; contexto?: ContextoOrcamento; erro?: string } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { historico: [], erro: "Sessão expirada." };

  const projetoId = formData.get("projeto_id") as string;
  const fonteId = formData.get("fonte_id") as string;
  const mensagemUsuario = formData.get("mensagem") as string;
  const contextoRaw = formData.get("contexto") as string;

  if (!projetoId || !fonteId || !mensagemUsuario) {
    return { historico: [], erro: "Dados incompletos." };
  }

  let contexto: ContextoOrcamento;
  if (contextoRaw) {
    contexto = JSON.parse(contextoRaw);
  } else {
    const { data: fonte } = await supabase
      .from("projeto_fontes")
      .select("valor_captacao, configuracao_regras, biblioteca_regras (configuracao_regras)")
      .eq("id", fonteId)
      .single();

    if (!fonte) return { historico: [], erro: "Fonte não encontrada." };

    const regras: RegrasMecanismo =
      (fonte.configuracao_regras as RegrasMecanismo) ||
      (fonte.biblioteca_regras?.configuracao_regras as RegrasMecanismo) || {
        mecanismo_nome: "Desconhecido",
        esfera: "Federal",
        secoes_obrigatorias: [],
        tetos: [],
        campos_formulario: [],
        documentos_obrigatorios: [],
      };

    const { data: itensExistentes } = await supabase
      .from("itens_orcamentarios")
      .select("descricao, categoria, valor, quantidade")
      .eq("projeto_id", projetoId);

    contexto = {
      projetoId,
      fonteId,
      orcamentoTotal: fonte.valor_captacao || 0,
      itens: (itensExistentes || []).map((item: any) => ({
        descricao: item.descricao,
        categoria: item.categoria,
        valor: item.valor,
        quantidade: item.quantidade || 1,
        justificativa: item.justificativa,
      })),
      regras,
    };
  }

  const comando = processarComando(mensagemUsuario, contexto);
  const historico: MensagemChat[] = [];

  switch (comando.acao) {
    case "adicionar": {
      if (comando.item) {
        contexto.itens.push(comando.item);
        const alertas = validarContraTetos(contexto.itens, contexto.regras, contexto.orcamentoTotal);
        historico.push({
          tipo: "assistente",
          texto: `✅ Item adicionado: "${comando.item.descricao}" — R$ ${comando.item.valor.toFixed(2)}`,
          alertas,
        });
      }
      break;
    }
    case "alterar": {
      if (comando.indice !== undefined && comando.item && contexto.itens[comando.indice]) {
        contexto.itens[comando.indice].valor = comando.item.valor;
        const alertas = validarContraTetos(contexto.itens, contexto.regras, contexto.orcamentoTotal);
        historico.push({
          tipo: "assistente",
          texto: `✅ Item ${comando.indice + 1} alterado para R$ ${comando.item.valor.toFixed(2)}`,
          alertas,
        });
      }
      break;
    }
    case "remover": {
      if (comando.indice !== undefined && contexto.itens[comando.indice]) {
        const removido = contexto.itens.splice(comando.indice, 1)[0];
        const alertas = validarContraTetos(contexto.itens, contexto.regras, contexto.orcamentoTotal);
        historico.push({
          tipo: "assistente",
          texto: `🗑️ Item ${comando.indice + 1} ("${removido.descricao}") removido.`,
          alertas,
        });
      }
      break;
    }
    case "listar": {
      if (contexto.itens.length === 0) {
        historico.push({ tipo: "assistente", texto: "Nenhum item cadastrado." });
      } else {
        historico.push({
          tipo: "assistente",
          texto: "📋 Itens atuais:",
          itens: contexto.itens,
        });
      }
      break;
    }
    default: {
      historico.push({
        tipo: "assistente",
        texto: "Não entendi. Tente comandos como:\n• 'adicionar [descrição] de R$ [valor]'\n• 'alterar item [número] para R$ [valor]'\n• 'remover item [número]'\n• 'listar itens'",
      });
    }
  }

  const historicoCompleto: MensagemChat[] = [
    { tipo: "usuario", texto: mensagemUsuario },
    ...historico,
  ];

  return { historico: historicoCompleto, contexto };
}

export async function salvarOrcamentoAction(
  _prevState: { success?: boolean; erro?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; erro?: string } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { erro: "Sessão expirada." };

  const projetoId = formData.get("projeto_id") as string;
  const fonteId = formData.get("fonte_id") as string;
  const itensRaw = formData.get("itens") as string;

  if (!projetoId || !fonteId || !itensRaw) return { erro: "Dados incompletos." };

  const itens = JSON.parse(itensRaw) as { descricao: string; categoria: string; valor: number; quantidade: number; justificativa?: string }[];

  const { error: deleteError } = await supabase
    .from("itens_orcamentarios")
    .delete()
    .eq("projeto_id", projetoId);

  if (deleteError) return { erro: "Erro ao limpar itens antigos." };

  const { error: insertError } = await supabase
    .from("itens_orcamentarios")
    .insert(
      itens.map((item) => ({
        projeto_id: projetoId,
        fonte_id: fonteId,
        descricao: item.descricao,
        categoria: item.categoria,
        valor: item.valor,
        quantidade: item.quantidade || 1,
        justificativa: item.justificativa || "",
      }))
    );

  if (insertError) return { erro: "Erro ao salvar itens." };

  return { success: true };
}