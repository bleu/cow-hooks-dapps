import { type Address, encodeFunctionData } from "viem";
import { balancerGaugeAbi } from "./abis/balancerGaugeAbi";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export interface GaugeClaimRewardsArgs extends BaseArgs {
  type: TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS;
  gaugeAddress: Address;
  gaugeTokenHolder: Address;
  recipient: Address;
}

export interface GaugeWithdrawArgs extends BaseArgs {
  type: TRANSACTION_TYPES.GAUGE_WITHDRAW;
  gaugeAddress: Address;
  amount: bigint;
  claimRewards: boolean;
}

export class GaugeClaimRewardsCreator
  implements ITransaction<GaugeClaimRewardsArgs>
{
  async createRawTx(args: GaugeClaimRewardsArgs): Promise<BaseTransaction> {
    return {
      to: args.gaugeAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: balancerGaugeAbi,
        functionName: "claim_rewards",
        args: [args.gaugeTokenHolder, args.recipient],
      }),
    };
  }
}

export class GaugeWithdrawCreator implements ITransaction<GaugeWithdrawArgs> {
  async createRawTx(args: GaugeWithdrawArgs): Promise<BaseTransaction> {
    return {
      to: args.gaugeAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: balancerGaugeAbi,
        functionName: "withdraw",
        args: [args.amount, args.claimRewards],
      }),
    };
  }
}
