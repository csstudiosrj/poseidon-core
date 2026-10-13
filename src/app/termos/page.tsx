// src/app/termos/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — Poseidon",
  description: "Termos e condições de uso da plataforma Poseidon para projetos culturais.",
};

export default function TermosPage() {
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
            Termos de Uso
          </h1>
          <p className="text-sm text-slate-400">
            Última atualização: outubro de 2026
          </p>
        </header>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar a plataforma <strong className="text-white">Poseidon</strong>,
              você concorda com estes Termos de Uso. Se você não concordar com qualquer disposição,
              não utilize o serviço. O uso continuado da plataforma após alterações nos termos
              constitui aceitação das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Descrição do Serviço</h2>
            <p className="mb-3">
              O Poseidon é uma plataforma web de controle e auditoria de projetos culturais voltada
              para produtores e proponentes que atuam por meio da Lei Rouanet (PRONAC), Fundo Nacional
              de Cultura (FNC), Política Nacional Aldir Blanc (PNAB) e mecanismos afins.
            </p>
            <p>
              A plataforma oferece funcionalidades de organização de orçamento, acompanhamento de
              captação, controle de execução financeira e auxílio na prestação de contas,
              sem substituir a assessoria jurídica ou contábil especializada.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Cadastro e Conta</h2>
            <p className="mb-3">
              Para utilizar o Poseidon, você deve criar uma conta fornecendo informações verídicas,
              como nome completo e CPF ou CNPJ. Você é responsável por manter a confidencialidade
              de suas credenciais de acesso.
            </p>
            <p>
              É vedado criar contas para terceiros sem autorização, utilizar dados falsos ou
              transferir o acesso à sua conta a outras pessoas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Uso Permitido</h2>
            <p className="mb-2">Você pode utilizar o Poseidon para:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 mb-3">
              <li>Gerenciar projetos culturais de sua titularidade ou sob sua responsabilidade;</li>
              <li>Organizar documentos, notas fiscais e comprovantes relacionados a projetos;</li>
              <li>Acompanhar captação e execução orçamentária;</li>
              <li>Gerar relatórios e exportar informações para uso próprio.</li>
            </ul>
            <p>É expressamente vedado:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Utilizar a plataforma para fins ilícitos ou fraudulentos;</li>
              <li>Tentar acessar sistemas ou dados de outros usuários;</li>
              <li>Automatizar acessos sem autorização prévia;</li>
              <li>Reproduzir ou redistribuir o sistema sem licença.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Responsabilidade sobre os Dados</h2>
            <p className="mb-3">
              O Poseidon armazena as informações inseridas pelo usuário com fins operacionais.
              O usuário é o único responsável pela veracidade, integridade e legalidade dos dados,
              documentos e valores inseridos na plataforma.
            </p>
            <p>
              A plataforma não realiza análise jurídica dos projetos nem emite pareceres sobre
              conformidade com as exigências dos órgãos financiadores. As indicações de compliance
              são de caráter informativo e não substituem orientação profissional qualificada.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Disponibilidade do Serviço</h2>
            <p>
              O Poseidon é prestado "como está" e "conforme disponível". Não garantimos
              disponibilidade ininterrupta. Reservamo-nos o direito de realizar manutenções,
              atualizações e interrupções temporárias, preferencialmente com aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Propriedade Intelectual</h2>
            <p>
              O código-fonte, design, marca e demais elementos da plataforma Poseidon são de
              titularidade exclusiva dos seus criadores. O uso da plataforma não transfere
              qualquer direito de propriedade intelectual ao usuário.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Limitação de Responsabilidade</h2>
            <p>
              Na máxima extensão permitida pela lei, o Poseidon não se responsabiliza por danos
              indiretos, incidentais ou consequenciais decorrentes do uso ou incapacidade de uso
              da plataforma, incluindo perda de dados, projetos reprovados ou penalidades aplicadas
              por órgãos públicos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Cancelamento e Exclusão</h2>
            <p>
              Você pode excluir sua conta a qualquer momento nas configurações da plataforma.
              Os dados serão removidos conforme descrito na nossa{" "}
              <Link href="/privacidade" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Política de Privacidade
              </Link>
              . Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Notificaremos alterações relevantes
              por e-mail ou mediante aviso na plataforma. A data de última atualização no topo
              deste documento indica a versão vigente.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Contato</h2>
            <p>
              Dúvidas sobre estes Termos de Uso podem ser enviadas para{" "}
              <a
                href="mailto:suporte@poseidon.app"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                suporte@poseidon.app
              </a>
              .
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 Poseidon</span>
          <Link href="/privacidade" className="hover:text-cyan-300 transition-colors">
            Política de Privacidade →
          </Link>
        </div>

      </main>
    </div>
  );
}
