import { BigNumber } from "ethers";
import type { Address, PublicClient } from "viem";
import { uniswapV2PairAbi } from "./abis/uniswapV2PairAbi";

interface PairData {
  address: string;
  userBalance: BigNumber;
  price0CumulativeLast: BigNumber;
  price1CumulativeLast: BigNumber;
  reserve0: BigNumber;
  reserve1: BigNumber;
  totalSupply: BigNumber;
}

export async function readPairsData(
  userAddress: string,
  pairAddresses: string[],
  client: PublicClient,
  balancesDiff: Record<string, string>,
): Promise<PairData[]> {
  try {
    // Create multicall for each piece of data we want to fetch
    const calls = pairAddresses.flatMap((pairAddress) => [
      {
        address: pairAddress as Address,
        abi: uniswapV2PairAbi,
        functionName: "balanceOf",
        args: [userAddress as Address],
      },
      {
        address: pairAddress as Address,
        abi: uniswapV2PairAbi,
        functionName: "price0CumulativeLast",
      },
      {
        address: pairAddress as Address,
        abi: uniswapV2PairAbi,
        functionName: "price1CumulativeLast",
      },
      {
        address: pairAddress as Address,
        abi: uniswapV2PairAbi,
        functionName: "getReserves",
      },
      {
        address: pairAddress as Address,
        abi: uniswapV2PairAbi,
        functionName: "totalSupply",
      },
    ]);

    const results = await client.multicall({
      contracts: calls,
      allowFailure: true,
    });

    // Process results into PairData objects
    const pairsData: PairData[] = [];
    const callsPerPair = 5; // Number of calls we make per pair

    for (let i = 0; i < results.length; i += callsPerPair) {
      const pairAddress = pairAddresses[i / callsPerPair];

      // Extract all results for this pair
      const [
        balanceResult,
        price0Result,
        price1Result,
        reservesResult,
        totalSupplyResult,
      ] = results.slice(i, i + callsPerPair);

      const tokenBalanceDiff = balancesDiff?.[pairAddress.toLowerCase()] || "0";

      pairsData.push({
        address: pairAddress,
        userBalance:
          balanceResult.status === "success"
            ? BigNumber.from(balanceResult.result).add(
                tokenBalanceDiff ? BigNumber.from(tokenBalanceDiff) : "0",
              )
            : BigNumber.from("0"),
        price0CumulativeLast: BigNumber.from(
          price0Result.status === "success" ? price0Result.result : "0",
        ),
        price1CumulativeLast: BigNumber.from(
          price1Result.status === "success" ? price1Result.result : "0",
        ),
        reserve0:
          reservesResult.status === "success"
            ? //@ts-ignore
              BigNumber.from(reservesResult.result[0])
            : BigNumber.from("0"),
        reserve1:
          reservesResult.status === "success"
            ? //@ts-ignore
              BigNumber.from(reservesResult.result[1])
            : BigNumber.from("0"),
        totalSupply: BigNumber.from(
          totalSupplyResult.status === "success"
            ? totalSupplyResult.result
            : "0",
        ),
      });
    }

    return pairsData;
  } catch (error) {
    console.error("Error reading pair data:", error);
    // Return empty data for all pairs in case of error
    return pairAddresses.map((address) => ({
      address,
      userBalance: BigNumber.from("0"),
      price0CumulativeLast: BigNumber.from("0"),
      price1CumulativeLast: BigNumber.from("0"),
      token0: "",
      token1: "",
      reserve0: BigNumber.from("0"),
      reserve1: BigNumber.from("0"),
      totalSupply: BigNumber.from("0"),
    }));
  }
}

export async function readPairData(
  userAddress: string,
  pairAddress: string,
  client: PublicClient,
  balancesDiff: Record<string, string>,
) {
  const calls = [
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "balanceOf",
      args: [userAddress as Address],
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "price0CumulativeLast",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "price1CumulativeLast",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "getReserves",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "totalSupply",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "token0",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "token1",
    },
    {
      address: pairAddress as Address,
      abi: uniswapV2PairAbi,
      functionName: "symbol",
    },
  ];

  const results = await client.multicall({
    contracts: calls,
    allowFailure: true,
  });

  if (results.some((result) => result.status === "failure")) {
    throw new Error("Failed to read pair data");
  }

  // Extract all results
  const [
    balanceResult,
    price0Result,
    price1Result,
    reservesResult,
    totalSupplyResult,
    token0Result,
    token1Result,
    symbol,
  ] = results;

  const tokenBalanceDiff = balancesDiff?.[pairAddress.toLowerCase()] || "0";

  return {
    address: pairAddress,
    userBalance: BigNumber.from(balanceResult.result).add(
      tokenBalanceDiff ? BigNumber.from(tokenBalanceDiff) : "0",
    ),
    price0CumulativeLast: BigNumber.from(price0Result.result),
    price1CumulativeLast: BigNumber.from(price1Result.result),
    //@ts-ignore
    reserve0: BigNumber.from(reservesResult.result[0]),
    //@ts-ignore
    reserve1: BigNumber.from(reservesResult.result[1]),
    totalSupply: BigNumber.from(totalSupplyResult.result),
    tokens: [String(token0Result.result), String(token1Result.result)],
    symbol: String(symbol.result),
  };
}
