"use client";

import { SignatureSteps } from "#/components/SignaturesSteps";
import { WaitingSignature } from "#/components/WaitingSignature";
import { useIFrameContext } from "#/context/iframe";
import { useCowShedSignature } from "#/hooks/useCowShedSignature";
import { SignatureStepsProps } from "#/types";
import { CheckIcon } from "@radix-ui/react-icons";
import { useCallback, useMemo, useState } from "react";

export default function Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const { cowShedTransactions } = useIFrameContext();
  const cowShedSignature = useCowShedSignature(cowShedTransactions);

  const cowShedCallback = useCallback(async () => {
    if (!cowShedSignature) return;
    await cowShedSignature();
  }, [cowShedSignature]);

  const steps: SignatureStepsProps[] = useMemo(() => {
    return [
      // Add permits to the cowshed
      {
        callback: cowShedCallback,
        onSuccess: () => {
          setCurrentStep(1);
        },
        label: "Approve hooks",
        description: "Approve proxy to execute the hooks in behalf of you",
        id: "approve-hooks",
      },
      {
        callback: cowShedCallback,
        onSuccess: () => {
          setCurrentStep(2);
        },
        label: "Approve Pool Token",
        description: "Approve proxy to manage your pool tokens",
        id: "approve-hooks2",
      },
    ];
  }, [cowShedCallback]);

  return (
    <div className="flex flex-col gap-2 p-2 text-center h-full justify-between items-center">
      <WaitingSignature {...steps[currentStep]} />
      <SignatureSteps steps={steps} currentIndex={currentStep} />
    </div>
  );
}
