import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { WithdrawPctSlider } from "./WithdrawPctSlider";
import { PoolBalancesPreview } from "./PoolBalancePreview";
import { SubmitButton } from "./SubmitButton";

export function PoolForm({ poolId }: { poolId?: string }) {
  const { context } = useIFrameContext();
  const {
    data: poolBalances,
    isLoading,
    isValidating,
  } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  if (!poolBalances?.length && (isLoading || isValidating))
    return <Spinner size="xl" />;

  if (!context || !poolId || !poolBalances || !poolBalances.length) return null;

  return (
    <div className="size-full flex flex-col gap-2">
      <WithdrawPctSlider />
      <PoolBalancesPreview poolBalances={poolBalances} />
      <SubmitButton poolId={poolId} />
    </div>
  );
}
