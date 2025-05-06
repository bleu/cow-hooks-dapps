import { morphoAbi, morphoOracleAbi } from "@bleu/utils/transactionFactory";
import { MORPHO_ADDRESS } from "@bleu/utils/transactionFactory/morpho";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { type Address, type PublicClient, formatUnits } from "viem";
import type { MorphoMarket } from "../types";

type OnchainMorphoMarketInfo = {
  onchainState: {
    totalSupplyAssets: bigint;
    totalSupplyShares: bigint;
    totalBorrowAssets: bigint;
    totalBorrowShares: bigint;
    lastUpdate: bigint;
    fee: bigint;
  };
  liquidity: bigint;
  liquidityUsd: number;
  price: bigint;
  position: {
    borrow: bigint;
    borrowUsd: number;
    borrowShares: bigint;
    collateral: bigint;
    collateralUsd: number;
  };
} | null;

export async function readOnchainMorphoMarkets(
  userAddress: Address,
  markets: MorphoMarket[],
  client: PublicClient,
  //stateDiff // TODO: add state diff
): Promise<OnchainMorphoMarketInfo[]> {
  try {
    const calls = markets.flatMap((market) => [
      {
        address: MORPHO_ADDRESS as Address,
        abi: morphoAbi,
        functionName: "market",
        args: [market.uniqueKey],
      },
      {
        address: MORPHO_ADDRESS as Address,
        abi: morphoAbi,
        functionName: "position",
        args: [market.uniqueKey, userAddress],
      },
      {
        address: market.oracle.address,
        abi: morphoOracleAbi,
        functionName: "price",
        args: [],
      },
    ]);

    const results = await client.multicall({
      contracts: calls,
      allowFailure: true,
    });

    const data: OnchainMorphoMarketInfo[] = [];
    const callsPerItem = 3; // Number of calls we make per item

    for (let i = 0; i < results.length; i += callsPerItem) {
      const market = markets[i / callsPerItem];

      const [marketResult, positionResult, priceResult] = results
        .slice(i, i + callsPerItem)
        .map((result) => result.result ?? null) as [
        [bigint, bigint, bigint, bigint, bigint, bigint],
        [bigint, bigint, bigint],
        bigint,
      ];

      if (
        marketResult === null ||
        positionResult === null ||
        priceResult === null
      ) {
        data.push(null);
        continue;
      }

      const [
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        lastUpdate,
        fee,
      ] = marketResult;

      const [_supplyShares, borrowShares, collateral] = positionResult;

      const borrow = MarketUtils.toBorrowAssets(borrowShares, {
        totalBorrowAssets,
        totalBorrowShares: totalBorrowShares,
      });
      const collateralUsd =
        Number(formatUnits(collateral, market.collateralAsset.decimals)) *
        market.collateralAsset.priceUsd;
      const borrowUsd =
        Number(formatUnits(borrow, market.loanAsset.decimals)) *
        market.loanAsset.priceUsd;

      const liquidity = totalSupplyAssets - totalBorrowAssets;

      const liquidityUsd =
        Number(formatUnits(liquidity, market.loanAsset.decimals)) *
        market.loanAsset.priceUsd;

      data.push({
        onchainState: {
          totalSupplyAssets,
          totalSupplyShares,
          totalBorrowAssets,
          totalBorrowShares,
          lastUpdate,
          fee,
        },
        liquidity,
        liquidityUsd,
        price: priceResult,
        position: {
          borrowShares,
          collateral,
          borrow,
          collateralUsd,
          borrowUsd,
        },
      });
    }

    return data;
  } catch (error) {
    console.error("Error reading morpho markets data:", error);
    return markets.map(() => null);
  }
}
