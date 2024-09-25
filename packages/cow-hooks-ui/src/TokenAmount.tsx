import { formatNumber } from "@bleu/ui";
import type { Token } from "@uniswap/sdk-core";

export function TokenAmount({
  token,
  balance,
  fiatValue,
}: {
  token: Token;
  balance: number;
  fiatValue: number;
}) {
  return (
    <div className="flex flex-col items-end">
      <span>
        {formatNumber(balance, 4)} {token.symbol}
      </span>
      <i className="text-xs h-5">
        ≈ {fiatValue > 0 && `$${formatNumber(fiatValue, 2)}`}
      </i>
    </div>
  );
}
