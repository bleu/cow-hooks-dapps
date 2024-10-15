import { IPool } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return <i>${formatNumber(pool.userBalance.totalBalanceUsd, 2)}</i>;
}
