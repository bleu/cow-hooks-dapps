import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { type Address, type PublicClient, erc20Abi } from "viem";
import type { TokenData } from "../types";

export async function readTokensData(
  addresses: string[],
  client: PublicClient,
  chainId: SupportedChainId,
): Promise<TokenData[]> {
  try {
    // Create multicall for each piece of data we want to fetch
    const calls = addresses.flatMap((address) => [
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ]);

    const results = await client.multicall({
      contracts: calls,
      allowFailure: true,
    });

    // Process results into tokensData objects
    const tokensData: TokenData[] = [];
    const callsPerToken = 3; // Number of calls we make per token

    for (let i = 0; i < results.length; i += callsPerToken) {
      const address = addresses[i / callsPerToken];

      // Extract all results for this token
      const [name, symbol, decimals] = results.slice(i, i + callsPerToken);

      tokensData.push({
        address,
        name: name.status === "success" ? String(name.result) : "",
        symbol:
          symbol.status === "success"
            ? String(symbol.result).replace("₮0", "T")
            : "",
        decimals: decimals.status === "success" ? Number(decimals.result) : 0,
        chainId,
      });
    }

    return tokensData;
  } catch (error) {
    console.error("Error reading token data:", error);
    // Return empty data for all pairs in case of error
    return addresses.map((address) => ({
      address,
      name: "",
      symbol: "",
      decimals: 0,
      chainId: 0,
    }));
  }
}
