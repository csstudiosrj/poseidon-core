import Dashboard from "@/app/components/Dashboard";
import { getDashboardData } from "@/app/actions/getDashboardData";

export default async function Page() {
  const initialData = await getDashboardData("poseidon-test-001");

  return (
    <main className="min-h-screen bg-slate-100">
      <Dashboard initialData={initialData} />
    </main>
  );
}