"use client";

import { useState } from "react";
import { AssetsList } from "@/components/AssetsList";
import { BalanceSheet } from "@/components/BalanceSheet";
import { LiabilitiesList } from "@/components/LiabilitiesList";
import type { Asset, Constant, FinancialSnapshot, Liability } from "@/types/finances";

type DashboardTab = "balance" | "assets" | "liabilities";

type DashboardTabsProps = {
  snapshot: FinancialSnapshot;
  assets: Asset[];
  liabilities: Liability[];
  constants: Constant[];
};

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "balance", label: "Balance" },
  { id: "assets", label: "Activos" },
  { id: "liabilities", label: "Pasivos" },
];

export function DashboardTabs({ snapshot, assets, liabilities, constants }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("balance");

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              className={`min-h-10 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive ? "bg-white text-[#0F6E56] shadow-sm" : "text-slate-600"
              }`}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "balance" ? <BalanceSheet snapshot={snapshot} /> : null}
      {activeTab === "assets" ? <AssetsList assets={assets} constants={constants} /> : null}
      {activeTab === "liabilities" ? <LiabilitiesList constants={constants} liabilities={liabilities} /> : null}
    </section>
  );
}
