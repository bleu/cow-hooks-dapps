import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address } from "viem";
import type { MarketPosition, MorphoMarket } from "../types";

interface IQuery {
  markets: {
    items: Omit<MorphoMarket, "position">[];
  };
}

interface IMarketPositionsQuery {
  userByAddress: {
    marketPositions: { market: { uniqueKey: string }; state: MarketPosition }[];
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
          supplyAssets
          supplyAssetsUsd
          borrowAssets
          borrowAssetsUsd
          collateralAssetsUsd
          dailyNetBorrowApy
          dailyNetSupplyApy
          weeklyNetBorrowApy
          weeklyNetSupplyApy
          monthlyNetBorrowApy
          monthlyNetSupplyApy
          liquidityAssets
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
        reallocatableLiquidityAssets
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

const USER_MARKET_POSITIONS_QUERY = gql`
  query GetUserMarketPositions($chainId: Int!, $userAddress: String!) {
    userByAddress(address: $userAddress, chainId: $chainId) {
      marketPositions {
        market {
          uniqueKey
        }
        state {
          supplyShares
          supplyAssetsUsd
          supplyAssets
          collateralUsd
          collateralValue
          collateral
          borrowShares
          borrowAssetsUsd
          borrowAssets
        }
      }
    }
  }
`;

interface IGetPoolsWhere {
  userAddress?: Address;
}

export function useMorphoMarkets(
  where: IGetPoolsWhere,
  chainId?: SupportedChainId,
  userAddress?: Address,
  orderBy?: string,
) {
  return useSWR<MorphoMarket[]>(
    [where, chainId, userAddress],
    async ([where, chainId, userAddress]): Promise<MorphoMarket[]> => {
      if (!chainId) return [] as MorphoMarket[];

      // TODO: handle pages
      const markets = (
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

      if (!userAddress)
        return markets.map((market) => ({ ...market, position: null }));

      let rawPositions: IMarketPositionsQuery | null;
      rawPositions = null;
      try {
        rawPositions = (await MORPHO_GQL_CLIENT.request<IMarketPositionsQuery>(
          USER_MARKET_POSITIONS_QUERY,
          {
            chainId,
            userAddress,
          },
        )) as IMarketPositionsQuery;
        // No positions will trigger an error
      } catch {}

      if (!rawPositions)
        return markets.map((market) => ({ ...market, position: null }));

      // parse positions
      const positions = rawPositions.userByAddress.marketPositions.map(
        (marketPosiiton) => ({
          ...marketPosiiton.state,
          uniqueKey: marketPosiiton.market.uniqueKey,
        }),
      ) as (MarketPosition & { uniqueKey: string })[];

      // merge positions into markets
      const marketsWithPositions = markets.map((market) => {
        const position = positions.find(
          (position) => position.uniqueKey === market.uniqueKey,
        );
        if (!position) return { ...market, position: null };
        return { ...market, position: position as MarketPosition };
      });

      return [
        ...marketsWithPositions.filter((m) => m.position),
        ...marketsWithPositions.filter((m) => !m.position),
      ];
    },
    {
      revalidateOnFocus: false,
    },
  );
}
