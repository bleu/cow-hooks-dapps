import { Token } from "@uniswap/sdk-core";
import { TokenLogo } from "../TokenLogo";
import { useIFrameContext } from "../context";

export interface AssetProps {
  address: string;
  decimals: number;
  symbol: string;
}

export function AssetLogo({
  asset,
  size = 20,
}: {
  asset: AssetProps;
  size?: number;
}) {
  const { context } = useIFrameContext();

  if (!context) return null;

  return (
    <div className="flex flex-row gap-1">
      <TokenLogo
        className="group-hover:bg-primary group-hover:text-primary-foreground"
        width={size}
        height={size}
        token={
          new Token(
            context.chainId,
            asset.address,
            asset.decimals,
            asset.symbol,
          )
        }
      />
    </div>
  );
}
