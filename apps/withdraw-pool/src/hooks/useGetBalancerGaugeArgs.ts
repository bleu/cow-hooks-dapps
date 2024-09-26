// TODO: Simplify this structure

import { useIFrameContext } from "#/context/iframe";
import { IMinimalPool } from "#/types";
import {
  GaugeClaimRewardsArgs,
  GaugeWithdrawArgs,
} from "#/utils/transactionFactory/balancerGauge";
import { TRANSACTION_TYPES } from "#/utils/transactionFactory/types";
import { BigNumber } from "ethers";
import { useCallback, useMemo } from "react";
import { Address } from "viem";

export function useBalancerGaugeClaimArgs(
  gaugeAddress: Address
): GaugeClaimRewardsArgs | undefined {
  const { context, cowShedProxy } = useIFrameContext();
  return useMemo(() => {
    if (!context?.account || !cowShedProxy) return;
    return {
      gaugeAddress,
      gaugeTokenHolder: cowShedProxy,
      type: TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS,
      recipient: context.account,
    };
  }, [context, gaugeAddress]);
}

export function useGetBalancerWithdrawCallbackArgs(
  gaugeAddress: Address
): (amount: BigNumber) => GaugeWithdrawArgs | undefined {
  const { context, cowShedProxy } = useIFrameContext();
  return useCallback(
    (amount: BigNumber) => {
      if (!context?.account || !cowShedProxy) return;
      return {
        type: TRANSACTION_TYPES.GAUGE_WITHDRAW,
        claimRewards: false,
        gaugeAddress,
        amount: amount.toBigInt(),
      };
    },
    [gaugeAddress]
  );
}

export function useGetSingleBalancerGaugeArgs(
  gaugeAddress: Address
): ({
  totalBptToWithdraw,
  bptAlreadyWithdraw,
  maxBptToWithdraw,
}: {
  totalBptToWithdraw: BigNumber;
  bptAlreadyWithdraw: BigNumber;
  maxBptToWithdraw: BigNumber;
}) => [GaugeClaimRewardsArgs, GaugeWithdrawArgs] | undefined {
  const gaugeClaimArgs = useBalancerGaugeClaimArgs(gaugeAddress);
  const getBalancerWithdrawCallbackArgs =
    useGetBalancerWithdrawCallbackArgs(gaugeAddress);

  return useCallback(
    ({ totalBptToWithdraw, bptAlreadyWithdraw, maxBptToWithdraw }) => {
      if (!gaugeClaimArgs) return;
      if (totalBptToWithdraw.lte(bptAlreadyWithdraw)) return;
      if (totalBptToWithdraw.gt(maxBptToWithdraw)) {
        totalBptToWithdraw = maxBptToWithdraw;
      }
      const withdrawArgs = getBalancerWithdrawCallbackArgs(
        totalBptToWithdraw.sub(bptAlreadyWithdraw)
      );
      if (!withdrawArgs) return;
      return [gaugeClaimArgs, withdrawArgs];
    },
    [gaugeClaimArgs, getBalancerWithdrawCallbackArgs, gaugeAddress]
  );
}

export function useGetBalancerGaugeArgs(
  poolData: IMinimalPool
): (bptIn: BigNumber) => [GaugeClaimRewardsArgs, GaugeWithdrawArgs][] {
  // TODO: missing transfer of gauge tokens
  const getBalancerGaugeArgsList = poolData.userBalance.stakedBalance.map(
    (stakedBalance) =>
      useGetSingleBalancerGaugeArgs(stakedBalance.stakingId as Address)
  );

  return useCallback(
    (bptIn: BigNumber) => {
      return getBalancerGaugeArgsList
        .map((getBalancerGaugeArgs, index) => {
          const stackedBalanceAlreadyWithdraw =
            poolData.userBalance.stakedBalance
              .map((stakedBalance) => stakedBalance.balance)
              .reduce((a, b) => BigNumber.from(a).add(b), 0);

          const walletBalance = BigNumber.from(
            poolData.userBalance.walletBalance
          );

          return getBalancerGaugeArgs({
            totalBptToWithdraw: bptIn,
            bptAlreadyWithdraw: walletBalance.add(
              stackedBalanceAlreadyWithdraw
            ),
            maxBptToWithdraw: BigNumber.from(
              poolData.userBalance.stakedBalance[index].balance
            ),
          });
        })
        .filter((args) => args !== undefined);
    },

    [poolData, getBalancerGaugeArgsList]
  );
}
