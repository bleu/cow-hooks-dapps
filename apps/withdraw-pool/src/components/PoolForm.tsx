import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { WithdrawPctSlider } from "./WithdrawPctSlider";
import { PoolBalancesPreview } from "./PoolBalancePreview";
import { SubmitButton } from "./SubmitButton";

export function PoolForm({ poolId }: { poolId?: string }) {
  const { context } = useIFrameContext();
  const {
    data: poolBalances,
    isValidating,
    isLoading,
  } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  if (!context || !poolId || !poolBalances || !poolBalances.length) return null;

  if (isValidating || isLoading) return <Spinner size="xl" />;

  return (
    <div className="size-full flex flex-col gap-2">
      <WithdrawPctSlider />
      <PoolBalancesPreview poolBalances={poolBalances} />
      <SubmitButton poolId={poolId} />
    </div>
  );
}
