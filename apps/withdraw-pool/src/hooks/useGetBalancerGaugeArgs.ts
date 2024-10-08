import { IMinimalPool, useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  GaugeClaimRewardsArgs,
  GaugeWithdrawArgs,
  ERC20TransferFromArgs,
  TRANSACTION_TYPES,
} from "@bleu/utils/transactionFactory";
import { HookDappContext } from "@cowprotocol/hook-dapp-lib";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Address } from "viem";

export function getSingleBalancerGaugeArgs({
  totalBptToWithdraw,
  bptAlreadyWithdraw,
  maxBptToWithdraw,
  gaugeAddress,
  context,
  cowShedProxy,
}: {
  totalBptToWithdraw: BigNumber;
  bptAlreadyWithdraw: BigNumber;
  maxBptToWithdraw: BigNumber;
  gaugeAddress: Address;
  context?: HookDappContext;
  cowShedProxy?: Address;
}):
  | [ERC20TransferFromArgs, GaugeClaimRewardsArgs, GaugeWithdrawArgs]
  | undefined {
  if (!context?.account || !cowShedProxy) return;
  if (totalBptToWithdraw.lte(bptAlreadyWithdraw)) return;
  if (totalBptToWithdraw.gt(maxBptToWithdraw)) {
    totalBptToWithdraw = maxBptToWithdraw;
  }

  const amountToWithdraw = totalBptToWithdraw.sub(bptAlreadyWithdraw);
  return [
    {
      type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
      token: gaugeAddress,
      from: cowShedProxy,
      to: cowShedProxy,
      amount: amountToWithdraw.toBigInt(),
      symbol: "Gauge Token", // TODO: get symbol from token
    },
    {
      gaugeAddress,
      gaugeTokenHolder: cowShedProxy,
      type: TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS,
      recipient: context.account as Address,
    },
    {
      type: TRANSACTION_TYPES.GAUGE_WITHDRAW,
      claimRewards: false,
      gaugeAddress,
      amount: amountToWithdraw.toBigInt(),
    },
  ];
}

export function useGetBalancerGaugeArgs(
  poolData?: IMinimalPool
): (
  bptAmount: BigNumber
) => (ERC20TransferFromArgs | GaugeClaimRewardsArgs | GaugeWithdrawArgs)[] {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    (bptAmount: BigNumber) => {
      if (!poolData) return [];
      return poolData?.userBalance.stakedBalances
        .map((stakedBalance, index) => {
          const stackedBalanceAlreadyWithdraw =
            poolData?.userBalance.stakedBalances
              .slice(0, index)
              .map((stakedBalances) => stakedBalances.balance)
              .reduce((a, b) => BigNumber.from(a).add(b), 0);

          const walletBalance = BigNumber.from(
            poolData.userBalance.walletBalance
          );

          return getSingleBalancerGaugeArgs({
            totalBptToWithdraw: bptAmount,
            bptAlreadyWithdraw: walletBalance.add(
              stackedBalanceAlreadyWithdraw
            ),
            maxBptToWithdraw: BigNumber.from(stakedBalance.balance),
            gaugeAddress: poolData.address,
            context,
            cowShedProxy,
          });
        })
        .filter((args) => args !== undefined)
        .flat();
    },

    [poolData, context, cowShedProxy]
  );
}
