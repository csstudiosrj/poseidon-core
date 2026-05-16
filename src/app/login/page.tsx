<!-- page-login.html (ou page.tsx adaptando a sintaxe) -->

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Poseidon — Acesso</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossorigin
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/globals.css" />
  </head>
  <body>
    <div class="app-shell">
      <div class="app-shell-inner">
        <!-- Lado hero / branding -->
        <section class="login-hero">
          <div class="login-hero-header">
            <!-- Mesmo logo do dashboard -->
            <svg
              aria-label="Poseidon"
              viewBox="0 0 32 32"
              width="28"
              height="28"
              fill="none"
            >
              <path
                d="M16 3 L16 29 M10 10 L16 3 L22 10 M8 18 L16 29 L24 18"
                stroke="#22d3ee"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="rgba(34,211,238,0.2)"
                stroke-width="1.5"
                stroke-dasharray="4 3"
              />
            </svg>
            <div>
              <div class="login-hero-title">Poseidon</div>
              <div
                class="text-[11px] uppercase tracking-[0.14em]"
                style="color: rgba(148,163,184,0.9);"
              >
                Controle e auditoria cultural
              </div>
            </div>
          </div>

          <span class="ds-badge ds-badge-warning" style="margin-bottom: 10px;">
            Feito para quem vive de edital
          </span>

          <p class="login-hero-sub">
            Organize captação, execução e prestação de contas em um só sistema,
            sem se perder em planilhas e e-mails espalhados pela maré de
            burocracia.
          </p>

          <div
            style="
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
              font-size: 11px;
              color: rgba(148,163,184,0.9);
            "
          >
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span class="num-tabular">R$ 4.200.000</span>
              <span style="opacity: 0.8;">em orçamento simulado</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span class="num-tabular">IA + regras MinC</span>
              <span style="opacity: 0.8;">pra não afundar em glosa</span>
            </div>
          </div>
        </section>

        <!-- Lado formulário -->
        <section class="ds-card-soft" style="padding: 22px 20px;">
          <header
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              margin-bottom: 18px;
            "
          >
            <div>
              <h1
                style="
                  font-size: 17px;
                  font-weight: 600;
                  color: var(--color-text);
                "
                id="form-title"
              >
                Entrar no Poseidon
              </h1>
              <p
                style="
                  font-size: 12px;
                  color: rgba(148,163,184,0.9);
                  margin-top: 4px;
                "
                id="form-sub"
              >
                Acompanhe seus projetos culturais com o mesmo cuidado que o
                fiscal do edital.
              </p>
            </div>
          </header>

          <form
            id="auth-form"
            style="display: flex; flex-direction: column; gap: 12px;"
          >
            <div class="ds-field">
              <label for="email" class="ds-label">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                class="ds-input"
                placeholder="voce@produtora.com"
                required
              />
            </div>

            <div class="ds-field" id="field-name" style="display: none;">
              <label for="name" class="ds-label">Nome completo</label>
              <input
                type="text"
                id="name"
                name="name"
                class="ds-input"
                placeholder="Nome de quem responde pelo projeto"
              />
            </div>

            <div class="ds-field" id="field-doc" style="display: none;">
              <label for="doc" class="ds-label">CPF ou CNPJ</label>
              <input
                type="text"
                id="doc"
                name="doc"
                class="ds-input num-tabular"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>

            <div class="ds-field">
              <label for="password" class="ds-label">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                class="ds-input"
                placeholder="Use uma senha forte"
                required
              />
            </div>

            <div
              id="field-password-confirm"
              class="ds-field"
              style="display: none;"
            >
              <label for="password-confirm" class="ds-label"
                >Confirmar senha</label
              >
              <input
                type="password"
                id="password-confirm"
                name="password-confirm"
                class="ds-input"
                placeholder="Repita a senha"
              />
            </div>

            <div
              class="ds-checkbox-row"
              id="row-remember"
              style="margin-top: 4px;"
            >
              <input type="checkbox" id="remember" name="remember" checked />
              <label for="remember">Manter conectado neste dispositivo</label>
            </div>

            <div
              id="row-terms"
              class="ds-checkbox-row"
              style="display: none; margin-top: 4px;"
            >
              <input type="checkbox" id="terms" name="terms" />
              <label for="terms">
                Concordo com o uso de dados para análise de projetos culturais.
              </label>
            </div>

            <button
              type="submit"
              class="ds-btn ds-btn-primary"
              style="width: 100%; margin-top: 10px;"
              id="primary-action"
            >
              Entrar
            </button>

            <p
              class="ds-link-muted"
              style="margin-top: 10px; text-align: center;"
            >
              <span id="toggle-text">
                Ainda não tem acesso?
                <button
                  type="button"
                  id="toggle-mode"
                  style="
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    font-size: 12px;
                  "
                >
                  Criar conta
                </button>
              </span>
            </p>

            <!-- Mensagem de erro genérica (placeholder) -->
            <p
              id="form-error"
              class="form-error"
              style="display: none; text-align: center;"
            >
              Verifique os dados informados.
            </p>
          </form>
        </section>
      </div>
    </div>

    <script>
      // Toggle entre login e cadastro (sem backend, só front)
      const toggleBtn = document.getElementById("toggle-mode");
      const formTitle = document.getElementById("form-title");
      const formSub = document.getElementById("form-sub");
      const primaryAction = document.getElementById("primary-action");
      const rowRemember = document.getElementById("row-remember");
      const rowTerms = document.getElementById("row-terms");
      const fieldName = document.getElementById("field-name");
      const fieldDoc = document.getElementById("field-doc");
      const fieldPassConf = document.getElementById("field-password-confirm");
      const formError = document.getElementById("form-error");

      let mode = "login"; // ou "signup"

      toggleBtn.addEventListener("click", () => {
        formError.style.display = "none";

        if (mode === "login") {
          mode = "signup";
          formTitle.textContent = "Criar acesso ao Poseidon";
          formSub.textContent =
            "Comece a testar o controle de rubricas e o feed de auditoria com um projeto simulado.";
          primaryAction.textContent = "Criar conta";
          toggleBtn.textContent = "Voltar para login";

          rowRemember.style.display = "none";
          rowTerms.style.display = "flex";
          fieldName.style.display = "flex";
          fieldDoc.style.display = "flex";
          fieldPassConf.style.display = "flex";
        } else {
          mode = "login";
          formTitle.textContent = "Entrar no Poseidon";
          formSub.textContent =
            "Acompanhe seus projetos culturais com o mesmo cuidado que o fiscal do edital.";
          primaryAction.textContent = "Entrar";
          toggleBtn.textContent = "Criar conta";

          rowRemember.style.display = "flex";
          rowTerms.style.display = "none";
          fieldName.style.display = "none";
          fieldDoc.style.display = "none";
          fieldPassConf.style.display = "none";
        }
      });

      // Placeholder de submit: só evita reload e exibe msg
      document
        .getElementById("auth-form")
        .addEventListener("submit", (e) => {
          e.preventDefault();
          formError.style.display = "block";
          formError.textContent =
            mode === "login"
              ? "Login ainda não conectado ao backend."
              : "Cadastro ainda não conectado ao backend.";
        });
    </script>
  </body>
</html>