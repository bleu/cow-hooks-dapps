import { useState, useEffect, useMemo } from "react";

import { MarketUtils } from "@morpho-org/blue-sdk";

export function useDynamicBorrow({
  borrowShares,
  totalBorrowAssets,
  totalBorrowShares,
  borrowRate,
  lastUpdate,
}: {
  borrowShares: bigint | undefined;
  totalBorrowAssets: bigint | undefined;
  totalBorrowShares: bigint | undefined;
  borrowRate: bigint | undefined;
  lastUpdate: bigint | undefined;
}) {
  const [borrow, setBorrow] = useState<bigint | undefined>(undefined);

  const borrowWithoutRate = useMemo(
    () =>
      borrowShares && totalBorrowAssets && totalBorrowShares
        ? MarketUtils.toBorrowAssets(borrowShares, {
            totalBorrowAssets,
            totalBorrowShares: totalBorrowShares,
          })
        : undefined,
    [borrowShares, totalBorrowAssets, totalBorrowShares]
  );

  // 3s loop update
  useEffect(() => {
    const interval = setInterval(() => {
      if (!borrowWithoutRate || !lastUpdate || !borrowRate) {
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
