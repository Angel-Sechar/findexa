import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { Asset, Constant } from "@/types/finances";

type AssetsListProps = {
  assets: Asset[];
  constants: Constant[];
};

function getTypeLabel(constants: Constant[], typeId: number): string {
  return constants.find((constant) => constant.id === 103 && constant.value === typeId)?.label ?? "Sin tipo";
}

export function AssetsList({ assets, constants }: AssetsListProps) {
  if (assets.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Aun no tienes activos registrados.</p>
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-slate-100">
        {assets.map((asset) => (
          <li className="flex items-start justify-between gap-3 py-3" key={asset.id}>
            <div>
              <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
              <p className="text-xs text-slate-500">{getTypeLabel(constants, asset.typeId)}</p>
            </div>

            <p className="text-sm font-medium text-[#0F6E56]">{formatCurrency(asset.monthlyIncome)}/mes</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
