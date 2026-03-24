import { ExportPanel } from "@/components/reports/export-panel";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";

export default async function ReportsPage() {
  const { metrics } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports & Exports</h1>
        <p className="mt-2 text-sm text-muted">
          Operational reporting for pipeline, workload, talent pool growth, and vacancy performance.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ExportPanel />
        <Card>
          <h3 className="text-lg font-semibold">Pipeline Summary</h3>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-slate-100">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
