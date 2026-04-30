import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Constant } from "@/types/finances";

const constantSchema = z.object({
  id: z.number(),
  value: z.number(),
  label: z.string(),
  shortened: z.string().nullable(),
});

const constantsResponseSchema = z.object({
  constants: z.array(constantSchema),
});

function toErrorResponse(error: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    {
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("constant")
    .select("id, value, label, shortened")
    .order("id", { ascending: true })
    .order("value", { ascending: true });

  if (error) {
    return toErrorResponse("constants_fetch_failed", "No pudimos cargar las constantes.", 500);
  }

  const constants = (data ?? []) as Constant[];
  const payload = { constants };
  const validation = constantsResponseSchema.safeParse(payload);

  if (!validation.success) {
    return toErrorResponse("constants_shape_invalid", "La respuesta de constantes no es valida.", 500);
  }

  return NextResponse.json(validation.data, { status: 200 });
}
