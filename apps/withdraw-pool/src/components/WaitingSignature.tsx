"use client";

import { SignatureStepsProps } from "#/types";
import { Button } from "@bleu/ui";
import useSWR from "swr";
import { Spinner } from "./Spinner";
import { useEffect } from "react";

export function WaitingSignature({
  callback,
  description,
  id,
}: SignatureStepsProps) {
  const { error, mutate, isValidating } = useSWR([id], callback, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    mutate();
  }, [callback, id]);

  return (
    <div className="flex flex-col justify-center items-center">
      <span className="text-foreground text-lg mb-10">{description}</span>
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
