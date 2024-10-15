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
    <span className="text-xs">
      {formatNumber(balance, 4)} {token.symbol}{" "}
      <i className="xsm:block hidden">
        (≈ ${fiatValue >= 0 ? formatNumber(fiatValue, 2) : "0"})
      </i>
    </span>
  );
}
