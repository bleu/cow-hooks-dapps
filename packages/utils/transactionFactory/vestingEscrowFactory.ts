import { Address, encodeFunctionData, erc20Abi } from "viem";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import * as weiroll from "@weiroll/weiroll.js";

import { vestingEscrowFactoryAbi } from "./abis/vestingEscrowFactoryAbi";
import { Contract } from "ethers";
import { weirollAbi } from "./abis/weirollAbi";
import { WEIROLL_ADDRESS, CommandFlags } from "./weiroll";

export interface CreateVestingWeirollArgs extends BaseArgs {
  type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL;
  token: Address;
  cowShedProxy: Address;
  recipient: Address;
  vestingDuration: bigint;
  vestingEscrowFactoryAddress: Address;
  amount?: bigint;
}

export class CreateVestingWeirollCreator
  implements ITransaction<CreateVestingWeirollArgs>
{
  async createRawTx(args: CreateVestingWeirollArgs): Promise<BaseTransaction> {
    console.log("in CreateVestingWeirollCreator");
    console.log({ args });

    const planner = new weiroll.Planner();

    const tokenWeirollContract = weiroll.Contract.createContract(
      new Contract(args.token, erc20Abi),
      CommandFlags.STATICCALL
    );

    const vestingEscrowContract = weiroll.Contract.createContract(
      new Contract(args.vestingEscrowFactoryAddress, vestingEscrowFactoryAbi),
      CommandFlags.CALL
    );

    const amount = planner.add(
      tokenWeirollContract.balanceOf(args.cowShedProxy)
    );

    planner.add(
      vestingEscrowContract.deploy_vesting_contract(
        args.token,
        args.recipient,
        amount,
        args.vestingDuration
      )
    );

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

export interface CreateVestingArgs extends BaseArgs {
  type: TRANSACTION_TYPES.CREATE_VESTING;
  token: Address;
  recipient: Address;
  amount: bigint;
  vestingDuration: bigint;
  vestingEscrowFactoryAddress: Address;
}

export class CreateVestingCreator implements ITransaction<CreateVestingArgs> {
  async createRawTx(args: CreateVestingArgs): Promise<BaseTransaction> {
    console.log("in CreateVestingCreator");
    console.log({ args });

    return {
      to: args.vestingEscrowFactoryAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: vestingEscrowFactoryAbi,
        functionName: "deploy_vesting_contract",
        args: [args.token, args.recipient, args.amount, args.vestingDuration],
      }),
    };
  }
}
