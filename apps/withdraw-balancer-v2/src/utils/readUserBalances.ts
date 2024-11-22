import { BigNumber } from "ethers";
import { type Address, type PublicClient, erc20Abi } from "viem";

export async function readUserBalances(
  userAddress: string,
  contracts: string[],
  client: PublicClient,
): Promise<BigNumber[]> {
  try {
    const calls = contracts.map((contractAddress) => ({
      address: contractAddress as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress as Address],
    }));

    const balances = await client.multicall({
      contracts: calls,
      allowFailure: true,
    });

    // Filter out any failed calls and map to return bigint array
    return balances.map((result) =>
      result.status === "success"
        ? BigNumber.from(result.result)
        : BigNumber.from("0"),
    );
  } catch (error) {
    console.error("Error reading balances:", error);
    return new Array(contracts.length).fill(BigInt(0));
  }
}
