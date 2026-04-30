"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStep } from "@/components/OnboardingStep";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type {
  Constant,
  OnboardingAssetInput,
  OnboardingData,
  OnboardingLiabilityInput,
  SnapshotRequest,
  SnapshotResponse,
} from "@/types/finances";

type ConstantsApiResponse = {
  constants: Constant[];
};

function buildSnapshotPayload(data: OnboardingData): SnapshotRequest {
  return {
    salaryIncome: data.salaryIncome ?? 0,
    otherIncome: data.otherIncome ?? 0,
    housingExpense: data.housingExpense ?? 0,
    foodExpense: data.foodExpense ?? 0,
    transportExpense: data.transportExpense ?? 0,
    otherExpenses: data.otherExpenses ?? 0,
    assets: data.assets ?? [],
    liabilities: data.liabilities ?? [],
  };
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>({ step: 1, assets: [], liabilities: [] });
  const [constants, setConstants] = useState<Constant[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingConstants, setIsLoadingConstants] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadConstants = async () => {
      setIsLoadingConstants(true);
      setLoadError(null);

      const response = await fetch("/api/constants", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null);

      if (!response || !response.ok) {
        if (!cancelled) {
          setLoadError("No pudimos cargar los tipos. Reintentá en unos segundos.");
          setIsLoadingConstants(false);
        }
        return;
      }

      const payload = (await response.json()) as Partial<ConstantsApiResponse>;

      if (!payload.constants || !Array.isArray(payload.constants)) {
        if (!cancelled) {
          setLoadError("No pudimos cargar los tipos. Reintentá en unos segundos.");
          setIsLoadingConstants(false);
        }
        return;
      }

      if (!cancelled) {
        setConstants(payload.constants);
        setIsLoadingConstants(false);
      }
    };

    void loadConstants();

    return () => {
      cancelled = true;
    };
  }, []);

  const liabilityTypeOptions = useMemo(
    () => constants.filter((constant) => constant.id === 104),
    [constants],
  );
  const assetTypeOptions = useMemo(() => constants.filter((constant) => constant.id === 103), [constants]);

  const setStep = (step: OnboardingData["step"]) => setData((prev) => ({ ...prev, step }));

  const addLiability = () => {
    const defaultTypeId = liabilityTypeOptions[0]?.value ?? 1;
    const nextLiability: OnboardingLiabilityInput = {
      name: "",
      monthlyPayment: 0,
      totalBalance: 0,
      typeId: defaultTypeId,
    };

    setData((prev) => ({ ...prev, liabilities: [...(prev.liabilities ?? []), nextLiability] }));
  };

  const addAsset = () => {
    const defaultTypeId = assetTypeOptions[0]?.value ?? 1;
    const nextAsset: OnboardingAssetInput = {
      name: "",
      monthlyIncome: 0,
      typeId: defaultTypeId,
    };

    setData((prev) => ({ ...prev, assets: [...(prev.assets ?? []), nextAsset] }));
  };

  const updateLiability = (index: number, update: Partial<OnboardingLiabilityInput>) => {
    setData((prev) => {
      const nextLiabilities = [...(prev.liabilities ?? [])];
      nextLiabilities[index] = { ...nextLiabilities[index], ...update };
      return { ...prev, liabilities: nextLiabilities };
    });
  };

  const updateAsset = (index: number, update: Partial<OnboardingAssetInput>) => {
    setData((prev) => {
      const nextAssets = [...(prev.assets ?? [])];
      nextAssets[index] = { ...nextAssets[index], ...update };
      return { ...prev, assets: nextAssets };
    });
  };

  const submitSnapshot = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = buildSnapshotPayload(data);

    const response = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response || !response.ok) {
      setIsSubmitting(false);
      setSubmitError("No pudimos calcular tu índice. Tocá reintentar.");
      return;
    }

    const parsed = (await response.json()) as Partial<SnapshotResponse>;

    if (typeof parsed.freedomIndex !== "number") {
      setIsSubmitting(false);
      setSubmitError("No pudimos calcular tu índice. Tocá reintentar.");
      return;
    }

    setIsSubmitting(false);
    router.push("/reveal");
  };

  if (isLoadingConstants) {
    return (
      <OnboardingStep step={1} title="Preparando tus preguntas" description="Cargando datos iniciales...">
        <p className="text-sm text-slate-600">Un momento, ya arrancamos.</p>
      </OnboardingStep>
    );
  }

  if (loadError) {
    return (
      <OnboardingStep step={1} title="No pudimos iniciar" description={loadError}>
        <Button
          fullWidth
          onClick={() => {
            window.location.reload();
          }}
          type="button"
        >
          Reintentar
        </Button>
      </OnboardingStep>
    );
  }

  if (data.step === 1) {
    return (
      <OnboardingStep
        step={1}
        title="¿Cuánto ganás al mes?"
        description="Necesitamos tus ingresos para calcular tu índice."
      >
        <div className="space-y-4">
          <Input
            label="Sueldo mensual"
            type="number"
            min={0}
            required
            value={data.salaryIncome ?? ""}
            onChange={(event) => setData((prev) => ({ ...prev, salaryIncome: parseNumber(event.target.value) }))}
          />

          <Input
            label="Otros ingresos"
            type="number"
            min={0}
            value={data.otherIncome ?? 0}
            onChange={(event) => setData((prev) => ({ ...prev, otherIncome: parseNumber(event.target.value) }))}
            helperText="Opcional. Si no tenés, dejalo en 0."
          />

          <Button
            fullWidth
            onClick={() => {
              if ((data.salaryIncome ?? 0) <= 0) {
                setSubmitError("Ingresá tu sueldo mensual para continuar.");
                return;
              }
              setSubmitError(null);
              setStep(2);
            }}
            type="button"
          >
            Continuar
          </Button>

          {submitError ? <p className="text-sm text-[#D85A30]">{submitError}</p> : null}
        </div>
      </OnboardingStep>
    );
  }

  if (data.step === 2) {
    return (
      <OnboardingStep
        step={2}
        title="¿Cuánto gastás al mes?"
        description="Ahora cargá tus gastos base mensuales."
      >
        <div className="space-y-4">
          <Input
            label="Vivienda"
            type="number"
            min={0}
            required
            value={data.housingExpense ?? ""}
            onChange={(event) => setData((prev) => ({ ...prev, housingExpense: parseNumber(event.target.value) }))}
          />

          <Input
            label="Alimentación"
            type="number"
            min={0}
            required
            value={data.foodExpense ?? ""}
            onChange={(event) => setData((prev) => ({ ...prev, foodExpense: parseNumber(event.target.value) }))}
          />

          <Input
            label="Transporte"
            type="number"
            min={0}
            required
            value={data.transportExpense ?? ""}
            onChange={(event) => setData((prev) => ({ ...prev, transportExpense: parseNumber(event.target.value) }))}
          />

          <Input
            label="Otros gastos"
            type="number"
            min={0}
            value={data.otherExpenses ?? 0}
            onChange={(event) => setData((prev) => ({ ...prev, otherExpenses: parseNumber(event.target.value) }))}
            helperText="Opcional. Si no aplica, dejalo en 0."
          />

          <Button
            fullWidth
            onClick={() => {
              const requiredExpenses = [data.housingExpense, data.foodExpense, data.transportExpense];
              if (requiredExpenses.some((value) => typeof value !== "number" || value < 0)) {
                setSubmitError("Completá vivienda, alimentación y transporte para continuar.");
                return;
              }
              setSubmitError(null);
              setStep(3);
            }}
            type="button"
          >
            Continuar
          </Button>

          {submitError ? <p className="text-sm text-[#D85A30]">{submitError}</p> : null}
        </div>
      </OnboardingStep>
    );
  }

  if (data.step === 3) {
    return (
      <OnboardingStep step={3} title="¿Tenés deudas?" description="Podés agregarlas ahora o seguir sin deudas.">
        <div className="space-y-4">
          {(data.liabilities ?? []).map((liability, index) => (
            <div key={`liability-${index}`} className="space-y-3 rounded-lg border border-slate-200 p-3">
              <Input
                label={`Nombre de deuda ${index + 1}`}
                value={liability.name}
                onChange={(event) => updateLiability(index, { name: event.target.value })}
              />
              <Input
                label="Pago mensual"
                type="number"
                min={0}
                value={liability.monthlyPayment}
                onChange={(event) => updateLiability(index, { monthlyPayment: parseNumber(event.target.value) })}
              />
              <Input
                label="Balance total"
                type="number"
                min={0}
                value={liability.totalBalance}
                onChange={(event) => updateLiability(index, { totalBalance: parseNumber(event.target.value) })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-800" htmlFor={`liability-type-${index}`}>
                  Tipo de deuda
                </label>
                <select
                  id={`liability-type-${index}`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
                  value={liability.typeId}
                  onChange={(event) => updateLiability(index, { typeId: Number(event.target.value) })}
                >
                  {liabilityTypeOptions.map((option) => (
                    <option key={`liability-type-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" fullWidth onClick={addLiability} type="button">
              + Agregar otra deuda
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setSubmitError(null);
                setStep(4);
              }}
              type="button"
            >
              Continuar
            </Button>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setData((prev) => ({ ...prev, liabilities: [] }));
              setSubmitError(null);
              setStep(4);
            }}
            type="button"
          >
            No tengo deudas
          </Button>
        </div>
      </OnboardingStep>
    );
  }

  if (data.step === 4) {
    return (
      <OnboardingStep
        step={4}
        title="¿Tenés algo que genere dinero?"
        description="Agregá tus activos o seguí sin activos por ahora."
      >
        <div className="space-y-4">
          {(data.assets ?? []).map((asset, index) => (
            <div key={`asset-${index}`} className="space-y-3 rounded-lg border border-slate-200 p-3">
              <Input
                label={`Nombre de activo ${index + 1}`}
                value={asset.name}
                onChange={(event) => updateAsset(index, { name: event.target.value })}
              />
              <Input
                label="Ingreso mensual"
                type="number"
                min={0}
                value={asset.monthlyIncome}
                onChange={(event) => updateAsset(index, { monthlyIncome: parseNumber(event.target.value) })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-800" htmlFor={`asset-type-${index}`}>
                  Tipo de activo
                </label>
                <select
                  id={`asset-type-${index}`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
                  value={asset.typeId}
                  onChange={(event) => updateAsset(index, { typeId: Number(event.target.value) })}
                >
                  {assetTypeOptions.map((option) => (
                    <option key={`asset-type-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" fullWidth onClick={addAsset} type="button">
              + Agregar otro activo
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setSubmitError(null);
                setStep(5);
              }}
              type="button"
            >
              Continuar
            </Button>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setData((prev) => ({ ...prev, assets: [] }));
              setSubmitError(null);
              setStep(5);
            }}
            type="button"
          >
            No tengo activos aun
          </Button>
        </div>
      </OnboardingStep>
    );
  }

  return (
    <OnboardingStep step={5} title="Calculando tu índice..." description="Estamos procesando tus datos financieros.">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Cuando estés listo, enviamos todo para mostrarte tu resultado.</p>

        <Button fullWidth disabled={isSubmitting} onClick={() => void submitSnapshot()} type="button">
          {isSubmitting ? "Calculando..." : "Calcular mi índice"}
        </Button>

        {submitError ? (
          <div className="space-y-3">
            <p className="text-sm text-[#D85A30]">{submitError}</p>
            <Button fullWidth variant="secondary" onClick={() => void submitSnapshot()} type="button">
              Reintentar
            </Button>
          </div>
        ) : null}
      </div>
    </OnboardingStep>
  );
}
