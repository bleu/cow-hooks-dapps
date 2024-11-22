import type { BigNumber } from "ethers";
import { encodeFunctionData, type Address } from "viem";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";
import { uniswapV2Router02Abi } from "./abis/uniswapV2Router02Abi";

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
