"use client";
import { formatNumber } from "@bleu/ui";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";

import { TokenLogo } from "./TokenLogo";
import { BlockExplorerLink } from "./ExplorerLink";
import { Token } from "@uniswap/sdk-core";

export function TokenInfo({
  token,
  balance,
  showBalance = false,
  showExplorerLink = true,
}: {
  token: Token;
  balance?: number;
  showBalance?: boolean;
  showExplorerLink?: boolean;
}) {
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
        <span>{token.symbol}</span>
        {showExplorerLink && (
          <BlockExplorerLink
            type="token"
            label={<ArrowTopRightIcon />}
            identifier={token.address}
            networkId={token.chainId}
          />
        )}
      </div>
      <div>
        {balance &&
          showBalance &&
          `(${formatNumber(balance, 4, "decimal", "compact", 0.001)})`}
      </div>
    </div>
  );
}
