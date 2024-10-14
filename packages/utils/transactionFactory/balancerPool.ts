import {
  type PoolState,
  RemoveLiquidity,
  RemoveLiquidityKind,
  type RemoveLiquidityProportionalInput,
  Slippage,
} from "@balancer/sdk";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { BigNumber } from "ethers";
import type { Address } from "viem";
import { RPC_URL_MAPPING } from "./rpcs";
import type {
  BaseArgs,
  BaseTransaction,
  ITransaction,
  TRANSACTION_TYPES,
} from "./types";

export interface BalancerWithdrawArgs extends BaseArgs {
  type: TRANSACTION_TYPES.BALANCER_WITHDRAW;
  poolState: PoolState;
  bptAmount: BigNumber;
  chainId: SupportedChainId;
  decimals: number;
  sender: Address;
  recipient: Address;
}

const removeLiquidity = new RemoveLiquidity();

export class BalancerWithdrawCreator
  implements ITransaction<BalancerWithdrawArgs>
{
  async createRawTx({
    poolState,
    chainId,
    bptAmount,
    decimals,
    sender,
    recipient,
  }: BalancerWithdrawArgs): Promise<BaseTransaction> {
    const removeLiquidityInput: RemoveLiquidityProportionalInput = {
      chainId,
      rpcUrl: RPC_URL_MAPPING[chainId],
      bptIn: {
        rawAmount: bptAmount.toBigInt(),
        decimals: decimals,
        address: poolState.address as Address,
      },
      kind: RemoveLiquidityKind.Proportional,
    };

    const query = await removeLiquidity.query(removeLiquidityInput, poolState);
    const call = removeLiquidity.buildCall({
      ...query,
      slippage: Slippage.fromPercentage("1"), // same used here https://github.com/balancer/b-sdk/blob/9e08225c6f39471e0befcdd45683263d2c47595d/examples/removeLiquidity/removeLiquidity.ts
      sender,
      recipient,
      chainId,
    });
    return call;
  }
}
