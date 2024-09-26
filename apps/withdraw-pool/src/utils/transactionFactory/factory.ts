import {
  GaugeClaimRewardsArgs,
  GaugeClaimRewardsFactory,
  GaugeWithdrawArgs,
  GaugeWithdrawFactory,
} from "./balancerGauge";
import { ERC20TransferFromArgs, ERC20TransferFromFactory } from "./erc20";
import { BaseTransaction, ITransaction, TRANSACTION_TYPES } from "./types";

export type AllTransactionArgs = TransactionBindings[keyof TransactionBindings];

export interface TransactionBindings {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromArgs;
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsArgs;
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawArgs;
}

const TRANSACTION_CREATORS: {
  [key in keyof TransactionBindings]: new () => ITransaction<
    TransactionBindings[key]
  >;
} = {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromFactory,
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsFactory,
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawFactory,
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
