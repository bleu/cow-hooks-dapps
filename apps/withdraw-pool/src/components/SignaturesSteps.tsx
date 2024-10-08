import { CheckIcon } from "@radix-ui/react-icons";

export function SignatureSteps({
  steps,
  currentStepIndex,
}: {
  steps: { id: string; label: string }[];
  currentStepIndex: number;
}) {
  return (
    <div className="flex flex-col gap-2 items-center w-full h-1/2">
      <span className="text-center text-lg font-semibold">Signature Steps</span>
      <div className="flex flex-col justify-between w-fit px-10 bg-muted rounded-md">
        {steps.map((step, index) => (
          <SignatureStep
            key={step.id}
            step={step}
            currentStepIndex={currentStepIndex}
            stepIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

function SignatureStep({
  step,
  currentStepIndex,
  stepIndex,
}: {
  step: { id: string; label: string };
  currentStepIndex: number;
  stepIndex: number;
}) {
  return (
    <div key={step.id} className="flex flex-row items-center gap-2 py-2">
      <div className="inline-flex items-center justify-center w-6 h-6 border-2 border-primary rounded-full">
        <span className="text-xs w-full text-center">{stepIndex + 1}</span>
      </div>
      <span className="text-sm">{step.label}</span>
      {stepIndex < currentStepIndex && (
        <CheckIcon className="size-5 text-primary-foreground bg-primary rounded-full" />
      )}
    </div>
  );
}
