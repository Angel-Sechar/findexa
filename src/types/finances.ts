export type ConstantCategoryId = 100 | 101 | 102 | 103 | 104;

export interface Constant {
  id: ConstantCategoryId;
  value: number;
  label: string;
  shortened: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  countryId: number;
  currencyId: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface FinancialSnapshot {
  id: string;
  userId: string;
  monthId: number;
  salaryIncome: number;
  passiveIncome: number;
  otherIncome: number;
  housingExpense: number;
  foodExpense: number;
  transportExpense: number;
  debtPayments: number;
  otherExpenses: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  freedomIndex: number;
  createdAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  monthlyIncome: number;
  typeId: number;
  createdAt: string;
}

export interface Liability {
  id: string;
  userId: string;
  name: string;
  monthlyPayment: number;
  totalBalance: number;
  typeId: number;
  createdAt: string;
}

export interface OnboardingAssetInput {
  name: string;
  monthlyIncome: number;
  typeId: number;
}

export interface OnboardingLiabilityInput {
  name: string;
  monthlyPayment: number;
  totalBalance: number;
  typeId: number;
}

export interface OnboardingData {
  step: 1 | 2 | 3 | 4 | 5;
  salaryIncome?: number;
  otherIncome?: number;
  housingExpense?: number;
  foodExpense?: number;
  transportExpense?: number;
  otherExpenses?: number;
  assets?: OnboardingAssetInput[];
  liabilities?: OnboardingLiabilityInput[];
}

export interface SnapshotRequest {
  salaryIncome: number;
  otherIncome: number;
  housingExpense: number;
  foodExpense: number;
  transportExpense: number;
  otherExpenses: number;
  assets: OnboardingAssetInput[];
  liabilities: OnboardingLiabilityInput[];
}

export interface SnapshotResponse {
  freedomIndex: number;
  totalIncome: number;
  totalExpenses: number;
  cashFlow: number;
  passiveIncome: number;
  yearsToFreedom: number | null;
}

export interface DashboardData {
  snapshot: FinancialSnapshot;
  assets: Asset[];
  liabilities: Liability[];
  constants: Constant[];
}

export interface CoachResponse {
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
