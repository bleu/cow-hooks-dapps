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
  user?: Address;
}

export class CreateVestingWeirollCreator
  implements ITransaction<CreateVestingWeirollArgs>
{
  async createRawTx(args: CreateVestingWeirollArgs): Promise<BaseTransaction> {
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
      // if user is passed, it means it is a Vest All operation,
      // so the user's balance will be read instead of proxy's
      tokenWeirollContract.balanceOf(args.user ?? args.cowShedProxy)
    );

    if (args.user) {
      const tokenWeirollContractCall = weiroll.Contract.createContract(
        new Contract(args.token, erc20Abi),
        CommandFlags.CALL
      );
      planner.add(
        tokenWeirollContractCall.transferFrom(
          args.user,
          args.cowShedProxy,
          amount
        )
      );
    }

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
