"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { CoachResponse } from "@/types/finances";

type CoachInsightProps = {
  snapshotId: string;
};

const fallbackMessage =
  "Tu coach financiero estara disponible pronto. Segui registrando tus datos para recibir mejores recomendaciones.";

export function CoachInsight({ snapshotId }: CoachInsightProps) {
  const [message, setMessage] = useState(fallbackMessage);

  useEffect(() => {
    let cancelled = false;

    const loadCoachMessage = async () => {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      }).catch(() => null);

      if (!response || !response.ok) {
        return;
      }

      const payload = (await response.json()) as Partial<CoachResponse>;

      if (!cancelled && payload.message) {
        setMessage(payload.message);
      }
    };

    void loadCoachMessage();

    return () => {
      cancelled = true;
    };
  }, [snapshotId]);

  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-slate-900">Tu coach financiero</p>
      <p className="text-sm text-slate-600">{message}</p>
    </Card>
  );
}
