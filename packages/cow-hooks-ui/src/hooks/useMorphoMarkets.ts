import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address } from "viem";
import type { MorphoMarket } from "../types";

interface IQuery {
  markets: {
    items: MorphoMarket[];
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
          supplyAssetsUsd
          borrowAssetsUsd
          collateralAssetsUsd
          dailyNetBorrowApy
          dailyNetSupplyApy
          weeklyNetBorrowApy
          weeklyNetSupplyApy
          monthlyNetBorrowApy
          monthlyNetSupplyApy
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
  where: IGetPoolsWhere,
  chainId?: SupportedChainId,
  orderBy?: string,
) {
  return useSWR<MorphoMarket[]>(
    [where, chainId],
    async ([where, chainId]): Promise<MorphoMarket[]> => {
      if (!chainId) return [] as MorphoMarket[];
      // TODO: handle pages
      return (
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
    },
    {
      revalidateOnFocus: false,
    },
  );
}
