# Poseidon — Contexto do Projeto

> Cole este arquivo no início de qualquer conversa com IA para retomar o trabalho com contexto completo.

---

## O que é o Poseidon

Sistema web de **controle e auditoria de projetos culturais** para a Lei Rouanet e mecanismos afins (FNC, PNAB). Voltado para produtores culturais que precisam organizar captação, execução e prestação de contas sem se perder em planilhas.

**Tagline:** "Feito para quem vive de edital"

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + `globals.css` com design system próprio |
| Backend/Auth | Supabase (auth + banco PostgreSQL) |
| Upload de arquivos | UploadThing (`uploadthing` + `@uploadthing/react`) |
| E-mail transacional | Resend (`RESEND_API_KEY`) |
| Ícones | Lucide React |
| Deploy | Vercel (auto-deploy do branch `main`) |
| Base path | `/poseidon` (`basePath` em `next.config.ts`) — produção em `arxum.com.br/poseidon` |

**Regras de stack:**
- Sem bibliotecas de UI genéricas (shadcn, MUI, etc.)
- Sem Framer Motion
- Sem imagens externas
- Server Actions para todas as mutações
- Server Components por padrão; `"use client"` só quando necessário (hooks, interatividade)
- `useActionState` (React 19) para estado de formulários — nunca `handleSubmit` manual

---

## Identidade visual — Design System "Deep Sea"

### Paleta de cores (variáveis CSS em `globals.css`)

```css
--bg:            #020b18   /* fundo da página */
--surface:       #0a1628   /* superfície base */
--surface-2:     #0d1b31   /* superfície elevada */
--border:        rgba(142, 177, 214, 0.14)
--border-strong: rgba(34, 211, 238, 0.18)
--text:          rgba(248, 250, 252, 0.98)
--text-muted:    rgba(191, 219, 254, 0.74)
--text-faint:    rgba(148, 163, 184, 0.58)
--accent:        #22d3ee   /* ciano — cor principal de ação/ênfase */
--success:       #22c55e
--warning:       #f59e0b
--danger:        #ef4444
```

**Regras de cor:**
- Ciano (`--accent`) é reservado para ícones de ação, foco e botão primário. Não espalhar.
- Verde = OK/sucesso. Âmbar = atenção. Vermelho = crítico/erro.
- Sem roxo, violeta, pink, azul royal ou gradientes chamativos.
- Sem glow neon excessivo.

### Tipografia

| Uso | Fonte |
|---|---|
| Títulos / display | Syne (700–800) — variável `--font-display` |
| Interface geral | Inter — variável `--font-sans` |
| Números e códigos | JetBrains Mono — variável `--font-mono` |

- Títulos: `fontFamily: "Syne, sans-serif"`, `letterSpacing: "-0.04em"`
- Labels pequenos: uppercase, `tracking-[0.18em]`, opacidade ~60%
- Números financeiros: sempre `.num-tabular` (font-mono + tabular-nums)

### Classes do design system (`globals.css`)

```
.ds-card          → card base com borda e fundo deep sea
.ds-card-glow     → card com halo ciano sutil
.ds-card-soft     → card mais suave
.ds-input         → input padrão do sistema
.ds-label         → label de campo
.ds-btn           → botão base (ghost)
.ds-btn-primary   → botão primário ciano
.ds-badge         → badge genérico
.ds-badge-warning → badge âmbar
.ds-field         → wrapper de campo (label + input)
.ds-checkbox-row  → linha de checkbox
.ds-link-muted    → link discreto
.form-error       → mensagem de erro inline
.num-tabular      → font-mono + tabular-nums
```

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── globals.css                                    ← Design system completo
│   ├── layout.tsx                                     ← Root layout com fontes (Inter, JetBrains Mono, Syne)
│   ├── login/
│   │   ├── page.tsx                                   ← Login/cadastro (client component)
│   │   └── actions.ts                                 ← login(), signup()
│   ├── recuperar-senha/
│   │   └── page.tsx                                   ← Recuperação de senha
│   ├── termos/
│   │   └── page.tsx                                   ← Termos de Uso (LGPD)
│   ├── privacidade/
│   │   └── page.tsx                                   ← Política de Privacidade (LGPD)
│   ├── setup/
│   │   ├── page.tsx                                   ← Novo projeto (server)
│   │   └── setup-form.tsx                             ← Formulário de setup (client)
│   ├── api/
│   │   └── uploadthing/
│   │       ├── core.ts                                ← File router UploadThing (endpoint: notaFiscal)
│   │       └── route.ts                               ← Route handler Next.js para UploadThing
│   ├── actions/
│   │   ├── setup.ts                                   ← criarProjetoAction() — cria projeto + fontes, redireciona para /projeto/[id]
│   │   ├── projeto.ts                                 ← getProjetoData(id) — dados completos do projeto
│   │   ├── itens.ts                                   ← adicionarItemAction(), editarItemAction(), deletarItemAction()
│   │   ├── notas.ts                                   ← adicionarNotaAction(), deletarNotaAction()
│   │   └── hub.ts                                     ← getHubData() — lista de projetos do usuário
│   └── (dashboard)/
│       ├── DashboardShell.tsx                         ← Navbar + sidebar global (client)
│       ├── hub/
│       │   └── page.tsx                               ← Hub de projetos (server)
│       ├── escrita/                                   ← [pendente]
│       ├── portfolio/                                 ← [pendente]
│       ├── auditoria/                                 ← [pendente]
│       ├── configuracoes/                             ← [pendente]
│       └── projeto/
│           └── [id]/
│               ├── page.tsx                           ← Dashboard do projeto (server)
│               ├── NovoItemModal.tsx                  ← Modal adicionar item orçamentário (client)
│               ├── TabelaItens.tsx                    ← Tabela + editar/deletar itens (client)
│               └── NotasFiscais.tsx                   ← Seção notas fiscais + upload (client)
└── lib/
    ├── supabase/
    │   ├── server.ts                                  ← createClient() para Server Components
    │   └── client.ts                                  ← createClient() para Client Components
    └── uploadthing.ts                                 ← useUploadThing, UploadButton tipados
