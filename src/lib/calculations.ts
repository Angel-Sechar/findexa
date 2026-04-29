import type {
  Asset,
  Liability,
  SnapshotRequest,
  SnapshotResponse,
} from "@/types/finances";

export interface CalculatedFinancialMetrics extends SnapshotResponse {
  debtPayments: number;
}

const MIN_FREEDOM_INDEX = 0;
const MAX_FREEDOM_INDEX = 100;

function roundHalfUp(value: number): number {
  return Math.round(value);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function sumAssetMonthlyIncome(
  assets: Pick<Asset, "monthlyIncome">[],
): number {
  return assets.reduce((total, asset) => total + asset.monthlyIncome, 0);
}

export function sumLiabilityMonthlyPayments(
  liabilities: Pick<Liability, "monthlyPayment">[],
): number {
  return liabilities.reduce(
    (total, liability) => total + liability.monthlyPayment,
    0,
  );
}

export function calculateFreedomIndex(
  passiveIncome: number,
  totalExpenses: number,
): number {
  if (totalExpenses === 0) {
    return MAX_FREEDOM_INDEX;
  }

  const index = roundHalfUp((passiveIncome / totalExpenses) * 100);

  return clamp(index, MIN_FREEDOM_INDEX, MAX_FREEDOM_INDEX);
}

export function calculateYearsToFreedom(
  freedomIndex: number,
  totalExpenses: number,
  passiveIncome: number,
  cashFlow: number,
): number | null {
  if (freedomIndex >= MAX_FREEDOM_INDEX) {
    return 0;
  }

  if (cashFlow <= 0) {
    return null;
  }

  return Math.ceil((totalExpenses - passiveIncome) / cashFlow / 12);
}

export function calculateSnapshotMetrics(
  input: SnapshotRequest,
): CalculatedFinancialMetrics {
  const passiveIncome = sumAssetMonthlyIncome(input.assets);
  const debtPayments = sumLiabilityMonthlyPayments(input.liabilities);
  const totalIncome = input.salaryIncome + passiveIncome + input.otherIncome;
  const totalExpenses =
    input.housingExpense +
    input.foodExpense +
    input.transportExpense +
    debtPayments +
    input.otherExpenses;
  const cashFlow = totalIncome - totalExpenses;
  const freedomIndex = calculateFreedomIndex(passiveIncome, totalExpenses);
  const yearsToFreedom = calculateYearsToFreedom(
    freedomIndex,
    totalExpenses,
    passiveIncome,
    cashFlow,
  );

  return {
    freedomIndex,
    totalIncome,
    totalExpenses,
    cashFlow,
    passiveIncome,
    yearsToFreedom,
    debtPayments,
  };
}
