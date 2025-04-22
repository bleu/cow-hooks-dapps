import { useEffect, useState } from "react";

import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { useMarketBorrowRate } from "./useMarketBorrowRate";

export function useDynamicBorrow({ market }: { market: MorphoMarket }) {
  const [borrow, setBorrow] = useState<bigint | undefined>(undefined);

  const borrowRate = useMarketBorrowRate({ market });

  const borrowWithoutRate = market.position.borrow;
  const lastUpdate = market.onchainState.lastUpdate;

  // 3s loop update
  useEffect(() => {
    const interval = setInterval(() => {
      if (!borrowRate) {
        setBorrow(undefined);
        return;
      }

      const period = BigInt(Math.floor(Date.now() / 1000)) - lastUpdate;

      const compoundRate = MarketUtils.compoundRate(borrowRate, period);

      const newBorrow =
        borrowWithoutRate +
        (borrowWithoutRate * compoundRate) / BigInt("1000000000000000000");

      setBorrow(newBorrow);
    }, 3000);
    return () => clearInterval(interval);
  }, [borrowWithoutRate, borrowRate, lastUpdate]);

  return borrow;
}
