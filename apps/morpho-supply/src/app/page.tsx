"use client";

import {
  MarketsDropdownMenu,
  type MorphoMarket,
  Spinner,
  useIFrameContext,
  useMorphoMarkets,
} from "@bleu/cow-hooks-ui";
import { useFormContext, useWatch } from "react-hook-form";
import { MarketForm } from "#/components/MarketForm";
import type { MorphoSupplyFormData } from "#/contexts/form";

export default function Page() {
  const { setValue, control } = useFormContext<MorphoSupplyFormData>();
  const { market: selectedMarket } = useWatch({ control });

  const { context } = useIFrameContext();

  const { data: markets } = useMorphoMarkets(
    {},
    context?.chainId,
    context?.account,
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
        selectedMarket={selectedMarket as MorphoMarket | undefined}
      />
      {selectedMarket && <MarketForm market={selectedMarket as MorphoMarket} />}
    </div>
  );
}
