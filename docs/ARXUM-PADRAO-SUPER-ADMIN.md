# Padrão de Super Admin ARXUM (Admin Kit)

Atualizado em 19/11/2026. Vale para todos os produtos ARXUM.

## Regra de implementação

- **Quando o código listado em "Neste produto" for tocado, implemente o item correspondente do padrão na mesma entrega.** Não espere uma fase própria de migração.
- A migração anda **em paralelo** ao trabalho em curso, sempre que fizer sentido. Item pequeno e do mesmo assunto entra no mesmo PR. Item que mexe em banco, acesso ou cobrança vai em PR separado.
- A migração nunca bloqueia a entrega original e não vira uma "grande migração". O objetivo agora é **padronizar**, não unificar: cada produto mantém o próprio banco.
- Se o item exigir uma decisão do dono (dependência nova, mudança grande, cobrança), pare e pergunte antes. Siga as regras do `CLAUDE.md` deste repositório.

## O padrão em resumo

- O super admin é identificado por uma tabela própria da plataforma, nunca por texto livre nem por dado vindo do cliente. A conferência é sempre no servidor.
- Quatro papéis fixos: super admin, suporte, financeiro e somente leitura.
- Toda ação de super admin passa por uma única função no servidor, que confere o papel e grava o evento de auditoria. Formato do evento: `entidade.acao`, com quem, quando, alvo e detalhes.
- Tabelas com prefixo `admin_*`, nomes em inglês, `uuid` e coluna `product_slug`. A versão do kit fica em `admin_kit_meta`.
- O kit nunca lê as tabelas do produto direto. O produto mapeia o próprio "tenant" (escola, empresa, produtora, conta...) por um adaptador com nome, slug, status, plano, vencimento, observação do admin, suspensão e se é demonstração.
- A chave de servidor do Supabase (service role) só existe no servidor.
- No banco: nenhuma função `SECURITY DEFINER` chamável por visitantes sem necessidade, `search_path` fixo em toda função e proteção contra senha vazada ligada no Auth.

O checklist completo (15 módulos, 85 itens) e as fases do plano estão no documento "Padrão de Super Admin ARXUM — Checklist e Plano de Implementação", que o dono mantém na conta Claude dele.

## Neste produto

**Poseidon** não tem área de plataforma. Quando surgir o primeiro código de plano, cobrança ou gestão de contas, instale o kit antes, em vez de criar um painel próprio.

Gatilhos (mexeu aqui, implemente junto):
- Qualquer tela ou ação de plataforma nova: usar o kit.
- Funções do banco (`fn_*`): fixar `search_path` e retirar o acesso de visitantes das que não precisam.
- O último deploy de produção falhou em `npm run build`: corrigir antes de qualquer outra entrega.
