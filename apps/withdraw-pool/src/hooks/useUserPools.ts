import type { SupportedChainId } from "@cowprotocol/cow-sdk";

import { usePools } from "@bleu/cow-hooks-ui";
import { Address } from "viem";

export function useUserPools(chainId?: SupportedChainId, user?: Address) {
  return usePools(
    { poolTypeIn: ["COW_AMM"], userAddress: user },
    chainId,
    "userbalanceUsd"
  );
}
