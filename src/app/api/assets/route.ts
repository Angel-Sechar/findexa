import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorResponse, Asset } from "@/types/finances";

const assetRequestSchema = z.object({
  name: z.string().min(1),
  monthlyIncome: z.number(),
  typeId: z.number().int(),
});

const assetResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  monthlyIncome: z.number(),
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return toErrorResponse("unauthorized", "Debes iniciar sesion para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parseResult = assetRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return toErrorResponse("validation_error", "Los datos del activo no son validos.", 400);
  }

  const { data, error } = await supabase
    .from("assets")
    .insert({
      user_id: user.id,
      name: parseResult.data.name,
      monthly_income: parseResult.data.monthlyIncome,
      type_id: parseResult.data.typeId,
    })
    .select("id, user_id, name, monthly_income, type_id, created_at")
    .single<Record<string, unknown>>();

  if (error || !data) {
    return toErrorResponse("asset_create_failed", "No pudimos crear el activo.", 500);
  }

  const payload = toAssetModel(data);
  const validation = assetResponseSchema.safeParse(payload);

  if (!validation.success) {
    return toErrorResponse("asset_shape_invalid", "La respuesta del activo no es valida.", 500);
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
    return toErrorResponse("validation_error", "Debes enviar el id del activo.", 400);
  }

  const { data: existingAsset, error: existingAssetError } = await supabase
    .from("assets")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existingAssetError) {
    return toErrorResponse("asset_query_failed", "No pudimos validar el activo solicitado.", 500);
  }

  if (!existingAsset) {
    return toErrorResponse("asset_not_found", "No encontramos el activo solicitado.", 404);
  }

  const { error } = await supabase.from("assets").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return toErrorResponse("asset_delete_failed", "No pudimos eliminar el activo.", 500);
  }

  return new NextResponse(null, { status: 204 });
}
