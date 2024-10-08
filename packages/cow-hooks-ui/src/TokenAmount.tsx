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
    <div className={cn("flex flex-col items-end", className)}>
      <span>
        {formatNumber(balance, 4)} {token.symbol}
      </span>
      <i className="text-xs h-5">
        ≈ {fiatValue >= 0 && `$${formatNumber(fiatValue, 2)}`}
      </i>
    </div>
  );
}
