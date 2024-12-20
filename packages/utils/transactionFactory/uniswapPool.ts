import type { BigNumber } from "ethers";
import { type Address, encodeFunctionData } from "viem";
import { uniswapV2Router02Abi } from "./abis/uniswapV2Router02Abi";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export interface UniswapWithdrawArgs extends BaseArgs {
  type: TRANSACTION_TYPES.UNISWAP_WITHDRAW;
  uniswapRouterAddress: Address;
  tokenA: Address;
  tokenB: Address;
  liquidity: BigNumber;
  amountAMin: BigNumber;
  amountBMin: BigNumber;
  recipient: Address;
  deadline: BigNumber;
}
export interface UniswapDepositArgs extends BaseArgs {
  type: TRANSACTION_TYPES.UNISWAP_DEPOSIT;
  uniswapRouterAddress: Address;
  tokenA: Address;
  tokenB: Address;
  amountADesired: bigint;
  amountBDesired: bigint;
  amountAMin: bigint;
  amountBMin: bigint;
  recipient: Address;
  deadline: bigint;
}

export class UniswapWithdrawCreator
  implements ITransaction<UniswapWithdrawArgs>
{
  async createRawTx(args: UniswapWithdrawArgs): Promise<BaseTransaction> {
    return {
      to: args.uniswapRouterAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: uniswapV2Router02Abi,
        functionName: "removeLiquidity",
        args: [
          args.tokenA,
          args.tokenB,
          args.liquidity,
          args.amountAMin,
          args.amountBMin,
          args.recipient,
          args.deadline,
        ],
      }),
    };
  }
}
export class UniswapDepositCreator implements ITransaction<UniswapDepositArgs> {
  async createRawTx(args: UniswapDepositArgs): Promise<BaseTransaction> {
    return {
      to: args.uniswapRouterAddress,
      value: BigInt(0),
      callData: encodeFunctionData({
        abi: uniswapV2Router02Abi,
        functionName: "addLiquidity",
        args: [
          args.tokenA,
          args.tokenB,
          args.amountADesired,
          args.amountBDesired,
          args.amountAMin,
          args.amountBMin,
          args.recipient,
          args.deadline,
        ],
      }),
    };
  }
}
