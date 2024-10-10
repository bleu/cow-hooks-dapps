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

// Copied from weiroll repo: https://github.com/EnsoFinance/enso-weiroll.js/blob/25081c263663c035cc773b7d90dfc352b7d7a541/src/planner.ts
/**
 * CommandFlags
 * @description Flags that modify a command's execution
 * @enum {number}
 */
enum CommandFlags {
  DELEGATECALL = 0,
  CALL = 1,
  STATICCALL = 2,
  CALL_WITH_VALUE = 3,
  CALLTYPE_MASK = 3,
  EXTENDED_COMMAND = 64,
  TUPLE_RETURN = 128,
}
export interface CreateVestingArgs extends BaseArgs {
  type: TRANSACTION_TYPES.CREATE_VESTING;
  token: Address;
  cowShedProxy: Address;
  recipient: Address;
  vestingDuration: bigint;
  vestingEscrowFactoryAddress: Address;
}

export class CreateVestingCreator implements ITransaction<CreateVestingArgs> {
  async createRawTx(args: CreateVestingArgs): Promise<BaseTransaction> {
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
      to: "0x53A349b7E27741a12d9aDe861F78De46bb4b828F",
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
