import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address, PublicClient } from "viem";
import type {
  MarketPosition,
  MorphoMarket,
  //  StateDiff
} from "../types";
import { readOnchainMorphoMarkets } from "../utils/readOnchainMorphoMarkets";
// import { useMemo } from "react";

interface IQuery {
  markets: {
    items: Omit<
      MorphoMarket,
      "position" | "liquidity" | "liquidityUsd" | "price" | "onchainState"
    >[];
  };
}

const MORPHO_MARKETS_QUERY = gql`
  query GetMarkets(
    $first: Int
    $skip: Int
    $orderBy: MarketOrderBy
    $orderDirection: OrderDirection
    $where: MarketFilters
  ) {
    markets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      items {
        state {
          dailyNetBorrowApy
          weeklyNetBorrowApy
          monthlyNetBorrowApy
        }
        collateralAsset {
          address
          decimals
          name
          symbol
          priceUsd
          logoURI
        }
        lltv
        loanAsset {
          address
          decimals
          name
          symbol
          priceUsd
          logoURI
        }
        uniqueKey
        irmAddress
        oracle {
          chain {
            id
            network
          }
          address
        }
        supplyingVaults {
          address
        }
      }

      pageInfo {
        count
        countTotal
        limit
        skip
      }
    }
  }
`;

interface IGetPoolsWhere {
  userAddress?: Address;
}

export function useMorphoMarkets(
  userAddress: Address | undefined,
  publicClient: PublicClient | undefined,
  // stateDiff?: StateDiff[],
  chainId?: SupportedChainId,
  where?: IGetPoolsWhere,
  orderBy?: string,
) {
  // const stateOverride = useMemo(() => {
  //   // Create an object to group by address
  //   const addressGroups: Record<
  //     string,
  //     { slot: `0x${string}`; value: `0x${string}` }[]
  //   > = {};

  //   // Populate the groups
  //   for (const diff of stateDiff ?? []) {
  //     const address = diff.address as Address;

  //     // Initialize the array if it doesn't exist yet
  //     if (!addressGroups[address]) {
  //       addressGroups[address] = [];
  //     }

  //     // Add all raw diffs to this address's array
  //     for (const rawDiff of diff.raw) {
  //       addressGroups[address].push({
  //         slot: rawDiff.key as `0x${string}`,
  //         value: rawDiff.dirty as `0x${string}`,
  //       });
  //     }
  //   }

  //   // Convert the grouped object back to an array
  //   return Object.entries(addressGroups).map(([address, stateDiff]) => ({
  //     address: address as Address,
  //     stateDiff,
  //   }));
  // }, [stateDiff]);

  return useSWR<MorphoMarket[]>(
    [where, chainId, userAddress],
    async ([where, chainId, userAddress]): Promise<MorphoMarket[]> => {
      if (!chainId || !userAddress) return [] as MorphoMarket[];
      if (!publicClient) throw new Error("missing public client");

      // TODO: handle pages
      const gqlMarkets = (
        await MORPHO_GQL_CLIENT.request<IQuery>(MORPHO_MARKETS_QUERY, {
          where: {
            ...where,
            chainId_in: [chainId],
            whitelisted: true,
          },
          orderBy: orderBy ?? "SupplyAssetsUsd",
          OrderDirection: "Desc",
        })
      ).markets.items.filter((market) => market.collateralAsset !== null);
      // console.log("here1");
      // console.log({ stateOverride });
      let marketsOnchainInfo = [];
      marketsOnchainInfo = await readOnchainMorphoMarkets(
        userAddress as Address,
        gqlMarkets as MorphoMarket[],
        publicClient,
        // stateOverride
      );

      // console.log("here2");
      // console.log({ marketsOnchainInfo });

      // merge onchain info into markets
      const markets = gqlMarkets
        .map((market, index) => {
          const marketOnchainInfo = marketsOnchainInfo[index];
          return marketOnchainInfo
            ? {
                ...market,
                ...marketOnchainInfo,
                lltv: BigInt(market.lltv),
              }
            : undefined;
        })
        .filter((market) => market) as MorphoMarket[];

      return [
        ...markets.filter((m) => hasPosition(m.position)),
        ...markets.filter((m) => !hasPosition(m.position)),
      ];
    },
    {
      revalidateOnFocus: false,
    },
  );
}

export function hasPosition(position: MarketPosition) {
  if (position.borrow > BigInt(0) || position.collateral > BigInt(0))
    return true;
  return false;
}
