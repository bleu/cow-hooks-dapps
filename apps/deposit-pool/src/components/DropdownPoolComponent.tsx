import { IPool, TokenLogo, useIFrameContext } from "@bleu/cow-hooks-ui";
import { formatNumber } from "@bleu/ui";
import { Token } from "@uniswap/sdk-core";

export function DropdownPoolComponent({ pool }: { pool: IPool }) {
  const { context } = useIFrameContext();

  const aprSumPct =
    pool.dynamicData.aprItems.reduce((acc, { apr }) => acc + apr, 0) * 100;

  const weightsText = pool.allTokens
    .map(({ weight }) => weight * 100)
    .join("/");

  if (!context) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-1">
        {weightsText}
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
      </div>
      <i className="text-xs">
        TVL: ${formatNumber(pool.dynamicData.totalLiquidity, 2)} - Volume (24h):
        ${formatNumber(pool.dynamicData.totalLiquidity, 2)} - APR:{" "}
        {formatNumber(aprSumPct, 2)}%
      </i>
    </div>
  );
}
