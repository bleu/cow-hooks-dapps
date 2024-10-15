import { Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { PoolBalancesPreview } from "./PoolBalancePreview";
import { SubmitButton } from "./SubmitButton";
import { WithdrawPctSlider } from "./WithdrawPctSlider";

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

  if (isValidating || isLoading) return <Spinner size="xl" />;

  if (!context || !poolId || !poolBalances || !poolBalances.length) return null;

  return (
    <div className="size-full flex flex-col gap-2">
      <WithdrawPctSlider />
      <PoolBalancesPreview poolBalances={poolBalances} />
      <SubmitButton poolId={poolId} />
    </div>
  );
}
