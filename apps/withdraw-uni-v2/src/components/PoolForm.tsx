import {
  type IPool,
  PoolBalancesPreview,
  Spinner,
  SubmitButton,
  WithdrawPctSlider,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { Suspense } from "react";
import { usePoolBalances } from "#/hooks/usePoolBalances";

export function PoolForm({ selectedPool }: { selectedPool?: IPool }) {
  const { context } = useIFrameContext();
  const { data: poolBalances, isLoading } = usePoolBalances(selectedPool);

  if (isLoading && selectedPool) {
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
        <SubmitButton selectedPool={selectedPool} />
      </div>
    </Suspense>
  );
}
