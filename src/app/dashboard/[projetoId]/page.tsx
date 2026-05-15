import Dashboard from "@/app/components/Dashboard";
import { getDashboardData } from "@/app/actions/getDashboardData";

type PageProps = {
  params: Promise<{
    projetoId: string;
  }>;
};

export default async function DashboardProjetoPage({ params }: PageProps) {
  const { projetoId } = await params;
  const initialData = await getDashboardData(projetoId);

  return (
    <main className="min-h-screen bg-slate-100">
      <Dashboard initialData={initialData} />
    </main>
  );
}