import { Address, encodeFunctionData, erc20Abi } from "viem";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export interface ERC20TransferFromArgs extends BaseArgs {
  type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM;
  token: Address;
  from: Address;
  to: Address;
  amount: bigint;
  symbol: string;
}
export interface ERC20ApproveArgs extends BaseArgs {
  type: TRANSACTION_TYPES.ERC20_APPROVE;
  token: Address;
  spender: Address;
  amount: bigint;
}

export class ERC20TransferFromCreator
  implements ITransaction<ERC20TransferFromArgs>
{
  async createRawTx({
    token,
    from,
    to,
    amount,
  }: ERC20TransferFromArgs): Promise<BaseTransaction> {
    return {
      to: token,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transferFrom",
        args: [from, to, amount],
      }),
    };
  }
}
export class ERC20ApproveCreator implements ITransaction<ERC20ApproveArgs> {
  async createRawTx({
    token,
    spender,
    amount,
  }: ERC20ApproveArgs): Promise<BaseTransaction> {
    return {
      to: token,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
      }),
    };
  }
}
