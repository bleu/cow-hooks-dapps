import type { Token } from "@uniswap/sdk-core";
import { BigNumber } from "ethers";

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

export interface IPoolBalance {
  token: Token;
  balance: BigNumber;
  fiatAmount: number;
}