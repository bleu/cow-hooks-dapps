import { formatNumber } from "@bleu.builders/ui";
import type { IPool } from "../types";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return <i>${formatNumber(pool.userBalance.walletBalanceUsd || 0, 2)}</i>;
}
