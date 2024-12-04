import type { BigNumberish } from "ethers";
import type { Address } from "viem";

export interface RawTokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  extensions: {
    tokens: string;
  };
}

export interface TokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
}

export interface IToken {
  address: Address;
  symbol: string;
  decimals: number;
  weight: number;
  userBalance: BigNumberish;
  userBalanceUsd: number;
}
