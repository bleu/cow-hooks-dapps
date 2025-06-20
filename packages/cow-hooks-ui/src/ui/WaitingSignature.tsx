"use client";

import { Button } from "@bleu.builders/ui";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";
import type { SignatureStepsProps } from "../types";
import { SignatureSteps } from "./SignaturesSteps";
import { Spinner } from "./Spinner";
import { InfoTooltip } from "./TooltipBase";

export function WaitingSignature({
  steps,
  currentStepIndex,
}: {
  steps: SignatureStepsProps[];
  currentStepIndex: number;
}) {
  const { id, tooltipText, callback, description } = steps[currentStepIndex];

  const { error, mutate, isValidating } = useSWR([id], callback, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const { reset } = useFormContext();
  const router = useRouter();

  const isError = error && !isValidating;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-2 items-center mb-10">
        <span className="text-foreground text-lg">
          {description} {tooltipText && <InfoTooltip text={tooltipText} />}
        </span>
      </div>
      {isValidating && <Spinner />}
      {isError && (
        <div className="flex flex-col gap-2 items-center">
          <span className="font-semibold text-md text-destructive">
            {error?.message
              ?.replace(error?.code || "", "")
              ?.replace(":", "")
              ?.trim() || "An error occurred"}
          </span>
          <div className="flex gap-2">
            <Button type="button" onClick={() => mutate()}>
              Try again
            </Button>
            <Button
              type="button"
              onClick={() => {
                reset(undefined, { keepValues: true });
                router.back();
              }}
            >
              Back
            </Button>
          </div>
        </div>
      )}
      {!isError && (
        <SignatureSteps steps={steps} currentStepIndex={currentStepIndex} />
      )}
    </div>
  );
}
