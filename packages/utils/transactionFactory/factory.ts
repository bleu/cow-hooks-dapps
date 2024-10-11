import {
  GaugeClaimRewardsArgs,
  GaugeClaimRewardsCreator,
  GaugeWithdrawArgs,
  GaugeWithdrawCreator,
} from "./balancerGauge";
import { BalancerWithdrawArgs, BalancerWithdrawCreator } from "./balancerPool";
import {
  ERC20ApproveArgs,
  ERC20ApproveCreator,
  ERC20TransferFromArgs,
  ERC20TransferFromCreator,
} from "./erc20";
import { BaseTransaction, ITransaction, TRANSACTION_TYPES } from "./types";
import {
  CreateVestingArgs,
  CreateVestingCreator,
  CreateVestingWeirollArgs,
  CreateVestingWeirollCreator,
} from "./vestingEscrowFactory";

export type AllTransactionArgs = TransactionBindings[keyof TransactionBindings];

export interface TransactionBindings {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromArgs;
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsArgs;
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawArgs;
  [TRANSACTION_TYPES.BALANCER_WITHDRAW]: BalancerWithdrawArgs;
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveArgs;
  [TRANSACTION_TYPES.CREATE_VESTING]: CreateVestingArgs;
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL]: CreateVestingWeirollArgs;
}

const TRANSACTION_CREATORS: {
  [key in keyof TransactionBindings]: new () => ITransaction<
    TransactionBindings[key]
  >;
} = {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromCreator,
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsCreator,
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawCreator,
  [TRANSACTION_TYPES.BALANCER_WITHDRAW]: BalancerWithdrawCreator,
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveCreator,
  [TRANSACTION_TYPES.CREATE_VESTING]: CreateVestingCreator,
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL]: CreateVestingWeirollCreator,
};

export class TransactionFactory {
  static async createRawTx<T extends TRANSACTION_TYPES>(
    type: T,
    args: TransactionBindings[T]
  ): Promise<BaseTransaction> {
    const TransactionCreator = TRANSACTION_CREATORS[type];
    const txCreator = new TransactionCreator();
    return txCreator.createRawTx(args);
  }
}
