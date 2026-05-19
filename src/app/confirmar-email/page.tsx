import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ConfirmarEmailPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string };
}) {
  const { token_hash, type } = searchParams;

  // Renderiza algo básico enquanto processa (será substituído pelo redirect)
  if (!token_hash || type !== "email_confirmation") {
    return (
      <div className="min-h-screen bg-sea-950 flex items-center justify-center">
        <p className="text-white/60 text-sm">Link inválido ou expirado.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: "email_confirmation",
  });

  if (error) {
    return (
      <div className="min-h-screen bg-sea-950 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-sm font-medium">Erro ao confirmar e‑mail</p>
          <p className="text-white/40 text-xs">{error.message}</p>
          <a href="/login" className="text-cyan-400 text-xs hover:underline">
            Voltar para o login
          </a>
        </div>
      </div>
    );
  }

  // Redireciona para o login com flag de confirmação
  redirect("/login?confirmed=true");
}