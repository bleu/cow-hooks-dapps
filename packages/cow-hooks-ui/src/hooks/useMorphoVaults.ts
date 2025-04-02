import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address } from "viem";
import type { MorphoVault } from "../types";

interface IQuery {
  vaults: {
    items: MorphoVault[];
  };
}

const MORPHO_VAULTS_QUERY = gql`
  query GetVaults(
    $first: Int
    $skip: Int
    $orderBy: VaultOrderBy
    $orderDirection: OrderDirection
    $where: VaultFilters
  ) {
    vaults(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      items {
        address
        asset {
          address
          decimals
          logoURI
          name
          symbol
          priceUsd
        }
        chain {
          id
          network
        }
        liquidity {
          usd
        }
        metadata {
          curators {
            name
            image
            url
          }
        }
        name
        state {
          allocation {
            market {
              collateralAsset {
                address
                symbol
                decimals
                logoURI
              }
            }
          }
          dailyNetApy
          weeklyNetApy
          monthlyNetApy
          quarterlyNetApy
          totalAssets
          totalAssetsUsd
          totalSupply
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

export function useMorphoVaults(
  where: IGetPoolsWhere,
  chainId?: SupportedChainId,
  orderBy?: string
) {
  return useSWR<MorphoVault[]>(
    [where, chainId],
    async ([where, chainId]): Promise<MorphoVault[]> => {
      if (!chainId) return [] as MorphoVault[];
      return (
        await MORPHO_GQL_CLIENT.request<IQuery>(MORPHO_VAULTS_QUERY, {
          where: {
            ...where,
            chainId_in: [chainId],
            whitelisted: true,
          },
          orderBy: orderBy ?? "TotalAssetsUsd",
          OrderDirection: "Desc",
        })
      ).vaults.items;
    },
    {
      revalidateOnFocus: false,
    }
  );
}
