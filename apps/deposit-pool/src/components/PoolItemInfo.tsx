import { formatNumber } from "@bleu.builders/ui";
import type { IPool } from "@bleu/cow-hooks-ui";

const TOTAL_BASE_APR_TYPES = [
  "SWAP_FEE_24H",
  "IB_YIELD",
  "STAKING",
  "MERKL",
  "SURPLUS",
  "VEBAL_EMISSIONS",
];

export function PoolItemInfo({ pool }: { pool: IPool }) {
  if (!pool.dynamicData) return null;
  const aprSumPct =
    pool.dynamicData.aprItems
      .filter(({ type }) => TOTAL_BASE_APR_TYPES.includes(type))
      .reduce((acc, { apr }) => acc + apr, 0) * 100;

  return (
    <div className="flex text-right items-end flex-col gap-1 text-xs">
      <i>TVL: ${formatNumber(pool.dynamicData?.totalLiquidity || 0, 2)}</i>
      <i>APR: {formatNumber(aprSumPct, 2)}%</i>
    </div>
  );
}
