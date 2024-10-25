import { IPool } from "../types";
import { formatNumber } from "@bleu/ui";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return <i>${formatNumber(pool.userBalance.walletBalanceUsd, 2)}</i>;
}
