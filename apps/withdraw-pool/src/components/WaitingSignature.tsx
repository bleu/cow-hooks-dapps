"use client";

import { SignatureStepsProps } from "#/types";
import { Button } from "@bleu/ui";
import useSWR from "swr";
import { InfoTooltip, Spinner } from "@bleu/cow-hooks-ui";

export function WaitingSignature({
  callback,
  description,
  tooltipText,
  id,
}: SignatureStepsProps) {
  const { error, mutate, isValidating } = useSWR([id], callback, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-2 items-center mb-10">
        <span className="text-foreground text-lg">
          {description} {tooltipText && <InfoTooltip text={tooltipText} />}
        </span>
      </div>
      {isValidating && <Spinner />}
      {error && !isValidating && (
        <Button
          type="button"
          variant="destructive"
          className="bg-destructive/15 hover:bg-destructive/50"
          onClick={() => mutate()}
        >
          Error on signature, try again
        </Button>
      )}
    </div>
  );
}
