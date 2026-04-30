import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorResponse, Liability } from "@/types/finances";

const liabilityRequestSchema = z.object({
  name: z.string().min(1),
  monthlyPayment: z.number(),
  totalBalance: z.number(),
  typeId: z.number().int(),
});

const liabilityResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  monthlyPayment: z.number(),
  totalBalance: z.number(),
  typeId: z.number(),
  createdAt: z.string(),
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return toErrorResponse("unauthorized", "Debes iniciar sesion para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parseResult = liabilityRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return toErrorResponse("validation_error", "Los datos del pasivo no son validos.", 400);
  }

  const { data, error } = await supabase
    .from("liabilities")
    .insert({
      user_id: user.id,
      name: parseResult.data.name,
      monthly_payment: parseResult.data.monthlyPayment,
      total_balance: parseResult.data.totalBalance,
      type_id: parseResult.data.typeId,
    })
    .select("id, user_id, name, monthly_payment, total_balance, type_id, created_at")
    .single<Record<string, unknown>>();

  if (error || !data) {
    return toErrorResponse("liability_create_failed", "No pudimos crear el pasivo.", 500);
  }

  const payload = toLiabilityModel(data);
  const validation = liabilityResponseSchema.safeParse(payload);

  if (!validation.success) {
    return toErrorResponse("liability_shape_invalid", "La respuesta del pasivo no es valida.", 500);
  }

  return NextResponse.json(validation.data, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return toErrorResponse("unauthorized", "Debes iniciar sesion para continuar.", 401);
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return toErrorResponse("validation_error", "Debes enviar el id del pasivo.", 400);
  }

  const { data: existingLiability, error: existingLiabilityError } = await supabase
    .from("liabilities")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existingLiabilityError) {
    return toErrorResponse("liability_query_failed", "No pudimos validar el pasivo solicitado.", 500);
  }

  if (!existingLiability) {
    return toErrorResponse("liability_not_found", "No encontramos el pasivo solicitado.", 404);
  }

  const { error } = await supabase.from("liabilities").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return toErrorResponse("liability_delete_failed", "No pudimos eliminar el pasivo.", 500);
  }

  return new NextResponse(null, { status: 204 });
}
