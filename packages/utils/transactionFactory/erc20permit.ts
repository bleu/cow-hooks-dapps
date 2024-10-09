import { Address, encodeFunctionData } from "viem";
import { erc20PermitAbi } from "./abis/erc20PermitAbi";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export interface ERC20PermitTransferFromArgs extends BaseArgs {
  type: TRANSACTION_TYPES.ERC20PERMIT_TRANSFER_FROM;
  token: Address;
  from: Address;
  to: Address;
  amount: bigint;
  symbol: string;
}

export class ERC20PermitTransferFromCreator
  implements ITransaction<ERC20PermitTransferFromArgs>
{
  async createRawTx({
    token,
    from,
    to,
    amount,
  }: ERC20PermitTransferFromArgs): Promise<BaseTransaction> {
    return {
      to: token,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: erc20PermitAbi,
        functionName: "transferFrom",
        args: [from, to, amount],
      }),
    };
  }
}