```

---

## Páginas implementadas

### `/login` — Autenticação
- Client Component, duas colunas: hero + formulário
- Modos login e signup no mesmo componente (toggle)
- Redirect on success: `/hub`

### `/recuperar-senha` — Recuperação de senha
- Envia magic link via Supabase

### `/setup` — Novo projeto
- Server page + client form (`useActionState`)
- Campos: nome do projeto + fontes de captação (tipo, mecanismo, valor)
- Redirect on success: `/projeto/[id]` do projeto recém-criado

### `/hub` — Lista de projetos
- Server Component async, busca via `getHubData()`
- Cards de projetos linkam para `/projeto/[id]`
- Botão "Novo Projeto" → `/setup`

### `/projeto/[id]` — Dashboard do projeto
- Server Component async, busca via `getProjetoData(id)`
- KPI cards: Total Captação, Total Orçado, Saldo, Notas Fiscais
- Grid: Itens Orçamentários (esquerda) + Fontes de Captação (direita)
- Seção full-width: Notas Fiscais com upload UploadThing
- Ownership check em todas as queries (via `proponentes!inner(user_id)`)

### `/termos` e `/privacidade` — LGPD
- Server Components estáticos com conteúdo completo

### DashboardShell (layout de todas as rotas `(dashboard)`)
- Sidebar colapsável com nav principal: Hub, Novo Projeto, Escrita, Portfólio, Auditoria
- Bottom nav: Configurações, Pagamentos
- Header: consolePath (ex: `console://projeto/abc123`), notificações, menu do usuário
- Logout via `supabase.auth.signOut()` + redirect para `/login`

---

## Schema do Supabase

```sql
proponentes (
  id uuid PK,
  user_id uuid → auth.users,
  tipo text,               -- "PF" | "PJ"
  nome_razao_social text,
  cpf_cnpj text,
  email text
)

projetos (
  id uuid PK,
  proponente_id uuid → proponentes,
  nome_projeto text,
  status text,             -- rascunho | ativo | enviado | finalizado | inativo | prestacao_contas
  created_at timestamptz,
  updated_at timestamptz
)

projeto_fontes (
  id uuid PK,
  projeto_id uuid → projetos,
  tipo text,               -- incentivo_fiscal | edital | patrocinio_direto
  mecanismo_id uuid → biblioteca_regras (nullable),
  nome_fonte text,         -- preenchido quando tipo != incentivo_fiscal
  valor_captacao numeric,
  status text,             -- rascunho | aprovado | reprovado
  configuracao_regras jsonb
)

itens_orcamentarios (
  id uuid PK,
  projeto_id uuid → projetos,
  fonte_id uuid → projeto_fontes (nullable),
  descricao text,
  categoria text,
  quantidade int,
  valor numeric,           -- valor unitário
  created_at timestamptz,
  updated_at timestamptz
)

notas_fiscais (
  id uuid PK,
  projeto_id uuid → projetos,
  fonte_id uuid → projeto_fontes (nullable),
  categoria text,
  descricao text,
  valor numeric,
  data_emissao date,
  arquivo_url text,        -- URL do UploadThing
  status text,             -- pendente | aprovada | glosa
  glosa_motivo text,
  created_at timestamptz
)

biblioteca_regras (
  id uuid PK,
  mecanismo_nome text,
  esfera text,
  configuracao_regras jsonb
)
```

---

## Variáveis de ambiente (`.env.local` e Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
UPLOADTHING_APP_ID=
UPLOADTHING_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Padrões de desenvolvimento

1. **Server Component por padrão.** `"use client"` só para hooks/eventos.
2. **`useActionState` para forms.** Actions: assinatura `(prevState, formData)`. Bind para passar args extras: `action.bind(null, projetoId)`.
3. **Ownership via join:** todas as mutações verificam autoria via `projetos!inner(proponentes!inner(user_id))`.
4. **`revalidatePath`** após toda mutação para forçar re-fetch do Server Component.
5. **Imports de actions:** alias `@/app/actions/[arquivo]`, nunca caminhos relativos entre pastas distintas.
6. **Valores monetários:** `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
7. **IDs Supabase são UUID** — `.slice(0, 8)` para exibição curta.
8. **Mask BRL em inputs:** input exibe string formatada; hidden input `valor_num` envia o float para a action.
9. **Sem comentários JSX dentro de atributos** — quebra build.
10. **ZIP + bash para entregas:** extrair em `/tmp`, copiar com `cp -rv` para `src/`, limpar depois.

---

## Entrega de código (padrão desta sessão)

```bash
# Extrair e instalar (rodar da raiz do projeto):
unzip ~/poseidon-core/poseidon-FEATURE.zip -d /tmp/nf && \
cp -rv /tmp/nf/FEATURE/src/* ~/poseidon-core/src/ && \
rm -rf /tmp/nf ~/poseidon-core/poseidon-FEATURE.zip && \
cd ~/poseidon-core && git add -A && git commit -m "feat: ..." && git push
```

---

## Páginas pendentes

- [ ] `/escrita` — assistente de escrita de projetos
- [ ] `/portfolio` — portfólio do proponente
- [ ] `/auditoria` — feed de auditoria e compliance
- [ ] `/configuracoes` — conta, perfil, dados do proponente
- [ ] Status de glosa nas notas fiscais (interface para admin reprovar/aprovar)
- [ ] Dashboard de compliance (regras Lei Rouanet por rubrica)
