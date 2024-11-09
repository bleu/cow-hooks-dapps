import { cn, formatNumber } from "@bleu.builders/ui";
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
    <span className={cn("text-xs", className)}>
      {formatNumber(balance, 4)} {token.symbol}{" "}
      <i className="xsm:block hidden text-foreground/50">
        (≈ ${fiatValue >= 0 ? formatNumber(fiatValue, 2) : "0"})
      </i>
    </span>
  );
}
