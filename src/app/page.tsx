import Dashboard from "@/components/Dashboard";
import { processarNovaDespesa } from "@/app/actions/processarNovaDespesa";

/**
 * Página Principal do Poseidon
 * Renderiza o Dashboard e injeta a Server Action de processamento
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-[#020b18]">
      <Dashboard action={processarNovaDespesa} />
    </main>
  );
}