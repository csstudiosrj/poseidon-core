import Dashboard from "@/components/Dashboard";
import { processarNovaDespesa } from "@/app/actions/processarNovaDespesa";
import { getDashboardData } from "@/app/actions/getDashboardData";

export default async function HomePage() {
  const initialData = await getDashboardData("poseidon-test-001");

  return (
    <main className="min-h-screen bg-slate-100">
      <Dashboard initialData={initialData} action={processarNovaDespesa} />
    </main>
  );
}