export interface BaseTransaction {
  to: string;
  value: bigint;
  callData: string;
  isDelegateCall?: boolean;
}

export enum TRANSACTION_TYPES {
  ERC20_APPROVE = "ERC20_APPROVE",
  ERC20_TRANSFER_FROM = "TRANSFER_FROM",
  ERC20PERMIT_TRANSFER_FROM = "ERC20PERMIT_TRANSFER_FROM",
  GAUGE_CLAIM_REWARDS = "GAUGE_CLAIM_REWARDS",
  GAUGE_WITHDRAW = "GAUGE_WITHDRAW",
  BALANCER_WITHDRAW = "BALANCER_WITHDRAW",
  CREATE_VESTING = "CREATE_VESTING",
}

export interface BaseArgs {
  type: TRANSACTION_TYPES;
}

export interface TokenArgs {
  decimals: number;
  address: string;
}

export interface ITransaction<T> {
  createRawTx(args: T): Promise<BaseTransaction>;
}
