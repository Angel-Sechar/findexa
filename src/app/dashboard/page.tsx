"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CoachInsight } from "@/components/CoachInsight";
import { DashboardTabs } from "@/components/DashboardTabs";
import { FreedomIndex } from "@/components/FreedomIndex";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { DashboardData } from "@/types/finances";

function calculateYearsToFreedom(freedomIndex: number, totalExpenses: number, passiveIncome: number, cashFlow: number): number | null {
  if (freedomIndex >= 100) {
    return 0;
  }

  if (cashFlow <= 0) {
    return null;
  }

  const years = (totalExpenses - passiveIncome) / cashFlow / 12;
  return Math.max(0, Math.ceil(years));
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/snapshot", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null);

      if (!response) {
        if (!cancelled) {
          setErrorMessage("No pudimos cargar tu dashboard. Reintenta en unos segundos.");
          setIsLoading(false);
        }
        return;
      }

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        if (!cancelled) {
          setErrorMessage("No pudimos cargar tu dashboard. Reintenta en unos segundos.");
          setIsLoading(false);
        }
        return;
      }

      const payload = (await response.json()) as Partial<DashboardData>;

      if (!payload.snapshot || !payload.assets || !payload.liabilities || !payload.constants) {
        if (!cancelled) {
          setErrorMessage("No pudimos cargar tu dashboard. Reintenta en unos segundos.");
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setDashboard(payload as DashboardData);
        setIsLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const yearsToFreedom = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    return calculateYearsToFreedom(
      dashboard.snapshot.freedomIndex,
      dashboard.snapshot.totalExpenses,
      dashboard.snapshot.passiveIncome,
      dashboard.snapshot.cashFlow,
    );
  }, [dashboard]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <p className="text-sm text-slate-600">Cargando dashboard...</p>
          </Card>
        </div>
      </main>
    );
  }

  if (!dashboard || errorMessage) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-2">
            <h1 className="text-base font-semibold text-slate-900">No pudimos cargar tu dashboard</h1>
            <p className="text-sm text-[#D85A30]">{errorMessage ?? "Ocurrio un error inesperado."}</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Findexa</h1>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE] text-sm font-semibold text-[#0F6E56]">
            U
          </div>
        </header>

        <FreedomIndex index={dashboard.snapshot.freedomIndex} yearsToFreedom={yearsToFreedom} />

        <section className="grid grid-cols-2 gap-3">
          <Card className="space-y-1">
            <p className="text-xs text-slate-500">Ingresos totales</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(dashboard.snapshot.totalIncome)}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-slate-500">Gastos totales</p>
            <p className="text-sm font-semibold text-slate-900">{formatCurrency(dashboard.snapshot.totalExpenses)}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-slate-500">Ingresos pasivos</p>
            <p className="text-sm font-semibold text-[#0F6E56]">{formatCurrency(dashboard.snapshot.passiveIncome)}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-slate-500">Flujo de caja</p>
            <p className={`text-sm font-semibold ${dashboard.snapshot.cashFlow >= 0 ? "text-[#0F6E56]" : "text-[#D85A30]"}`}>
              {formatCurrency(dashboard.snapshot.cashFlow)}
            </p>
          </Card>
        </section>

        <DashboardTabs
          assets={dashboard.assets}
          constants={dashboard.constants}
          liabilities={dashboard.liabilities}
          snapshot={dashboard.snapshot}
        />

        <CoachInsight snapshotId={dashboard.snapshot.id} />
      </div>
    </main>
  );
}
