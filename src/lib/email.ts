// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailConfirmacao(email: string, nome: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/login?token=${token}`;
  
  await resend.emails.send({
    from: "Poseidon <noreply@csstudios.site>",
    to: email,
    subject: "Confirme seu e-mail — Poseidon",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;background:#040f20;border-radius:12px;font-family:Arial,sans-serif">
        <h1 style="color:#fff;font-size:18px">Bem-vindo ao Poseidon, ${nome}!</h1>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6">
          Você está a um passo de acessar a plataforma mais completa de criação e gestão de projetos culturais do Brasil.
        </p>
        <a href="${url}" style="display:inline-block;background:#06b6d4;color:#020b18;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;margin-top:12px">
          Confirmar e-mail
        </a>
        <p style="color:#475569;font-size:10px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px">
          Poseidon — ARXUM Sistemas. Se você não criou esta conta, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

export async function enviarEmailRecuperacao(email: string, nome: string, urlRecuperacao: string) {
  await resend.emails.send({
    from: "Poseidon <noreply@csstudios.site>",
    to: email,
    subject: "Recuperação de acesso — Poseidon",
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;background:#040f20;border-radius:12px;font-family:Arial,sans-serif">
        <h1 style="color:#fff;font-size:18px">Recuperação de acesso</h1>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6">
          Olá, ${nome}. Recebemos sua solicitação para recuperar o acesso ao Poseidon. Clique no botão abaixo para criar uma nova senha.
        </p>
        <a href="${urlRecuperacao}" style="display:inline-block;background:#06b6d4;color:#020b10;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:12px;margin-top:12px">
          Redefinir senha
        </a>
        <p style="color:#475569;font-size:10px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px">
          Este link é válido por 1 hora. Se você não solicitou esta recuperação, ignore este e-mail.
        </p>
      </div>
    `,
  });
}