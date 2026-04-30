import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { calculateSnapshotMetrics } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/server";
import type {
  ApiErrorResponse,
  Asset,
  Constant,
  DashboardData,
  FinancialSnapshot,
  Liability,
  SnapshotRequest,
  SnapshotResponse,
} from "@/types/finances";

type AuthenticatedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

const assetInputSchema = z.object({
  name: z.string().min(1),
  monthlyIncome: z.number(),
  typeId: z.number().int(),
});

const liabilityInputSchema = z.object({
  name: z.string().min(1),
  monthlyPayment: z.number(),
  totalBalance: z.number(),
  typeId: z.number().int(),
});

const snapshotRequestSchema = z.object({
  salaryIncome: z.number(),
  otherIncome: z.number(),
  housingExpense: z.number(),
  foodExpense: z.number(),
  transportExpense: z.number(),
  otherExpenses: z.number(),
  assets: z.array(assetInputSchema),
  liabilities: z.array(liabilityInputSchema),
});

const snapshotResponseSchema = z.object({
  freedomIndex: z.number(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  cashFlow: z.number(),
  passiveIncome: z.number(),
  yearsToFreedom: z.number().nullable(),
});

const dashboardResponseSchema = z.object({
  snapshot: z.object({
    id: z.string(),
    userId: z.string(),
    monthId: z.number(),
    salaryIncome: z.number(),
    passiveIncome: z.number(),
    otherIncome: z.number(),
    housingExpense: z.number(),
    foodExpense: z.number(),
    transportExpense: z.number(),
    debtPayments: z.number(),
    otherExpenses: z.number(),
    totalIncome: z.number(),
    totalExpenses: z.number(),
    cashFlow: z.number(),
    freedomIndex: z.number(),
    createdAt: z.string(),
  }),
  assets: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      monthlyIncome: z.number(),
      typeId: z.number(),
      createdAt: z.string(),
    }),
  ),
  liabilities: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      monthlyPayment: z.number(),
      totalBalance: z.number(),
      typeId: z.number(),
      createdAt: z.string(),
    }),
  ),
  constants: z.array(
    z.object({
      id: z.number(),
      value: z.number(),
      label: z.string(),
      shortened: z.string().nullable(),
    }),
  ),
});

function toErrorResponse(error: string, message: string, status: number): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

function toSnapshotModel(record: Record<string, unknown>): FinancialSnapshot {
  return {
    id: String(record.id),
    userId: String(record.user_id),
    monthId: Number(record.month_id),
    salaryIncome: Number(record.salary_income),
    passiveIncome: Number(record.passive_income),
    otherIncome: Number(record.other_income),
    housingExpense: Number(record.housing_expense),
    foodExpense: Number(record.food_expense),
    transportExpense: Number(record.transport_expense),
    debtPayments: Number(record.debt_payments),
    otherExpenses: Number(record.other_expenses),
    totalIncome: Number(record.total_income),
    totalExpenses: Number(record.total_expenses),
    cashFlow: Number(record.cash_flow),
    freedomIndex: Number(record.freedom_index),
    createdAt: String(record.created_at),
  };
}

function toAssetModel(record: Record<string, unknown>): Asset {
  return {
    id: String(record.id),
    userId: String(record.user_id),
    name: String(record.name),
    monthlyIncome: Number(record.monthly_income),
    typeId: Number(record.type_id),
    createdAt: String(record.created_at),
  };
}

function toLiabilityModel(record: Record<string, unknown>): Liability {
  return {
    id: String(record.id),
    userId: String(record.user_id),
    name: String(record.name),
    monthlyPayment: Number(record.monthly_payment),
    totalBalance: Number(record.total_balance),
    typeId: Number(record.type_id),
    createdAt: String(record.created_at),
  };
}

function toConstantModel(record: Record<string, unknown>): Constant {
  return {
    id: Number(record.id),
    value: Number(record.value),
    label: String(record.label),
    shortened: record.shortened ? String(record.shortened) : null,
  };
}

