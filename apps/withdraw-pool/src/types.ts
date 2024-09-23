import { Token } from "@uniswap/sdk-core";

export interface IMinimalPool {
  id: string;
  chain: string;
  symbol: string;
  dynamicData: {
    totalLiquidity: string;
    volume24h: string;
  };
  allTokens: {
    address: string;
    symbol: string;
    decimals: number;
  }[];
  userBalance: {
    totalBalance: string;
  };
}

export interface PoolBalance {
  token: Token;
  balance: string;
  fiatAmount: string;
}
