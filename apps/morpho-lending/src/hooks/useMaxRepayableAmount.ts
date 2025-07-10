import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useDynamicBorrow } from "./useDynamicBorrow";
import { useEffect, useMemo } from "react";
import { useFormatTokenAmount } from "./useFormatTokenAmount";
import { formatUnits } from "viem";

export const useMaxRepayableAmount = (borrowedBalance:bigint|undefined) => {
  const { control,setValue } = useFormContext<MorphoSupplyFormData>();
  const { isMaxRepay, market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket;
  const dynamicBorrow = useDynamicBorrow({market})

  const maxRepayableAmount = isMaxRepay ? dynamicBorrow : market.position.borrow

  const repayableLimit = useMemo(
      () =>
        maxRepayableAmount !== undefined && borrowedBalance !== undefined
          ? maxRepayableAmount < borrowedBalance
            ? maxRepayableAmount
            : borrowedBalance
          : undefined,
      [maxRepayableAmount, borrowedBalance],
    );
  
  useEffect(()=>{
    // Ensure repay amount is updated on max button
    if (isMaxRepay && repayableLimit) setValue("repayAmount",formatUnits(repayableLimit, market.loanAsset.decimals))
  },[setValue,market.loanAsset.decimals,isMaxRepay, repayableLimit])
  
  const formatted = useFormatTokenAmount({amount:repayableLimit,decimals:market.loanAsset.decimals,priceUsd:market.loanAsset.priceUsd})

  return {maxRepayable:repayableLimit,...formatted}
};
