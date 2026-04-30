import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { FinancialSnapshot } from "@/types/finances";

type BalanceSheetProps = {
  snapshot: FinancialSnapshot;
};

type BalanceRow = {
  label: string;
  value: number;
  highlight?: "positive" | "negative";
};

function Row({ label, value, highlight }: BalanceRow) {
  const valueColor =
    highlight === "positive"
      ? "text-[#0F6E56]"
      : highlight === "negative"
        ? "text-[#D85A30]"
        : "text-slate-800";

  return (
    <li className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={`font-medium ${valueColor}`}>{formatCurrency(value)}</span>
    </li>
  );
}

export function BalanceSheet({ snapshot }: BalanceSheetProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Ingresos</h2>
        <ul className="mt-2 divide-y divide-slate-100">
          <Row label="Sueldo" value={snapshot.salaryIncome} />
          <Row label="Ingresos pasivos" value={snapshot.passiveIncome} highlight="positive" />
          <Row label="Otros ingresos" value={snapshot.otherIncome} />
        </ul>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900">Gastos</h2>
        <ul className="mt-2 divide-y divide-slate-100">
          <Row label="Vivienda" value={snapshot.housingExpense} />
          <Row label="Alimentacion" value={snapshot.foodExpense} />
          <Row label="Transporte" value={snapshot.transportExpense} />
          <Row
            label="Deudas"
            value={snapshot.debtPayments}
            highlight={snapshot.debtPayments > 0 ? "negative" : undefined}
          />
          <Row label="Otros gastos" value={snapshot.otherExpenses} />
        </ul>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-900">Flujo de caja</span>
          <span className={`text-sm font-semibold ${snapshot.cashFlow >= 0 ? "text-[#0F6E56]" : "text-[#D85A30]"}`}>
            {formatCurrency(snapshot.cashFlow)}
          </span>
        </div>
      </div>
    </Card>
  );
}
