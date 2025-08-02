import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import type { FilterType } from "../hooks/useMarketFilters";

interface FilterButtonProps {
  type: FilterType;
  label: string;
  selectedTokens: Set<string>;
  onFilterClick: (type: FilterType) => void;
  getFilterLabel: (type: FilterType) => string | null;
}

export function FilterButton({
  type,
  label,
  selectedTokens,
  onFilterClick,
  getFilterLabel,
}: FilterButtonProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <button
        type="button"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-color-paper-darker/60 hover:bg-color-paper-darker transition-colors"
        onClick={() => onFilterClick(type)}
      >
        <HamburgerMenuIcon className="w-3 h-3" />
        <span>{getFilterLabel(type)}</span>
        {selectedTokens.size > 1 && (
          <span className="bg-primary text-primary-foreground text-xs px-1 rounded-full min-w-[16px] text-center">
            {selectedTokens.size}
          </span>
        )}
      </button>
    </div>
  );
}
