import { Address, encodeFunctionData } from "viem";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import { vestingEscrowFactoryAbi } from "./abis/vestingEscrowFactoryAbi";

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
