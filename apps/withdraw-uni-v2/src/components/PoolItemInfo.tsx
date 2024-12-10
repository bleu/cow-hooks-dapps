import { formatNumber } from "@bleu.builders/ui";
import type { IPool } from "@bleu/cow-hooks-ui";
import { formatUnits } from "viem";

export function PoolItemInfo({ pool }: { pool: IPool }) {
  return (
    <i className="flex text-right justify-end">
      {formatNumber(
        formatUnits(BigInt(pool.userBalance.walletBalance.toString()), 18),
        4,
        "decimal",
        "standard"
      )}
    </i>
  );
}
