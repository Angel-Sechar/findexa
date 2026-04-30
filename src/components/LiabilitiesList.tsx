import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { Constant, Liability } from "@/types/finances";

type LiabilitiesListProps = {
  liabilities: Liability[];
  constants: Constant[];
};

function getTypeLabel(constants: Constant[], typeId: number): string {
  return constants.find((constant) => constant.id === 104 && constant.value === typeId)?.label ?? "Sin tipo";
}

export function LiabilitiesList({ liabilities, constants }: LiabilitiesListProps) {
  if (liabilities.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-600">No tienes pasivos. Excelente!</p>
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-slate-100">
        {liabilities.map((liability) => (
          <li className="space-y-1 py-3" key={liability.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{liability.name}</p>
                <p className="text-xs text-slate-500">{getTypeLabel(constants, liability.typeId)}</p>
              </div>

              <p className="text-sm font-medium text-[#D85A30]">{formatCurrency(liability.monthlyPayment)}/mes</p>
            </div>

            <p className="text-xs text-slate-600">Saldo total: {formatCurrency(liability.totalBalance)}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
