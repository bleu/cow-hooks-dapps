import { cn, formatNumber } from "@bleu/ui";
import type { Token } from "@uniswap/sdk-core";

export function TokenAmount({
  token,
  balance,
  fiatValue,
  className,
}: {
  token: Token;
  balance: number;
  fiatValue: number;
  className?: string;
}) {
  return (
    <span className="text-xs">
      {formatNumber(balance, 4)} {token.symbol}{" "}
      <i>(≈ ${fiatValue >= 0 ? formatNumber(fiatValue, 2) : "0"})</i>
    </span>
  );
}
