// TODO: Simplify this structure

import { useIFrameContext } from "#/context/iframe";
import { IMinimalPool } from "#/types";
import {
  GaugeClaimRewardsArgs,
  GaugeWithdrawArgs,
} from "#/utils/transactionFactory/balancerGauge";
import { ERC20TransferFromArgs } from "#/utils/transactionFactory/erc20";
import { TRANSACTION_TYPES } from "#/utils/transactionFactory/types";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { Address } from "viem";

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
}) =>
  | [ERC20TransferFromArgs, GaugeClaimRewardsArgs, GaugeWithdrawArgs]
  | undefined {
  const { context, cowShedProxy } = useIFrameContext();

  return useCallback(
    ({ totalBptToWithdraw, bptAlreadyWithdraw, maxBptToWithdraw }) => {
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
          decimals: 18,
          amount: amountToWithdraw.toBigInt(),
        },
        {
          gaugeAddress,
          gaugeTokenHolder: cowShedProxy,
          type: TRANSACTION_TYPES.GAUGE_CLAIM_REWARDS,
          recipient: context.account,
        },
        {
          type: TRANSACTION_TYPES.GAUGE_WITHDRAW,
          claimRewards: false,
          gaugeAddress,
          amount: amountToWithdraw.toBigInt(),
        },
      ];
    },
    [context, cowShedProxy, gaugeAddress]
  );
}

export function useGetBalancerGaugeArgs(
  poolData: IMinimalPool
): (
  bptIn: BigNumber
) => [ERC20TransferFromArgs, GaugeClaimRewardsArgs, GaugeWithdrawArgs][] {
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
