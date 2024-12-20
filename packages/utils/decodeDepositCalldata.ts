import type { DepositFormType } from "types";
import {
  type Address,
  type PublicClient,
  erc20Abi,
  formatUnits,
  hexToBigInt,
} from "viem";

export const decodeDepositCalldata = async (
  string: `0x${string}`,
  publicClient: PublicClient,
): Promise<DepositFormType> => {
  const encodedFormData = string.slice(-290);

  const poolId = `0x${encodedFormData.slice(0, 40)}`;
  const token1 = `0x${encodedFormData.slice(40, 80)}`;
  const token2 = `0x${encodedFormData.slice(80, 120)}`;

  const amount1 = hexToBigInt(`0x${encodedFormData.slice(120, 184)}`);
  const amount2 = hexToBigInt(`0x${encodedFormData.slice(184, 248)}`);

  const decimalsResponse = await publicClient.multicall({
    contracts: [
      {
        address: token1 as Address,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: token2 as Address,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
  });

  const decimals = decimalsResponse.map((result) => {
    if (result.status === "success") {
      return Number(result.result);
    }
    throw new Error("Unexpected error");
  });

  const amounts = {
    [token1.toLowerCase()]: formatUnits(amount1, decimals[0]),
    [token2.toLowerCase()]: formatUnits(amount2, decimals[1]),
  };

  const referenceTokenAddress = `0x${encodedFormData.slice(248, 288)}`;

  const result = {
    poolId,
    amounts,
    referenceTokenAddress,
  } as DepositFormType;

  return result;
};
