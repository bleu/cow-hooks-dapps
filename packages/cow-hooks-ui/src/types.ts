import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import type { Token } from "@uniswap/sdk-core";
import type { BigNumber, BigNumberish } from "ethers";
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
  balancesDiff: Record<string, Record<string, string>>;
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
  weight: number;
  reserve?: BigNumberish;
}

export interface IPool {
  id: `0x${string}`;
  chain: string;
  decimals: number;
  symbol: string;
  address: Address;
  type: string;
  protocolVersion: 1 | 2 | 3;
  totalSupply?: BigNumber;
  dynamicData?: {
    aprItems: {
      apr: number;
      id: string;
      type: string;
    }[];
    totalLiquidity: string;
    volume24h: string;
    totalShares: BigNumberish;
  };
  poolTokens: IToken[];

  userBalance: {
    walletBalance: BigNumberish;
    walletBalanceUsd?: number;
    stakedBalances?: {
      balance: BigNumberish;
      stakingId: string;
    }[];
  };
}

export interface IBalance {
  token: Token;
  balance: BigNumber;
  fiatAmount: number;
  weight: number;
}

export interface TokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
}

export interface MorphoVault {
  address: Address;
  asset: {
    address: Address;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
    priceUsd: number;
  };
  chain: {
    id: number;
    network: string;
  };
  liquidity: {
    usd: number;
  };
  metadata: {
    curators: {
      name: string;
      image: string;
      url: string;
    }[];
  };
  name: string;
  state: {
    allocation: {
      market: {
        collateralAsset: {
          address: Address;
          symbol: string;
          decimals: number;
          logoURI: string;
        };
      };
    }[];
    dailyNetApy: number;
    weeklyNetApy: number;
    monthlyNetApy: number;
    quarterlyNetApy: number;
    totalAssets: bigint;
    totalAssetsUsd: number;
    totalSupply: bigint;
  };
}

export interface MorphoMarket {
  state: {
    supplyAssetsUsd: number;
    borrowAssetsUsd: number;
    collateralAssetsUsd: number;
    dailyNetBorrowApy: number;
    dailyNetSupplyApy: number;
    weeklyNetBorrowApy: number;
    weeklyNetSupplyApy: number;
    monthlyNetBorrowApy: number;
    monthlyNetSupplyApy: number;
  };
  collateralAsset: {
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    priceUsd: number;
    logoURI: string;
  };
  lltv: bigint;
  loanAsset: {
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    priceUsd: number;
    logoURI: string;
  };
  uniqueKey: `0x${string}`;
  irmAddress: Address;
  oracle: {
    chain: {
      id: number;
      network: string;
    };
    address: Address;
  };
}

export interface MorphoMarketParams {
  collateralToken: Address;
  loanToken: Address;
  oracle: Address;
  irm: Address;
  lltv: bigint;
}
