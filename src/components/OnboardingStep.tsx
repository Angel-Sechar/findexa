import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

type OnboardingStepProps = {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  description?: string;
  children: ReactNode;
};

export function OnboardingStep({ children, description, step, title }: OnboardingStepProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full space-y-4">
        <ProgressBar currentStep={step} totalSteps={5} />

        <Card className="space-y-5 p-5 sm:p-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {description ? <p className="text-sm text-slate-600">{description}</p> : null}
          </header>

          {children}
        </Card>
      </div>
    </main>
  );
}
