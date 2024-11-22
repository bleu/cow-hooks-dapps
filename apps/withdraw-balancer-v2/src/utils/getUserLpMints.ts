import { gql } from "urql";
import { thegraphClientsMap } from "./thegraphClientsMap";
import { SupportedChainId } from "@cowprotocol/cow-sdk";

export interface UserLpMintsReturn {
  mints: {
    sender: string;
    to: string;
    pair: {
      id: string;
      reserve0: string;
      reserve1: string;
      token0Price: string;
      token1Price: string;
      totalSupply: string;
      token0: {
        id: string;
        name: string;
        symbol: string;
        decimals: string;
        totalLiquidity: string;
        derivedETH: string;
      };
      token1: {
        id: string;
        name: string;
        symbol: string;
        decimals: string;
        totalLiquidity: string;
        derivedETH: string;
      };
    };
  }[];
  bundle: {
    ethPrice: string;
  };
}

const USER_LP_MINTS_QUERY = gql`
query UserLpMints($ownerAddress:String!) {
  mints(where: { to: $ownerAddress }) {
    sender
    to
    pair {
      id
      reserve0
      reserve1
      token0Price
      token1Price
      totalSupply
      token0 {
        id
        name
        symbol
        decimals
        totalLiquidity
        derivedETH
      }
      token1 {
        id
        name
        symbol
        decimals
        totalLiquidity
        derivedETH
      }
    }
  }
 	bundle (id:"1") {
    ethPrice
  }
}
`;
export async function getUserLpMints(
  ownerAddress: string,
  chainId: SupportedChainId,
): Promise<UserLpMintsReturn> {
  if (
    chainId !== SupportedChainId.ARBITRUM_ONE &&
    chainId !== SupportedChainId.MAINNET
  )
    throw new Error(`Unsupported chain id:${chainId}`);

  const client = thegraphClientsMap[chainId];

  const result = await client
    .query(USER_LP_MINTS_QUERY, { ownerAddress }, {})
    .toPromise();

  return result.data as UserLpMintsReturn;
}
