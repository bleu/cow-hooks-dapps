import {
  type GaugeClaimRewardsArgs,
  GaugeClaimRewardsCreator,
  type GaugeWithdrawArgs,
  GaugeWithdrawCreator,
} from "./balancerGauge";
import {
  BalancerDepositArgs,
  BalancerDepositCreator,
  type BalancerWithdrawArgs,
  BalancerWithdrawCreator,
} from "./balancerPool";
import {
  type ERC20ApproveArgs,
  ERC20ApproveCreator,
  ERC20TransferFromAllWeirollArgs,
  ERC20TransferFromAllWeirollCreator,
  type ERC20TransferFromArgs,
  ERC20TransferFromCreator,
} from "./erc20";
import {
  type BaseTransaction,
  type ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import {
  type CreateVestingArgs,
  CreateVestingCreator,
  CreateVestingWeirollProxyArgs,
  CreateVestingWeirollProxyCreator,
  CreateVestingWeirollUserArgs,
  CreateVestingWeirollUserCreator,
} from "./vestingEscrowFactory";

export type AllTransactionArgs = TransactionBindings[keyof TransactionBindings];

export interface TransactionBindings {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromArgs;
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL]: ERC20TransferFromAllWeirollArgs;
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsArgs;
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawArgs;
  [TRANSACTION_TYPES.BALANCER_WITHDRAW]: BalancerWithdrawArgs;
  [TRANSACTION_TYPES.BALANCER_DEPOSIT]: BalancerDepositArgs;
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveArgs;
  [TRANSACTION_TYPES.CREATE_VESTING]: CreateVestingArgs;
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_PROXY]: CreateVestingWeirollProxyArgs;
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_USER]: CreateVestingWeirollUserArgs;
}

const TRANSACTION_CREATORS: {
  [key in keyof TransactionBindings]: new () => ITransaction<
    TransactionBindings[key]
  >;
} = {
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM]: ERC20TransferFromCreator,
  [TRANSACTION_TYPES.ERC20_TRANSFER_FROM_ALL_WEIROLL]:
    ERC20TransferFromAllWeirollCreator,
  [TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS]: GaugeClaimRewardsCreator,
  [TRANSACTION_TYPES.GAUGE_WITHDRAW]: GaugeWithdrawCreator,
  [TRANSACTION_TYPES.BALANCER_WITHDRAW]: BalancerWithdrawCreator,
  [TRANSACTION_TYPES.BALANCER_DEPOSIT]: BalancerDepositCreator,
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveCreator,
  [TRANSACTION_TYPES.CREATE_VESTING]: CreateVestingCreator,
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_PROXY]:
    CreateVestingWeirollProxyCreator,
  [TRANSACTION_TYPES.CREATE_VESTING_WEIROLL_USER]:
    CreateVestingWeirollUserCreator,
};

// This class is intentionally designed with only static members
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
