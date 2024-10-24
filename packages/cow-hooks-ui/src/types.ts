import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import type { Token } from "@uniswap/sdk-core";
import type { BigNumberish } from "ethers";
import type { Address } from "viem";

export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
  isDelegateCall?: boolean;
}

export interface IHooksInfo {
  txs: BaseTransaction[];
  permitData?: {
    tokenAddress: string;
    amount: BigNumberish;
    tokenSymbol: string;
  }[];
  recipientOverride?: string;
}

export interface HookDappContextAdjusted extends HookDappContext {
  account?: Address;
  chainId: SupportedChainId;
}

export interface SignatureStepsProps {
  callback: () => Promise<void>;
  label: string;
  description: string;
  id: string;
  tooltipText?: string;
}

export interface IToken {
  address: Address;
  symbol: string;
  decimals: number;
  isNested: boolean;
  weight: number;
}

export interface IPool {
  id: `0x${string}`;
  chain: string;
  decimals: number;
  symbol: string;
  address: Address;
  type: string;
  protocolVersion: 1 | 2 | 3;
  dynamicData: {
    aprItems: {
      apr: number;
      id: string;
    }[];
    totalLiquidity: string;
    volume24h: string;
    totalShares: BigNumberish;
  };
  allTokens: IToken[];

  userBalance: {
    totalBalance: BigNumberish;
    walletBalance: BigNumberish;
    totalBalanceUsd: number;
    walletBalanceUsd: number;
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
  weight: number;
}
