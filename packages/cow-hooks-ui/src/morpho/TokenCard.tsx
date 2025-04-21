import { cn } from "@bleu.builders/ui";
import { AssetLogo, type AssetProps } from "./AssetLogo";

export const TokenCard = ({
  asset,
  className,
}: {
  asset: AssetProps;
  className?: string;
}) => {
  const parsedSymbol =
    asset.symbol.length > 6 ? `${asset.symbol.slice(0, 4)}...` : asset.symbol;

  return (
    <div
      className={cn(
        "flex items-center justify-start w-fit gap-1 bg-color-paper py-1 px-2 shadow-md rounded-full",
        className,
      )}
    >
      <AssetLogo asset={asset} />
      <span className="text-sm font-semibold">{parsedSymbol}</span>
    </div>
  );
};
