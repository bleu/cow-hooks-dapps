import * as weiroll from "@weiroll/weiroll.js";
import { Contract } from "ethers";
import { type Address, encodeFunctionData, erc20Abi } from "viem";
import { weirollAbi } from "./abis/weirollAbi";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import { CommandFlags, WEIROLL_ADDRESS } from "./weiroll";

interface ERC20TransferFromExtraArgs {
  token: Address;
  from: Address;
  to: Address;
  symbol: string;
}
export interface ERC20TransferFromArgs
  extends BaseArgs,
    ERC20TransferFromExtraArgs {
  type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM;
  amount: bigint;
}

export interface ERC20TransferFromAllWeirollArgs
  extends BaseArgs,
    ERC20TransferFromExtraArgs {
  type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL;
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
export class ERC20TransferFromAllWeirollCreator
  implements ITransaction<ERC20TransferFromAllWeirollArgs>
{
  async createRawTx({
    token,
    from,
    to,
  }: ERC20TransferFromAllWeirollArgs): Promise<BaseTransaction> {
    const planner = new weiroll.Planner();

    const tokenWeirollContract = weiroll.Contract.createContract(
      new Contract(token, erc20Abi),
      CommandFlags.STATICCALL,
    );

    const tokenWeirollContractCall = weiroll.Contract.createContract(
      new Contract(token, erc20Abi),
      CommandFlags.CALL,
    );

    const amount = planner.add(tokenWeirollContract.balanceOf(from));

    planner.add(tokenWeirollContractCall.transfer(to, amount));

    const { commands, state } = planner.plan();

    return {
      to: WEIROLL_ADDRESS,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: weirollAbi,
        functionName: "execute",
        args: [commands, state],
      }),
      isDelegateCall: true,
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
