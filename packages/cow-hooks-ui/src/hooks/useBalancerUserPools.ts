import { BigNumber } from "ethers";
import { useIFrameContext } from "../context/iframe";
import { useBalancerPools } from "./useBalancerPools";

export function useBalancerUserPools(poolType: "WEIGHTED" | "COW_AMM") {
  const { context } = useIFrameContext();
  const protocolVersionIn: (1 | 2)[] = poolType === "WEIGHTED" ? [2] : [1];
  const useSwrData = useBalancerPools(
    {
      poolTypeIn: [poolType],
      userAddress: context?.account,
      protocolVersionIn,
    },
    context?.chainId,
    "userbalanceUsd",
  );

  const data = useSwrData.data?.filter((pool) =>
    BigNumber.from(pool.userBalance.walletBalance).gt(BigNumber.from("10")),
  );

  return { ...useSwrData, data };
}
