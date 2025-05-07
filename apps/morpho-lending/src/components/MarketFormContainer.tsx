import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@bleu.builders/ui";
import { type MorphoMarket, Spinner, hasPosition } from "@bleu/cow-hooks-ui";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FORM_TABS, OperationType } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useDynamicBorrow } from "#/hooks/useDynamicBorrow";
import { RepayWithdrawMarketForm } from "./RepayWithdrawMarketForm";
import { SupplyBorrowMarketForm } from "./SupplyBorrowMarketForm";

interface MarketFormContainerProps {
  market: MorphoMarket;
}

export function MarketFormContainer({ market }: MarketFormContainerProps) {
  const { setValue, getValues } = useFormContext<MorphoSupplyFormData>();
  const dynamicBorrow = useDynamicBorrow({ market });
  const handleTabChange = (value: string) => {
    setValue("operationType", value as OperationType);
  };
  const userHasPosition = hasPosition(market.position);
  const currentOperationType = getValues("operationType");

  useEffect(() => {
    if (
      !userHasPosition &&
      currentOperationType === OperationType.RepayWithdraw
    ) {
      setValue("operationType", OperationType.SupplyBorrow);
    }
  }, [userHasPosition, setValue, currentOperationType]);

  if (dynamicBorrow === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
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

  if (!userHasPosition) {
    return (
      <SupplyBorrowMarketForm market={market} dynamicBorrow={dynamicBorrow} />
    );
  }

  return (
    <TabsRoot
      defaultValue={currentOperationType}
      onValueChange={handleTabChange}
    >
      <TabsList className="w-full mt-6 px-3">
        {FORM_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            className="flex-1 h-10 opacity-60 font-semibold rounded-2xl data-[state=active]:bg-color-primary data-[state=active]:text-color-paper data-[state=active]:opacity-100"
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {market && (
        <>
          <TabsContent value={OperationType.SupplyBorrow}>
            <SupplyBorrowMarketForm
              market={market}
              dynamicBorrow={dynamicBorrow}
            />
          </TabsContent>
          <TabsContent value={OperationType.RepayWithdraw}>
            <RepayWithdrawMarketForm
              market={market}
              dynamicBorrow={dynamicBorrow}
            />
          </TabsContent>
        </>
      )}
    </TabsRoot>
  );
}
