import { Suspense } from "react";
import { Token } from "@uniswap/sdk-core";
import {
  type IBalance,
  PoolBalancesPreview,
  Spinner,
  SubmitButton,
  useIFrameContext,
  WithdrawPctSlider,
} from "@bleu/cow-hooks-ui";
import type { IPool } from "#/types";

export function PoolForm({ selectedPool }: { selectedPool?: IPool }) {
  const { context } = useIFrameContext();
  const poolBalances: IBalance[] | undefined =
    selectedPool && context
      ? selectedPool?.allTokens.map((token) => {
          return {
            token: new Token(
              context.chainId,
              token.address,
              token.decimals,
              token.symbol,
            ),
            balance: token.userBalance,
            fiatAmount: token.userBalanceUsd,
            weight: token.weight,
          };
        })
      : undefined;

  if (!poolBalances?.length && selectedPool) {
    return (
      <div className="flex justify-center w-[50px] mt-5">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!context || !selectedPool || !poolBalances || !poolBalances.length)
    return null;

  return (
    <Suspense fallback={<Spinner size="xl" />}>
      <div className="size-full flex flex-col gap-2">
        <WithdrawPctSlider />
        <PoolBalancesPreview poolBalances={poolBalances} />
        <SubmitButton poolId={selectedPool?.id} />
      </div>
    </Suspense>
  );
}
