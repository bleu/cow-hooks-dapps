import { IPool, TokenLogo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";
import { Token } from "@uniswap/sdk-core";

export function DropdownPoolComponent({ pool }: { pool: IPool }) {
  const { context } = useIFrameContext();

  if (!context) return null;

  return (
    <div className="flex flex-row items-center gap-1">
      <span>{pool.symbol.replace("BCoW-", "")}</span>

      {pool.allTokens.map((token) => {
        const tokenObject = new Token(
          context?.chainId,
          token.address,
          token.decimals,
          token.symbol
        );

        return (
          <div className="flex items-center gap-1">
            <TokenLogo
              key={`${pool.id}-${token.address}`}
              token={tokenObject}
              width={20}
              height={20}
            />
            <span>{token.symbol}</span>
          </div>
        );
      })}
      <i>${formatNumber(pool.userBalance.totalBalanceUsd, 2)}</i>
    </div>
  );
}
