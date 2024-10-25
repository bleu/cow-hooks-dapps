import { formatNumber } from "@bleu/ui";
import type { IPool } from "../types";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return <i>${formatNumber(pool.userBalance.walletBalanceUsd, 2)}</i>;
}
