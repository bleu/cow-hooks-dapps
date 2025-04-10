import type { MorphoSupplyFormData } from "#/contexts/form";
import { type MorphoMarket, useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoOracleAbi } from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useSWR from "swr";

export const useReadPrice = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();
  const { market } = useWatch({ control });

  const { publicClient } = useIFrameContext();

  const fetcher = useCallback(async () => {
    if (!publicClient || !market) throw new Error("missing publicClient");
    return await publicClient.readContract({
      address: (market as MorphoMarket).oracle.address,
      abi: morphoOracleAbi,
      functionName: "price",
    });
  }, [publicClient, market]);

  return useSWR([market], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  }).data;
};
