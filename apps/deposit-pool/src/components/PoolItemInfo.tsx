import type { IPool } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  const aprSumPct =
    pool.dynamicData.aprItems.reduce((acc, { apr }) => acc + apr, 0) * 100;

  return (
    <i className="text-xs">
      TVL: ${formatNumber(pool.dynamicData.totalLiquidity, 2)} - APR:{" "}
      {formatNumber(aprSumPct, 2)}%
    </i>
  );
}
