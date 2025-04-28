"use client";

import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@bleu.builders/ui";
import type { HookDappContextAdjusted, MorphoMarket } from "@bleu/cow-hooks-ui";
import {
  MarketsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useCallback, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import WalletIcon from "#/assets/wallet.svg";
import { MarketForm } from "#/components/MarketForm";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { decodeFormData } from "#/utils/hookEncoding";

enum FormTabs {
  AddBorrow = "add-borrow",
  RepayWithdraw = "repay-withdraw",
}

const FORM_TABS = [
  {
    value: FormTabs.AddBorrow,
    label: "Add/Borrow",
  },
  {
    value: FormTabs.RepayWithdraw,
    label: "Repay/Withdraw",
  },
];

export default function Page() {
  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket | undefined;
  const { markets } = useMorphoContext();

  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { context: iFrameContext } = useIFrameContext();
  const [context, setContext] = useState<HookDappContextAdjusted | undefined>();

  // Avoid reloading the page when orderParams becomes null (waiting for new quote)
  useEffect(() => {
    const newContext = iFrameContext?.orderParams
      ? iFrameContext
      : {
          ...(iFrameContext as HookDappContextAdjusted),
          orderParams: context?.orderParams ?? null,
        };
    if (JSON.stringify(newContext) !== JSON.stringify(context))
      setContext(newContext);
  }, [iFrameContext, context]);

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
        <WalletIcon className="text-color-primary w-[45px] h-[43px]" />
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

  return (
    <div className="w-full flex flex-col py-1">
      <MarketsDropdownMenu
        onSelect={(market: MorphoMarket) => setValue("market", market)}
        markets={markets}
        market={market}
      />
      <TabsRoot defaultValue={FormTabs.AddBorrow}>
        <TabsList className="w-full mt-6 px-3">
          {FORM_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              className="flex-1 data-[state=active]:bg-color-primary data-[state=active]:text-color-paper data-[state=active]:opacity-100 opacity-60 font-semibold rounded-2xl h-10"
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {market && (
          <>
            <TabsContent value={FormTabs.AddBorrow}>
              <MarketForm market={market} />
            </TabsContent>
            <TabsContent value={FormTabs.RepayWithdraw}>
              <MarketForm market={market} />
            </TabsContent>
          </>
        )}
      </TabsRoot>
    </div>
  );
}
