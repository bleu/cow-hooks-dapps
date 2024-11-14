import { formatNumber } from "@bleu.builders/ui";
import type { IPool } from "@bleu/cow-hooks-ui";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  const aprSumPct =
    pool.dynamicData.aprItems.reduce((acc, { apr }) => acc + apr, 0) * 100;

  return (
    <div className="flex text-left items-start flex-col gap-1 text-xs">
      <i>TVL: ${formatNumber(pool.dynamicData.totalLiquidity, 2)}</i>
      <i>APR: {formatNumber(aprSumPct, 2)}%</i>
    </div>
  );
}
