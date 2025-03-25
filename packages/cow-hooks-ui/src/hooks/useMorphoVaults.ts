import { MORPHO_GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import type { Address } from "viem";

interface IQuery {
  vaults: {
    items: { address: string }[];
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
  return useSWR<IQuery>(
    [where, chainId],
    async ([where, chainId]): Promise<IQuery> => {
      if (!chainId) return { vaults: { items: [] } };
      return await MORPHO_GQL_CLIENT.request<IQuery>(MORPHO_VAULTS_QUERY, {
        where: where ?? {},
        first: 5,
        orderBy,
        OrderDirection: "Asc",
      });
    },
    {
      revalidateOnFocus: false,
    }
  );
}
