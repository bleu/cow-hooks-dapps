import { type IPool, Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { Suspense } from "react";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { PoolBalancesPreview } from "./PoolBalancePreview";
import { SubmitButton } from "./SubmitButton";
import { WithdrawPctSlider } from "./WithdrawPctSlider";

export function PoolForm({ selectedPool }: { selectedPool?: IPool }) {
  const { context } = useIFrameContext();
  const { data: poolBalances, isLoading } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId: selectedPool?.id,
  });

  if (!poolBalances?.length && isLoading) {
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
