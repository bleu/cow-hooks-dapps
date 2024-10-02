import {
  GaugeClaimRewardsArgs,
  GaugeClaimRewardsCreator,
  GaugeWithdrawArgs,
  GaugeWithdrawCreator,
} from "./balancerGauge";
import { BalancerWithdrawArgs, BalancerWithdrawCreator } from "./balancerPool";
import { ERC20TransferFromArgs, ERC20TransferFromCreator } from "./erc20";
import { BaseTransaction, ITransaction, TRANSACTION_TYPES } from "./types";

export type AllTransactionArgs = TransactionBindings[keyof TransactionBindings];

export interface TransactionBindings {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromArgs;
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsArgs;
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawArgs;
  [TRANSACTION_TYPES.BALANCER_WITHDRAW]: BalancerWithdrawArgs;
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
