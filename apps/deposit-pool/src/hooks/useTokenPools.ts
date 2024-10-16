import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { usePools } from "@bleu/cow-hooks-ui";
import { Address } from "viem";

export function useTokenPools(chainId?: SupportedChainId, token?: Address) {
  return usePools(
    { poolTypeIn: ["COW_AMM"], tokensIn: token ? [token] : [] },
    chainId,
    "totalLiquidity"
  );
}
