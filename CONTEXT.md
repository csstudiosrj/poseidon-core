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
| Ícones | Lucide React |
| Deploy | Vercel |

**Regras de stack:**
- Sem bibliotecas de UI genéricas (shadcn, MUI, etc.)
- Sem Framer Motion
- Sem imagens externas
- Server Actions para mutações e busca de dados
- Server Components por padrão; `"use client"` só quando necessário (hooks, interatividade)

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
| Títulos | Syne (700–800) |
| Interface geral | Inter |
| Números e códigos | JetBrains Mono (tabular-nums) |

- Títulos: `letter-spacing: -0.04em`
- Labels pequenos: uppercase, `tracking-[0.18em]`, opacidade ~60%
- Números financeiros: sempre `font-mono` + `tabular-nums`

### Classes do design system (`globals.css`)

```
.ds-card          → card base com borda e fundo deep sea
.ds-card-glow     → card com halo ciano sutil
.ds-card-soft     → card mais suave (usado no formulário de login)
.ds-input         → input padrão do sistema
.ds-label         → label de campo
.ds-btn           → botão base
.ds-btn-primary   → botão primário ciano
.ds-badge         → badge genérico
.ds-badge-warning → badge âmbar
.ds-field         → wrapper de campo (label + input)
.ds-checkbox-row  → linha de checkbox
.ds-link-muted    → link discreto
.form-error       → mensagem de erro inline
.num-tabular      → fonte mono + tabular-nums
```

### Layout padrão

- Wrapper máximo: `max-w-[1360px]` centralizado
- Padding lateral: `px-6` desktop, `px-4` mobile
- Gap entre blocos: `gap-6` (24px)
- Border radius: `rounded-2xl` (cards), `rounded-xl` (inputs/badges), `rounded-3xl` (container principal)
- Sombras suaves e escuras — sem glow forte
- Grid principal do dashboard: `grid-cols-[1.35fr_360px]` (conteúdo + sidebar)

---

## Estrutura de arquivos relevantes

```
src/
├── app/
│   ├── globals.css                        ← Design system completo
│   ├── login/
│   │   ├── page.tsx                       ← Página de login/cadastro (client)
│   │   └── actions.ts                     ← Server actions: login(), signup()
│   ├── setup/
│   │   ├── page.tsx                       ← Setup do projeto (server, layout 2 colunas)
│   │   ├── setup-form.tsx                 ← Formulário de setup (client, useActionState)
│   │   └── actions/setupProjeto.ts        ← Server action: setupProjeto()
│   ├── (dashboard)/
│   │   └── hub/
│   │       ├── page.tsx                   ← Hub de projetos (server component async)
│   │       └── actions.ts                 ← (import via @/app/actions/hub)
│   └── actions/
│       └── hub.ts                         ← getHubData() — busca projetos do Supabase
└── lib/
    └── supabase/
        └── server.ts                      ← createClient() para server components
```

---

## Páginas já implementadas

### `/login` — Autenticação
- **Tipo:** Client Component (`"use client"`)
- **Layout:** duas colunas — hero/branding (esquerda) + formulário (direita)
- **Modos:** login e signup (toggle sem navegação)
- **Hook:** `useActionState` (React 19) com adaptadores para as server actions
- **Campos signup:** `email`, `nome_completo`, `documento` (CPF/CNPJ com máscara), `password`
- **Campos login:** `email`, `password`
- **Redirect on success:** `/hub`

### `/setup` — Configuração de novo projeto
- **Tipo:** Server Component (page) + Client Component (form)
- **Layout:** duas colunas — sidebar de contexto (380px) + formulário (flex-1)
- **Campos:**
  - Nome do projeto (texto livre)
  - Segmento cultural (dropdown — 10 segmentos oficiais Lei Rouanet)
  - Mecanismo de fomento (dropdown — `incentivo_fiscal`, `fundo`, `pnab`)
  - Valor total do projeto (máscara BRL em tempo real, hidden input com valor numérico)
- **Preview automático:** mostra rubricas calculadas (Adm 15%, Captação 10%, Divulgação 20%) ao digitar o valor
- **Redirect on success:** para a página do projeto criado

### `/hub` — Hub de projetos
- **Tipo:** Server Component async
- **Import da action:** `@/app/actions/hub` (não `./actions`)
- **Dados:** `getHubData()` retorna `{ projetos, resumo }` ou `{ error }`
- **Layout:** header + grid de resumo (4 cards) + grid de projetos ou empty state
- **Status dos projetos:** rascunho, ativo, enviado, finalizado, inativo, prestacao_contas

---

## Schema do Supabase (tabelas relevantes)

```sql
proponentes (
  id, user_id, tipo (PF|PJ), nome_razao_social,
  cpf_cnpj, email
)

projetos (
  id, proponente_id, nome_projeto, status,
  orcamento_total_solicitado, segmento_cultural, mecanismo,
  created_at, updated_at,
  biblioteca_regras_id → biblioteca_regras(mecanismo_nome, esfera)
)

biblioteca_regras (
  id, mecanismo_nome, esfera, ...regras IN MinC 29/2026
)
```

---

## Referência visual

O dashboard operacional (rubricas, feed de auditoria, compliance) foi gerado pelo Perplexity Computer como HTML autocontido. Serve como referência visual para o estilo — não é código React diretamente utilizável.

**Características visuais do dashboard de referência:**
- Background: `#020b18` com radial-gradient ciano sutil nos cantos
- Container principal: `border-radius: 28px`, borda translúcida, `box-shadow` escuro pesado
- KPI cards: label uppercase pequeno + valor mono grande + ícone Lucide no canto
- Rubricas: layout de tabela técnica com colunas Orçado / Executado / Utilização (barra fina) / Status
- Feed de auditoria: sidebar direita sticky com scroll próprio, eventos com ícone por tipo
- Compliance: lista de regras com ✓ OK / ✗ Violado por item
- Gauge de risco: SVG semicircular com needle, cor muda por faixa (verde/âmbar/vermelho)

---

## Regras de desenvolvimento

1. **Server Component por padrão.** Só adicionar `"use client"` quando o componente usa hooks ou eventos de browser.
2. **`useActionState` para forms.** Não usar `handleSubmit` manual. Actions precisam de assinatura `(prevState, formData)` — criar adaptadores se necessário.
3. **Imports de actions:** usar alias `@/app/actions/[arquivo]`, não caminhos relativos entre pastas diferentes.
4. **Sem comentários JSX dentro de atributos.** `{/* comentário */}` dentro de props quebra o build.
5. **Valores monetários:** sempre `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
6. **IDs do Supabase são UUID** — não usar `.padStart()` em IDs. Usar `.slice(0, 8)` para exibição curta.
7. **CSS do design system não deve ser sobrescrito com inline styles hexadecimais** — usar as variáveis `var(--color-*)`.
8. **Pseudoelementos e scrollbar customizada** precisam estar em CSS real (arquivo `.css`), não em `style={{}}` inline.

---

## Próximos passos conhecidos

- [ ] Dashboard de projeto individual (rubricas, feed de auditoria, compliance)
- [ ] Botão "Novo Projeto" no Hub conectado ao `/setup`
- [ ] Navbar global autenticada com logo Poseidon + logout
- [ ] Página de detalhes de rubrica
- [ ] Upload e validação de notas fiscais