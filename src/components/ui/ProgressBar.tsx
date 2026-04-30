type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  label?: string;
};

export function ProgressBar({ currentStep, label, totalSteps }: ProgressBarProps) {
  const clampedStep = Math.min(Math.max(currentStep, 0), totalSteps);
  const progress = totalSteps === 0 ? 0 : Math.round((clampedStep / totalSteps) * 100);
  const stepLabel = label ?? `Paso ${clampedStep} de ${totalSteps}`;

  return (
    <div className="w-full" role="group" aria-label="Progreso de onboarding">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{stepLabel}</p>
        <p className="text-sm font-semibold text-[#0F6E56]">{progress}%</p>
      </div>

      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="h-2 w-full overflow-hidden rounded-full bg-[#E1F5EE]"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-[#1D9E75] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
