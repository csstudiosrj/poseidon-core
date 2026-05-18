// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailConfirmacao(email: string, nome: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar-email?token=${token}`;
  await resend.emails.send({
    from: "Poseidon <noreply@poseidon.app>",
    to: email,
    subject: "Confirme seu e-mail — Poseidon",
    html: `<h1>Olá, ${nome}!</h1><p>Clique no link para confirmar seu e-mail:</p><a href="${url}">${url}</a>`,
  });
}

export async function enviarEmailRecuperacao(email: string, nome: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha?token=${token}`;
  await resend.emails.send({
    from: "Poseidon <noreply@poseidon.app>",
    to: email,
    subject: "Recuperação de senha — Poseidon",
    html: `<h1>Olá, ${nome}!</h1><p>Clique no link para redefinir sua senha:</p><a href="${url}">${url}</a>`,
  });
}