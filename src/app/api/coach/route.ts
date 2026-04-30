import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorResponse, CoachResponse } from "@/types/finances";

const coachRequestSchema = z.object({
  snapshotId: z.string().uuid(),
});

const coachResponseSchema = z.object({
  message: z.string(),
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return toErrorResponse("unauthorized", "Debes iniciar sesion para continuar.", 401);
  }

  const body = await request.json().catch(() => null);
  const parseResult = coachRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return toErrorResponse("validation_error", "El snapshot enviado no es valido.", 400);
  }

  const { data: snapshot, error: snapshotError } = await supabase
    .from("financial_snapshots")
    .select("id")
    .eq("id", parseResult.data.snapshotId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (snapshotError) {
    return toErrorResponse("snapshot_query_failed", "No pudimos validar el snapshot enviado.", 500);
  }

  if (!snapshot) {
    return toErrorResponse("snapshot_not_found", "No encontramos el snapshot solicitado.", 404);
  }

  const payload: CoachResponse = {
    message: "Tu coach financiero estara disponible pronto. Segui registrando tus datos para recibir mejores recomendaciones.",
  };

  const validation = coachResponseSchema.safeParse(payload);

  if (!validation.success) {
    return toErrorResponse("coach_shape_invalid", "La respuesta del coach no es valida.", 500);
  }

  return NextResponse.json(validation.data, { status: 200 });
}
