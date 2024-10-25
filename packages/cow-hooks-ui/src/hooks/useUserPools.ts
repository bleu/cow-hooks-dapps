import type { SupportedChainId } from "@cowprotocol/cow-sdk";

import { BigNumber } from "ethers";
import type { Address } from "viem";
import { usePools } from "./usePools";

export function useUserPools(chainId?: SupportedChainId, user?: Address) {
  const useSwrData = usePools(
    { poolTypeIn: ["COW_AMM"], userAddress: user },
    chainId,
    "userbalanceUsd",
  );
  const data = useSwrData.data?.filter((pool) =>
    BigNumber.from(pool.userBalance.walletBalance).gt(BigNumber.from("10")),
  );
  return { ...useSwrData, data };
}
