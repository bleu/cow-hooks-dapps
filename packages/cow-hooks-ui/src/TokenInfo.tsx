"use client";
import { formatNumber } from "@bleu/ui";

import { getBlockExplorerUrl } from "@bleu/utils";
import type { Token } from "@uniswap/sdk-core";
import { TokenLogo } from "./TokenLogo";

export function TokenInfo({
  token,
  balance,
  showBalance = false,
}: {
  token: Token;
  balance?: number;
  showBalance?: boolean;
  showExplorerLink?: boolean;
}) {
  const tokenLink = getBlockExplorerUrl(token.chainId, "token", token.address);
  return (
    <div className="flex items-center gap-x-1">
      <div className="flex shrink-0 items-center justify-center">
        <div className="rounded-full">
          <TokenLogo
            token={token}
            className="rounded-full"
            alt="Token Logo"
            height={22}
            width={22}
            quality={100}
          />
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <a
          className="hover:underline"
          href={tokenLink}
          target="_blank"
          rel="noreferrer"
        >
          {token.symbol}
        </a>
      </div>
      <div>
        {balance &&
          showBalance &&
          `(${formatNumber(balance, 4, "decimal", "compact", 0.001)})`}
      </div>
    </div>
  );
}
