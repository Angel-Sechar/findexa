"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FinancialSnapshot } from "@/types/finances";

const REVEAL_SEEN_STORAGE_KEY = "findexa-reveal-seen";
const COUNT_UP_DURATION_MS = 1500;

type SnapshotApiResponse = {
  snapshot: FinancialSnapshot;
};

function calculateYearsToFreedom(snapshot: FinancialSnapshot): number | null {
  if (snapshot.freedomIndex >= 100) {
    return 0;
  }

  if (snapshot.cashFlow <= 0) {
    return null;
  }

  const years = (snapshot.totalExpenses - snapshot.passiveIncome) / snapshot.cashFlow / 12;
  return Math.max(0, Math.ceil(years));
}

export default function RevealPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenReveal = window.localStorage.getItem(REVEAL_SEEN_STORAGE_KEY);

    if (hasSeenReveal) {
      router.replace("/dashboard");
      return;
    }

    let cancelled = false;

    const loadSnapshot = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/snapshot", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null);

      if (!response || !response.ok) {
        if (!cancelled) {
          setErrorMessage("No pudimos cargar tu resultado. Reintentá en unos segundos.");
          setIsLoading(false);
        }
        return;
      }

      const payload = (await response.json()) as Partial<SnapshotApiResponse>;

      if (!payload.snapshot || typeof payload.snapshot.freedomIndex !== "number") {
        if (!cancelled) {
          setErrorMessage("No pudimos cargar tu resultado. Reintentá en unos segundos.");
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setSnapshot(payload.snapshot);
        setIsLoading(false);
        window.localStorage.setItem(REVEAL_SEEN_STORAGE_KEY, "true");
      }
    };

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    let animationFrameId = 0;
    const startedAt = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(1, elapsed / COUNT_UP_DURATION_MS);
      const nextValue = Math.round(snapshot.freedomIndex * progress);

      setDisplayedIndex(nextValue);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [snapshot]);

  const yearsToFreedom = useMemo(() => {
    if (!snapshot) {
      return null;
    }

    return calculateYearsToFreedom(snapshot);
  }, [snapshot]);

  const subtitle = useMemo(() => {
    if (!snapshot) {
      return "";
    }

    if (snapshot.freedomIndex === 100) {
      return "Eres financieramente libre!";
    }

    if (snapshot.freedomIndex === 0) {
      return "Aun no tenes activos. Ese es el primer paso.";
    }

    if (yearsToFreedom === null) {
      return "A este ritmo, aun no podemos estimar en cuantos anios seras libre.";
    }

    return `A este ritmo, seras libre en ${yearsToFreedom} anios.`;
  }, [snapshot, yearsToFreedom]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-2 text-center">
            <p className="text-sm font-medium text-slate-600">Calculando tu resultado...</p>
            <p className="text-xs text-slate-500">Un momento, ya casi esta listo.</p>
          </Card>
        </div>
      </main>
    );
  }

  if (errorMessage || !snapshot) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <Card className="space-y-4 text-center">
            <h1 className="text-lg font-semibold text-slate-900">No pudimos mostrar tu indice</h1>
            <p className="text-sm text-[#D85A30]">{errorMessage ?? "Ocurrio un error inesperado."}</p>
            <Button
              fullWidth
              onClick={() => {
                window.location.reload();
              }}
              type="button"
            >
              Reintentar
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Card className="space-y-5 text-center">
          <p className="text-sm font-medium text-[#0F6E56]">Tu indice de libertad financiera</p>

          <div>
            <p className="text-6xl font-bold leading-none text-[#1D9E75]">{displayedIndex}%</p>
            <p className="mt-3 text-base text-slate-800">Hoy eres {snapshot.freedomIndex}% libre.</p>
          </div>

          <p className="text-sm text-slate-600">{subtitle}</p>

          <Button
            fullWidth
            onClick={() => {
              router.push("/dashboard");
            }}
            type="button"
          >
            Ver mi balance completo
          </Button>
        </Card>
      </div>
    </main>
  );
}
