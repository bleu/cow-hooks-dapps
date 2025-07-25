import { useEffect, useState } from "react";

import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { useMarketBorrowRate } from "./useMarketBorrowRate";

export function useDynamicBorrow({ market }: { market: MorphoMarket }) {
  const [borrow, setBorrow] = useState<bigint | undefined>(undefined);

  const borrowRate = useMarketBorrowRate({ market });

  const borrowWithoutRate = market.position.borrow;
  const lastUpdate = market.onchainState.lastUpdate;

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset borrow state when market changes
  useEffect(() => {
    setBorrow(undefined);
  }, [market.uniqueKey]);

  useEffect(() => {
    if (!borrowRate) {
      setBorrow(undefined);
      return;
    }
    // 3s loop update
    const interval = setInterval(() => {
      const RATE_PRECISION = BigInt("1000000000000000000");
      // 1 hour buffer for hook execution, dust will be sent back to user
      const TIME_BUFFER = 3600;
      const period =
        BigInt(Math.floor(Date.now() / 1000 + TIME_BUFFER)) - lastUpdate;

      const compoundRate = MarketUtils.compoundRate(borrowRate, period);

      const newBorrow =
        borrowWithoutRate + (borrowWithoutRate * compoundRate) / RATE_PRECISION;

      setBorrow(newBorrow);
    }, 3000);
    return () => clearInterval(interval);
  }, [borrowWithoutRate, borrowRate, lastUpdate]);

  return borrow;
}
