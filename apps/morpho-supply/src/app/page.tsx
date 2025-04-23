"use client";

import {
  MarketsDropdownMenu,
  type MorphoMarket,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MarketForm } from "#/components/MarketForm";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { decodeFormData } from "#/utils/hookEncoding";

export default function Page() {
  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket | undefined;
  const { markets } = useMorphoContext();

  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { context } = useIFrameContext();

  const loadHookInfo = useCallback(async () => {
    if (
      !context?.hookToEdit ||
      !context.account ||
      !markets ||
      !isEditHookLoading
    )
      return;
    try {
      const data = decodeFormData(
        context?.hookToEdit?.hook.callData as `0x${string}`,
        markets,
      );
      if (data) {
        setValue("market", data.market);
        setValue("supplyAmount", data.supplyAmount);
        setValue("borrowAmount", data.borrowAmount);
        setValue("isMaxSupply", data.isMaxSupply);
        setValue("isMaxBorrow", data.isMaxBorrow);
        setIsEditHookLoading(false);
      }
    } catch {}
  }, [
    context?.hookToEdit,
    context?.account,
    markets,
    setValue,
    isEditHookLoading,
  ]);

  if (!context || (context?.hookToEdit && isEditHookLoading)) {
    if (context?.hookToEdit && isEditHookLoading) loadHookInfo();
    return (
      <div className="flex items-center justify-center w-full h-full bg-transparent text-color-text-paper">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!context?.account)
    return (
      <div className="flex flex-col items-center justify-center gap-4 max-w-72">
        <Image
          src="/assets/wallet.svg"
          alt="Wallet icon"
          width={45}
          height={43}
        />
        <p className="font-medium text-center">
          Please connect your wallet to start using Morpho Supply.
        </p>
      </div>
    );

  if (!markets)
    return (
      <div className="text-center mt-10 p-2">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div className="w-full flex flex-col py-1 px-4">
      <MarketsDropdownMenu
        onSelect={(market: MorphoMarket) => setValue("market", market)}
        markets={markets}
      />
      {market && <MarketForm market={market} />}
    </div>
  );
}
