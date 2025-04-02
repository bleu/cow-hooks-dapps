import { type Address, encodeFunctionData } from "viem";
import { morphoBundlerAbi } from "./abis/morphoBundlersAbi";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

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