async function getAuthenticatedContext(): Promise<AuthenticatedContext | NextResponse<ApiErrorResponse>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return toErrorResponse("unauthorized", "Debes iniciar sesion para continuar.", 401);
  }

  return { supabase, userId: user.id };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await getAuthenticatedContext();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json().catch(() => null);
  const parseResult = snapshotRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return toErrorResponse("validation_error", "Los datos del snapshot no son validos.", 400);
  }

  const payload: SnapshotRequest = parseResult.data;
  const metrics = calculateSnapshotMetrics(payload);
  const monthId = new Date().getMonth() + 1;

  const { data: existingSnapshot, error: existingSnapshotError } = await auth.supabase
    .from("financial_snapshots")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("month_id", monthId)
    .maybeSingle<{ id: string }>();

  if (existingSnapshotError) {
    return toErrorResponse("snapshot_query_failed", "No pudimos validar tu snapshot actual.", 500);
  }

  const snapshotValues = {
    user_id: auth.userId,
    month_id: monthId,
    salary_income: payload.salaryIncome,
    passive_income: metrics.passiveIncome,
    other_income: payload.otherIncome,
    housing_expense: payload.housingExpense,
    food_expense: payload.foodExpense,
    transport_expense: payload.transportExpense,
    debt_payments: metrics.debtPayments,
    other_expenses: payload.otherExpenses,
    total_income: metrics.totalIncome,
    total_expenses: metrics.totalExpenses,
    cash_flow: metrics.cashFlow,
    freedom_index: metrics.freedomIndex,
  };

  if (existingSnapshot?.id) {
    const { error: updateSnapshotError } = await auth.supabase
      .from("financial_snapshots")
      .update(snapshotValues)
      .eq("id", existingSnapshot.id)
      .eq("user_id", auth.userId);

    if (updateSnapshotError) {
      return toErrorResponse("snapshot_update_failed", "No pudimos actualizar tu snapshot.", 500);
    }
  } else {
    const { error: insertSnapshotError } = await auth.supabase
      .from("financial_snapshots")
      .insert(snapshotValues);

    if (insertSnapshotError) {
      return toErrorResponse("snapshot_create_failed", "No pudimos guardar tu snapshot.", 500);
    }
  }

  const { error: deleteAssetsError } = await auth.supabase.from("assets").delete().eq("user_id", auth.userId);

  if (deleteAssetsError) {
    return toErrorResponse("assets_replace_failed", "No pudimos actualizar tus activos.", 500);
  }

  if (payload.assets.length > 0) {
    const assetsValues = payload.assets.map((asset) => ({
      user_id: auth.userId,
      name: asset.name,
      monthly_income: asset.monthlyIncome,
      type_id: asset.typeId,
    }));

    const { error: insertAssetsError } = await auth.supabase.from("assets").insert(assetsValues);

    if (insertAssetsError) {
      return toErrorResponse("assets_replace_failed", "No pudimos actualizar tus activos.", 500);
    }
  }

  const { error: deleteLiabilitiesError } = await auth.supabase
    .from("liabilities")
    .delete()
    .eq("user_id", auth.userId);

  if (deleteLiabilitiesError) {
    return toErrorResponse("liabilities_replace_failed", "No pudimos actualizar tus deudas.", 500);
  }

  if (payload.liabilities.length > 0) {
    const liabilitiesValues = payload.liabilities.map((liability) => ({
      user_id: auth.userId,
      name: liability.name,
      monthly_payment: liability.monthlyPayment,
      total_balance: liability.totalBalance,
      type_id: liability.typeId,
    }));

    const { error: insertLiabilitiesError } = await auth.supabase.from("liabilities").insert(liabilitiesValues);

    if (insertLiabilitiesError) {
      return toErrorResponse("liabilities_replace_failed", "No pudimos actualizar tus deudas.", 500);
    }
  }

  const responsePayload: SnapshotResponse = {
    freedomIndex: metrics.freedomIndex,
    totalIncome: metrics.totalIncome,
    totalExpenses: metrics.totalExpenses,
    cashFlow: metrics.cashFlow,
    passiveIncome: metrics.passiveIncome,
    yearsToFreedom: metrics.yearsToFreedom,
  };

  const validation = snapshotResponseSchema.safeParse(responsePayload);

  if (!validation.success) {
    return toErrorResponse("snapshot_shape_invalid", "La respuesta del snapshot no es valida.", 500);
  }

  return NextResponse.json(validation.data, { status: 200 });
}

export async function GET(): Promise<NextResponse> {
  const auth = await getAuthenticatedContext();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const { data: snapshotData, error: snapshotError } = await auth.supabase
    .from("financial_snapshots")
    .select(
      "id, user_id, month_id, salary_income, passive_income, other_income, housing_expense, food_expense, transport_expense, debt_payments, other_expenses, total_income, total_expenses, cash_flow, freedom_index, created_at",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Record<string, unknown>>();

  if (snapshotError) {
    return toErrorResponse("snapshot_fetch_failed", "No pudimos cargar tu snapshot.", 500);
  }

  if (!snapshotData) {
    return toErrorResponse("snapshot_not_found", "No encontramos un snapshot para tu cuenta.", 404);
  }

  const { data: assetsData, error: assetsError } = await auth.supabase
    .from("assets")
    .select("id, user_id, name, monthly_income, type_id, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: true });

  if (assetsError) {
    return toErrorResponse("assets_fetch_failed", "No pudimos cargar tus activos.", 500);
  }

  const { data: liabilitiesData, error: liabilitiesError } = await auth.supabase
    .from("liabilities")
    .select("id, user_id, name, monthly_payment, total_balance, type_id, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: true });

  if (liabilitiesError) {
    return toErrorResponse("liabilities_fetch_failed", "No pudimos cargar tus deudas.", 500);
  }

  const { data: constantsData, error: constantsError } = await auth.supabase
    .from("constant")
    .select("id, value, label, shortened")
    .in("id", [103, 104])
    .order("id", { ascending: true })
    .order("value", { ascending: true });

  if (constantsError) {
    return toErrorResponse("constants_fetch_failed", "No pudimos cargar las constantes.", 500);
  }

  const responsePayload: DashboardData = {
    snapshot: toSnapshotModel(snapshotData),
    assets: (assetsData ?? []).map((asset) => toAssetModel(asset as Record<string, unknown>)),
    liabilities: (liabilitiesData ?? []).map((liability) => toLiabilityModel(liability as Record<string, unknown>)),
    constants: (constantsData ?? []).map((constant) => toConstantModel(constant as Record<string, unknown>)),
  };

  const validation = dashboardResponseSchema.safeParse(responsePayload);

  if (!validation.success) {
    return toErrorResponse("dashboard_shape_invalid", "La respuesta del dashboard no es valida.", 500);
  }

  return NextResponse.json(validation.data, { status: 200 });
}
