import Image from "next/image";
import type { MarketTokenInfo } from "../hooks/useMarketFilters";

interface TokenItemProps {
  token: MarketTokenInfo;
  isSelected: boolean;
  onToggle: (tokenAddress: string) => void;
}

export function TokenItem({ token, isSelected, onToggle }: TokenItemProps) {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded hover:bg-color-paper-darker cursor-pointer"
      onClick={() => onToggle(token.address)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(token.address)}
        className="w-3 h-3 text-primary bg-color-paper-darker border-border rounded focus:ring-primary focus:ring-1"
      />
      {token.logoURI ? (
        <Image
          src={token.logoURI}
          alt={token.symbol}
          width={20}
          height={20}
          className="size-5 rounded-full object-cover"
          onError={(e) => {
            // Fallback to generic token logo if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/assets/generic-token-logo.png";
          }}
        />
      ) : (
        <Image
          src="/assets/generic-token-logo.png"
          alt={token?.symbol ?? "Generic Token Logo"}
          width={20}
          height={20}
          className="size-5 rounded-full object-cover"
        />
      )}
      <span className="text-sm">{token?.symbol}</span>
    </div>
  );
}
