import * as weiroll from "@weiroll/weiroll.js";
import { type Address, encodeFunctionData, erc20Abi } from "viem";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

import { Contract } from "ethers";
import { vestingEscrowFactoryAbi } from "./abis/vestingEscrowFactoryAbi";
import { weirollAbi } from "./abis/weirollAbi";
import { CommandFlags, WEIROLL_ADDRESS } from "./weiroll";

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

export interface CreateVestingWeirollProxyArgs extends BaseArgs {
  type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_PROXY;
  token: Address;
  cowShedProxy: Address;
  recipient: Address;
  vestingDuration: bigint;
  vestingEscrowFactoryAddress: Address;
}

export class CreateVestingWeirollProxyCreator
  implements ITransaction<CreateVestingWeirollProxyArgs>
{
  async createRawTx(
    args: CreateVestingWeirollProxyArgs
  ): Promise<BaseTransaction> {
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

export interface CreateVestingWeirollUserArgs extends BaseArgs {
  type: TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_USER;
  token: Address;
  cowShedProxy: Address;
  recipient: Address;
  vestingDuration: bigint;
  vestingEscrowFactoryAddress: Address;
  user: Address;
}

export class CreateVestingWeirollUserCreator
  implements ITransaction<CreateVestingWeirollUserArgs>
{
  async createRawTx(
    args: CreateVestingWeirollUserArgs
  ): Promise<BaseTransaction> {
    const planner = new weiroll.Planner();

    const tokenWeirollContract = weiroll.Contract.createContract(
      new Contract(args.token, erc20Abi),
      CommandFlags.STATICCALL
    );

    const tokenWeirollContractCall = weiroll.Contract.createContract(
      new Contract(args.token, erc20Abi),
      CommandFlags.CALL
    );

    const vestingEscrowContract = weiroll.Contract.createContract(
      new Contract(args.vestingEscrowFactoryAddress, vestingEscrowFactoryAbi),
      CommandFlags.CALL
    );

    const amount = planner.add(tokenWeirollContract.balanceOf(args.user));

    planner.add(
      tokenWeirollContractCall.transferFrom(
        args.user,
        args.cowShedProxy,
        amount
      )
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
