import { Address, encodeFunctionData, erc20Abi } from "viem";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TokenArgs,
  TRANSACTION_TYPES,
} from "./types";

export interface ERC20TransferFromArgs extends BaseArgs {
  type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM;
  token: TokenArgs;
  from: Address;
  to: Address;
  amount: bigint;
}

export class ERC20TransferFromFactory
  implements ITransaction<ERC20TransferFromArgs>
{
  createRawTx({
    token,
    from,
    to,
    amount,
  }: ERC20TransferFromArgs): BaseTransaction {
    return {
      to: token.address,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transferFrom",
        args: [from, to, amount],
      }),
    };
  }
}
