// src/app/actions/fornecedores.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { validarFornecedor, calcularConcentracao } from "@/lib/compliance/fornecedores";

export async function cadastrarFornecedorAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; data?: any } | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Sessão expirada." };

  const cnpj = formData.get("cnpj") as string;
  const servicoDescricao = (formData.get("servico_descricao") as string) || "";
  const valorStr = formData.get("valor") as string;
  const projetoId = formData.get("projeto_id") as string;
  const fonteId = (formData.get("fonte_id") as string) || null;

  if (!cnpj || !projetoId || !valorStr) {
    return { error: "CNPJ, projeto e valor são obrigatórios." };
  }

  const valor = parseFloat(valorStr);
  if (isNaN(valor) || valor <= 0) {
    return { error: "Valor inválido." };
  }

  // 1. Validar o fornecedor
  const validacao = await validarFornecedor(cnpj, servicoDescricao);

  // 2. Inserir ou atualizar fornecedor na tabela
  const { data: fornecedorExistente } = await supabase
    .from("fornecedores")
    .select("id")
    .eq("cnpj", validacao.cnpj)
    .single();

  let fornecedorId: string;

  if (fornecedorExistente) {
    fornecedorId = fornecedorExistente.id;
    await supabase
      .from("fornecedores")
      .update({
        situacao_cadastral: validacao.situacao_cadastral,
        cnae_principal: validacao.cnae_principal,
        nome_razao_social: validacao.nome_razao_social,
        data_consulta: new Date().toISOString(),
      })
      .eq("id", fornecedorId);
  } else {
    const { data: novoFornecedor, error: insertError } = await supabase
      .from("fornecedores")
      .insert({
        cnpj: validacao.cnpj,
        nome_razao_social: validacao.nome_razao_social,
        cnae_principal: validacao.cnae_principal,
        situacao_cadastral: validacao.situacao_cadastral,
      })
      .select("id")
      .single();

    if (insertError || !novoFornecedor) {
      return { error: "Erro ao cadastrar fornecedor." };
    }
    fornecedorId = novoFornecedor.id;
  }

  // 3. Vincular ao projeto
  const { data: projeto } = await supabase
    .from("projetos")
    .select("id, proponente_id")
    .eq("id", projetoId)
    .single();

  if (!projeto) return { error: "Projeto não encontrado." };

  const glosaMotivo = validacao.status === "BLOQUEADO" ? validacao.mensagem : null;
  const statusFinal = validacao.status === "APROVADO" ? "validado" : "bloqueado";

  const { error: vincError } = await supabase
    .from("projeto_fornecedores")
    .insert({
      projeto_id: projetoId,
      fonte_id: fonteId,
      fornecedor_id: fornecedorId,
      valor,
      servico_descricao: servicoDescricao,
      status: statusFinal,
      glosa_motivo: glosaMotivo,
    });

  if (vincError) {
    return { error: "Erro ao vincular fornecedor ao projeto." };
  }

  return {
    success: true,
    data: {
      fornecedor: validacao.nome_razao_social,
      cnpj: validacao.cnpj,
      status: validacao.status,
      mensagem: validacao.mensagem,
    },
  };
}

export async function listarFornecedoresProjeto(projetoId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projeto_fornecedores")
    .select(`
      id,
      valor,
      servico_descricao,
      status,
      glosa_motivo,
      data_cadastro,
      fornecedores (cnpj, nome_razao_social, situacao_cadastral)
    `)
    .eq("projeto_id", projetoId)
    .order("data_cadastro", { ascending: false });

  if (error) return { error: error.message, fornecedores: [] };

  return {
    fornecedores: data.map((f: any) => ({
      id: f.id,
      cnpj: f.fornecedores?.cnpj,
      nome: f.fornecedores?.nome_razao_social || "Desconhecido",
      valor: f.valor,
      servico: f.servico_descricao,
      status: f.status,
      glosa_motivo: f.glosa_motivo,
      data_cadastro: f.data_cadastro,
    })),
  };
}