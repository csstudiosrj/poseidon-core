// src/app/privacidade/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — Poseidon",
  description: "Como o Poseidon coleta, usa e protege seus dados pessoais conforme a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen" style={{ background: "#020b18", color: "#e2e8f0" }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Back link */}
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Voltar ao painel
        </Link>

        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
            Documento legal
          </p>
          <h1
            className="text-3xl font-extrabold text-white mb-3"
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.04em" }}
          >
            Política de Privacidade
          </h1>
          <p className="text-sm text-slate-400">
            Última atualização: outubro de 2026
          </p>
        </header>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Quem somos</h2>
            <p>
              O <strong className="text-white">Poseidon</strong> é uma plataforma de controle e
              auditoria de projetos culturais. Esta Política descreve como coletamos, usamos,
              armazenamos e protegemos seus dados pessoais, em conformidade com a{" "}
              <strong className="text-white">Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Dados que coletamos</h2>
            <p className="mb-3">
              Coletamos apenas os dados necessários para a prestação do serviço:
            </p>
            <div className="space-y-3">
              <div
                className="rounded-xl p-4"
                style={{ background: "#0a1628", border: "1px solid rgba(142,177,214,0.14)" }}
              >
                <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">Cadastro</p>
                <p className="text-slate-400">Nome completo, e-mail, CPF ou CNPJ.</p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#0a1628", border: "1px solid rgba(142,177,214,0.14)" }}
              >
                <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">Projetos culturais</p>
                <p className="text-slate-400">
                  Nome, segmento, mecanismo de fomento, valores orçamentários e documentos
                  que você optar por inserir (notas fiscais, comprovantes).
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#0a1628", border: "1px solid rgba(142,177,214,0.14)" }}
              >
                <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">Uso da plataforma</p>
                <p className="text-slate-400">
                  Logs de acesso, endereço IP e dados de navegação para segurança e diagnóstico.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Finalidade do tratamento</h2>
            <p className="mb-2">Usamos seus dados para:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Criar e manter sua conta de acesso;</li>
              <li>Fornecer as funcionalidades de gestão de projetos;</li>
              <li>Enviar comunicações transacionais (confirmação de e-mail, redefinição de senha);</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes;</li>
              <li>Cumprir obrigações legais aplicáveis.</li>
            </ul>
            <p className="mt-3 text-slate-400">
              Não utilizamos seus dados para publicidade de terceiros nem os vendemos a nenhuma parte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Base legal</h2>
            <p>
              O tratamento dos seus dados se baseia no{" "}
              <strong className="text-white">consentimento</strong> (art. 7º, I da LGPD),
              na{" "}
              <strong className="text-white">execução de contrato</strong> (art. 7º, V),
              e no{" "}
              <strong className="text-white">legítimo interesse</strong> para fins de segurança
              e melhoria do serviço (art. 7º, IX).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Compartilhamento de dados</h2>
            <p className="mb-3">
              Seus dados são processados pelos seguintes suboperadores, exclusivamente para
              viabilizar o funcionamento da plataforma:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-300">Supabase</strong> — banco de dados e autenticação (EUA, com cláusulas padrão de proteção);</li>
              <li><strong className="text-slate-300">Vercel</strong> — hospedagem da aplicação (EUA, com cláusulas padrão de proteção);</li>
              <li><strong className="text-slate-300">Resend</strong> — envio de e-mails transacionais.</li>
            </ul>
            <p className="mt-3">
              Não compartilhamos seus dados com órgãos públicos, parceiros comerciais ou terceiros,
              exceto quando exigido por lei ou ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Armazenamento e segurança</h2>
            <p>
              Os dados são armazenados em servidores com criptografia em repouso e em trânsito (TLS).
              Senhas nunca são armazenadas em texto plano — utilizamos hashing seguro via Supabase Auth.
              Adotamos medidas técnicas e organizacionais proporcionais ao risco para proteger
              suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Retenção dos dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir a conta,
              seus dados pessoais e projetos são removidos em até <strong className="text-white">30 dias</strong>,
              exceto quando a retenção for exigida por obrigação legal (ex.: registros fiscais
              por 5 anos, conforme a legislação tributária brasileira).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Seus direitos (LGPD, art. 18)</h2>
            <p className="mb-2">Você tem o direito de:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Confirmar se tratamos seus dados;</li>
              <li>Acessar os dados que armazenamos sobre você;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação dos dados desnecessários;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a portabilidade dos seus dados.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
              <a
                href="mailto:privacidade@poseidon.app"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                privacidade@poseidon.app
              </a>
              . Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies de sessão estritamente necessários para manter você autenticado.
              Não utilizamos cookies de rastreamento, analytics de terceiros ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Encarregado (DPO)</h2>
            <p>
              O encarregado pelo tratamento de dados pessoais pode ser contactado pelo e-mail{" "}
              <a
                href="mailto:privacidade@poseidon.app"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                privacidade@poseidon.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Notificaremos mudanças relevantes
              por e-mail. A data de última atualização indica a versão vigente.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 Poseidon</span>
          <Link href="/termos" className="hover:text-cyan-300 transition-colors">
            ← Termos de Uso
          </Link>
        </div>

      </main>
    </div>
  );
}
