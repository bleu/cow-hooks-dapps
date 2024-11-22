import type { BigNumber, BigNumberish } from "ethers";
import type { Address } from "viem";

export interface IToken {
  address: Address;
  symbol: string;
  decimals: number;
  weight: number;
  userBalance: BigNumberish;
  userBalanceUsd: number;
}

export interface IPool {
  id: `0x${string}`;
  chain: string;
  decimals: number;
  symbol: string;
  address: Address;
  type: string;
  protocolVersion: 1 | 2 | 3;
  allTokens: IToken[];
  userBalance: {
    walletBalance: BigNumber;
    walletBalanceUsd: number;
  };
}
