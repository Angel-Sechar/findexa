import { Card } from "@/components/ui/Card";

type FreedomIndexProps = {
  index: number;
  yearsToFreedom: number | null;
};

export function FreedomIndex({ index, yearsToFreedom }: FreedomIndexProps) {
  const progress = Math.min(100, Math.max(0, index));

  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-[#0F6E56]">Indice de libertad financiera</p>

      <div>
        <p className="text-3xl font-bold text-slate-900">Hoy eres {index}% libre.</p>
        {index < 100 && yearsToFreedom !== null ? (
          <p className="mt-1 text-sm text-slate-600">Libre en {yearsToFreedom} anios</p>
        ) : null}
      </div>

      <div className="h-3 w-full rounded-full bg-[#E1F5EE]">
        <div
          aria-label="Progreso de libertad financiera"
          className="h-3 rounded-full bg-[#1D9E75] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}
