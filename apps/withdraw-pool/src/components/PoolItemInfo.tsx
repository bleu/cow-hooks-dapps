import { formatNumber } from "@bleu.builders/ui";
import type { IPool } from "@bleu/cow-hooks-ui";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return <i>${formatNumber(pool.userBalance.walletBalanceUsd, 2)}</i>;
}
