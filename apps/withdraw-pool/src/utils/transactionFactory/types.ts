export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
}

export enum TRANSACTION_TYPES {
  // TODO: ERC20 Permit
  // Update Balancer Withdraw for this pattern
  ERC20_TRANSFER_FROM = "TRANSFER_FROM",
  GAUGE_CLAIM_REWARDS = "GAUGE_CLAIM_REWARDS",
  GAUGE_WITHDRAW = "GAUGE_WITHDRAW",
}

export interface BaseArgs {
  type: TRANSACTION_TYPES;
}

export interface TokenArgs {
  decimals: number;
  address: string;
}

export interface ITransaction<T> {
  createRawTx(args: T): BaseTransaction;
}
