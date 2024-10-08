import { BigNumberish } from "ethers";
import { Address } from "viem";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import { Token } from "@uniswap/sdk-core";

export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
}

export interface IHooksInfo {
  txs: BaseTransaction[];
  permitData: {
    tokenAddress: string;
    amount: BigNumberish;
    tokenSymbol: string;
  }[];
}

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
  chainId: SupportedChainId;
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
    isNested: boolean;
  }[];

  userBalance: {
    totalBalance: BigNumberish;
    walletBalance: BigNumberish;
    totalBalanceUsd: number;
    stakedBalances: {
      balance: BigNumberish;
      stakingId: string;
    }[];
  };
}

export interface IBalance {
  token: Token;
  balance: BigNumberish;
  fiatAmount: number;
}
