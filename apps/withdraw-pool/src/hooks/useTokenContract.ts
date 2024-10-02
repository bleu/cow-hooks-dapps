import { useIFrameContext } from "#/context/iframe";
import { useMemo } from "react";
import { Address, erc20Abi, getContract } from "viem";

export function useTokenContract(tokenAddress?: Address) {
  const { publicClient } = useIFrameContext();

  return useMemo(() => {
    if (!publicClient || !tokenAddress) return;

    return getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client: publicClient,
    });
  }, [publicClient, tokenAddress]);
}
