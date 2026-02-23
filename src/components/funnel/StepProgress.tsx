interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onBack: () => void;
}

export function StepProgress({ currentStep, totalSteps, steps, onBack }: StepProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Workflows
        </button>
        <span className="text-border">·</span>
        <span className="text-xs text-muted-foreground">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1]}
        </span>
      </div>
      <div className="flex gap-1">
        {steps.map((step, i) => (
          <div key={step} className="flex-1 flex flex-col gap-1">
            <div className={`h-1 rounded-full transition-colors ${i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary/40" : "bg-muted"}`} />
            <span className="text-[10px] text-muted-foreground text-center">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
