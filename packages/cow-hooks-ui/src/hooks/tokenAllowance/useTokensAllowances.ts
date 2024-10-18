import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { type Address, erc20Abi } from "viem";
import { useIFrameContext } from "../../context/iframe";

export function useTokensAllowances({
  spender,
  tokenAddresses,
}: {
  tokenAddresses: Address[];
  spender?: Address;
}) {
  const { publicClient, context } = useIFrameContext();

  const tokenContracts = useMemo(
    () =>
      tokenAddresses.map((address) => ({
        address,
        abi: erc20Abi,
      })),
    [tokenAddresses],
  );

  const updateAllowances = useCallback(async () => {
    if (!publicClient || !context?.account || !spender)
      throw new Error("Missing context");

    if (!tokenAddresses.length) return {};

    const results = await publicClient.multicall({
      contracts: tokenContracts.map((contract) => ({
        ...contract,
        functionName: "allowance",
        args: [context.account, spender],
      })),
    });

    const allowances = results.map(({ result }) => result as bigint);

    return tokenAddresses.reduce(
      (acc, address, index) => {
        acc[address.toLowerCase()] = allowances[index];
        return acc;
      },
      {} as Record<string, bigint>,
    );
  }, [publicClient, context, spender, tokenContracts, tokenAddresses]);

  const { data } = useSWR<Record<string, bigint>>(
    ["allowances", tokenContracts, spender, context?.account],
    updateAllowances,
  );
  return data;
}
