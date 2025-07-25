"use client";

import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import {
  MarketsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useCallback, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import WalletIcon from "#/assets/wallet.svg";
import { MarketFormContainer } from "#/components/MarketFormContainer";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { decodeFormData } from "#/utils/hookEncoding";

export default function Page() {
  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket | undefined;
  const {
    markets,
    isLoadingMarkets,
    isLoadingIsCowShedAuthorizedOnMorpho,
    errorMarkets,
  } = useMorphoContext();

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
        setValue("repayAmount", data.repayAmount);
        setValue("withdrawAmount", data.withdrawAmount);
        setValue("isMaxRepay", data.isMaxRepay);
        setValue("operationType", data.operationType);
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
        <WalletIcon className="text-color-primary w-[45px] h-[43px]" />
        <p className="font-medium text-center">
          Please connect your wallet to start using Morpho Supply.
        </p>
      </div>
    );

  if (isLoadingMarkets || isLoadingIsCowShedAuthorizedOnMorpho)
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

  if (
    !context?.orderParams?.buyTokenAddress ||
    !context?.orderParams?.sellTokenAddress ||
    !context?.orderParams?.sellAmount ||
    !context?.orderParams?.buyAmount
  ) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Please specify your swap order first</span>
      </div>
    );
  }

  if (errorMarkets?.message.includes("403")) {
    return <span className="mt-10 text-center">Forbidden access</span>;
  }

  if (!markets || markets.length === 0) {
    return <span className="mt-10 text-center">No markets found</span>;
  }

  return (
    <div className="w-full flex flex-col py-1">
      <MarketsDropdownMenu
        onSelect={(market: MorphoMarket) => setValue("market", market)}
        markets={markets}
        market={market}
      />
      {market && <MarketFormContainer market={market} />}
    </div>
  );
}
