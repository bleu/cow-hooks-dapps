import { cn } from "@bleu.builders/ui";
import type { Token } from "@uniswap/sdk-core";
import { TokenLogo } from "./TokenLogo";

export function TokenLogoWithWeight({
  token,
  weight,
  className,
}: {
  token: Token;
  weight: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl text-md py-1 px-2 gap-1 bg-background text-foreground border border-1 border-muted w-fit",
        className
      )}
    >
      <div className="hidden xsm:flex">{weight * 100}%</div>
      <div>
        <TokenLogo token={token} width={20} height={20} />
      </div>
      <span>{token.symbol}</span>
    </div>
  );
}
