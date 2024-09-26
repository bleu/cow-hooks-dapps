import { Address, encodeFunctionData, erc20Abi } from "viem";
import {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import { balancerGaugeAbi } from "../abis/balancerGaugeAbi";

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

export class GaugeClaimRewardsFactory
  implements ITransaction<GaugeClaimRewardsArgs>
{
  createRawTx(args: GaugeClaimRewardsArgs): BaseTransaction {
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

export class GaugeWithdrawFactory implements ITransaction<GaugeWithdrawArgs> {
  createRawTx(args: GaugeWithdrawArgs): BaseTransaction {
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
