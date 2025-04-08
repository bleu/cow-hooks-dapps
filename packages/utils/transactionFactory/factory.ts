import {
  type GaugeClaimRewardsArgs,
  GaugeClaimRewardsCreator,
  type GaugeWithdrawArgs,
  GaugeWithdrawCreator,
} from "./balancerGauge";
import {
  type BalancerDepositArgs,
  BalancerDepositCreator,
  type BalancerWithdrawArgs,
  BalancerWithdrawCreator,
} from "./balancerPool";
import {
  type ERC20ApproveArgs,
  ERC20ApproveCreator,
  type ERC20TransferFromAllWeirollArgs,
  ERC20TransferFromAllWeirollCreator,
  type ERC20TransferFromArgs,
  ERC20TransferFromCreator,
} from "./erc20";
import {
  type MorphoBorrowArgs,
  MorphoBorrowCreator,
  type MorphoDepositArgs,
  MorphoDepositCreator,
  type MorphoSupplyArgs,
  MorphoSupplyCreator,
} from "./morpho";
import {
  type BaseTransaction,
  type ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import {
  type UniswapDepositArgs,
  UniswapDepositCreator,
  type UniswapWithdrawArgs,
  UniswapWithdrawCreator,
} from "./uniswapPool";
import {
  type CreateVestingArgs,
  CreateVestingCreator,
  type CreateVestingWeirollProxyArgs,
  CreateVestingWeirollProxyCreator,
  type CreateVestingWeirollUserArgs,
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
  [TRANSACTION_TYPES.UNISWAP_WITHDRAW]: UniswapWithdrawArgs;
  [TRANSACTION_TYPES.UNISWAP_DEPOSIT]: UniswapDepositArgs;
  [TRANSACTION_TYPES.MORPHO_DEPOSIT]: MorphoDepositArgs;
  [TRANSACTION_TYPES.MORPHO_SUPPLY]: MorphoSupplyArgs;
  [TRANSACTION_TYPES.MORPHO_BORROW]: MorphoBorrowArgs;
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
  [TRANSACTION_TYPES.UNISWAP_WITHDRAW]: UniswapWithdrawCreator,
  [TRANSACTION_TYPES.UNISWAP_DEPOSIT]: UniswapDepositCreator,
  [TRANSACTION_TYPES.MORPHO_DEPOSIT]: MorphoDepositCreator,
  [TRANSACTION_TYPES.MORPHO_SUPPLY]: MorphoSupplyCreator,
  [TRANSACTION_TYPES.MORPHO_BORROW]: MorphoBorrowCreator,
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
