import { type Address, encodeFunctionData } from "viem";
import { morphoAbi } from "./abis/morphoAbi";
import { morphoBundlerAbi } from "./abis/morphoBundlersAbi";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export const MORPHO_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

export interface MorphoDepositArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MORPHO_DEPOSIT;
  vaultAddress: Address;
  assetAddress: Address;
  morphoBundlerAddress: Address;
  amount: bigint;
  recipient: Address;
  minShares: bigint;
  permitParams?: {
    deadline: number;
    r: number;
    s: string;
    v: string;
    skipRevert: boolean;
  };
}

export class MorphoDepositCreator implements ITransaction<MorphoDepositArgs> {
  async createRawTx(args: MorphoDepositArgs): Promise<BaseTransaction> {
    const transferFrom = encodeFunctionData({
      abi: morphoBundlerAbi,
      functionName: "erc20TransferFrom",
      args: [args.assetAddress, args.amount],
    });

    const deposit = encodeFunctionData({
      abi: morphoBundlerAbi,
      functionName: "erc4626Deposit",
      args: [args.vaultAddress, args.amount, args.minShares, args.recipient],
    });

    return {
      to: args.morphoBundlerAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: morphoBundlerAbi,
        functionName: "multicall",
        args: [[transferFrom, deposit]],
      }),
    };
  }
}

interface MorphoMarketParams {
  collateralToken: Address;
  loanToken: Address;
  oracle: Address;
  irm: Address;
  lltv: bigint;
}

export interface MorphoSupplyArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MORPHO_SUPPLY;
  marketParams: MorphoMarketParams;
  amount: bigint;
  recipient: Address;
}

export class MorphoSupplyCreator implements ITransaction<MorphoSupplyArgs> {
  async createRawTx(args: MorphoSupplyArgs): Promise<BaseTransaction> {
    return {
      to: MORPHO_ADDRESS,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: morphoAbi,
        functionName: "supplyCollateral",
        args: [args.marketParams, args.amount, args.recipient, "0x"],
      }),
    };
  }
}

export interface MorphoBorrowArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MORPHO_BORROW;
  marketParams: MorphoMarketParams;
  assets: bigint;
  shares: bigint;
  recipient: Address;
}

export class MorphoBorrowCreator implements ITransaction<MorphoBorrowArgs> {
  async createRawTx(args: MorphoBorrowArgs): Promise<BaseTransaction> {
    return {
      to: MORPHO_ADDRESS,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: morphoAbi,
        functionName: "borrow",
        args:
          args.assets > BigInt(0)
            ? [
                args.marketParams,
                args.assets,
                BigInt(0), // shares = 0
                args.recipient,
                args.recipient,
              ]
            : [
                args.marketParams,
                BigInt(0), // assets = 0
                args.shares,
                args.recipient,
                args.recipient,
              ],
      }),
    };
  }
}

export interface MorphoRepayArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MORPHO_REPAY;
  marketParams: MorphoMarketParams;
  assets: bigint;
  shares: bigint;
  recipient: Address;
}

export class MorphoRepayCreator implements ITransaction<MorphoRepayArgs> {
  async createRawTx(args: MorphoRepayArgs): Promise<BaseTransaction> {
    return {
      to: MORPHO_ADDRESS,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: morphoAbi,
        functionName: "repay",
        args:
          args.assets > BigInt(0)
            ? [
                args.marketParams,
                args.assets,
                BigInt(0), // shares = 0
                args.recipient,
                "0x", // additional data
              ]
            : [
                args.marketParams,
                BigInt(0), // assets = 0
                args.shares,
                args.recipient,
                "0x", // additional data
              ],
      }),
    };
  }
}

export interface MorphoWithdrawArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MORPHO_WITHDRAW;
  marketParams: MorphoMarketParams;
  assets: bigint;
  recipient: Address;
}

export class MorphoWithdrawCreator implements ITransaction<MorphoWithdrawArgs> {
  async createRawTx(args: MorphoWithdrawArgs): Promise<BaseTransaction> {
    return {
      to: MORPHO_ADDRESS,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: morphoAbi,
        functionName: "withdrawCollateral",
        args: [args.marketParams, args.assets, args.recipient, args.recipient],
      }),
    };
  }
}
