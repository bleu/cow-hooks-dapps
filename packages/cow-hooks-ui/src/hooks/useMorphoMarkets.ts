import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address, PublicClient } from "viem";
import type { MarketPosition, MorphoMarket } from "../types";
import { readOnchainMorphoMarkets } from "../utils/readOnchainMorphoMarkets";

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
  chainId?: SupportedChainId,
  where?: IGetPoolsWhere,
  orderBy?: string,
) {
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

      const marketsOnchainInfo = await readOnchainMorphoMarkets(
        userAddress as Address,
        gqlMarkets as MorphoMarket[],
        publicClient,
      );

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
