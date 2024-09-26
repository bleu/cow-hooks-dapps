import { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import type { Token } from "@uniswap/sdk-core";
import { BigNumberish } from "ethers";
import { Address } from "viem";

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
}
export interface IMinimalPool {
  id: `0x${string}`;
  chain: string;
  decimals: number;
  symbol: string;
  address: Address;
  type: string;
  protocolVersion: 1 | 2 | 3;
  dynamicData: {
    totalLiquidity: string;
    volume24h: string;
    totalShares: BigNumberish;
  };
  allTokens: {
    address: Address;
    symbol: string;
    decimals: number;
  }[];
  userBalance: {
    totalBalance: BigNumberish;
    walletBalance: BigNumberish;
    stakedBalance: {
      balance: BigNumberish;
      stakingId: string;
    }[];
  };
}

export interface IPoolBalance {
  token: Token;
  balance: BigNumberish;
  fiatAmount: number;
}
