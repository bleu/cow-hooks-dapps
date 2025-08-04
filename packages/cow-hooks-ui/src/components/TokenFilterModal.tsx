"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import type { FilterType, MarketTokenInfo } from "../hooks/useMarketFilters";
import { TokenItem } from "./TokenItem";

interface TokenFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterType: FilterType;
  search: string;
  onSearchChange: (search: string) => void;
  tokens: MarketTokenInfo[];
  selectedTokens: Set<string>;
  onTokenToggle: (tokenAddress: string) => void;
  onClearFilters: () => void;
}

export function TokenFilterModal({
  open,
  onOpenChange,
  filterType,
  search,
  onSearchChange,
  tokens,
  selectedTokens,
  onTokenToggle,
  onClearFilters,
}: TokenFilterModalProps) {
  const filteredTokens = tokens.filter((token) =>
    token.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[85vw] max-w-sm max-h-[70vh] bg-color-paper rounded-lg shadow-lg flex flex-col border border-white/10">
          <div className="p-2 flex items-center justify-between">
            <Dialog.Title className="text-sm font-semibold">
              Search for {filterType} asset
            </Dialog.Title>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-color-paper-darker rounded transition-colors"
            >
              <Cross2Icon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input with Clear Button */}
            <div className="p-2">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search for ${filterType} asset`}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-color-paper-darker rounded-lg border-none focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="px-2 py-2 text-xs bg-color-paper-darker hover:bg-primary hover:text-primary-foreground transition-colors rounded"
                  onClick={onClearFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>
            {/* Token List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredTokens.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 px-3">
                  <p className="text-sm">No tokens found</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredTokens.map((token) => {
                    const isSelected = selectedTokens.has(
                      token.address.toLowerCase(),
                    );
                    return (
                      <TokenItem
                        key={token.address}
                        token={token}
                        isSelected={isSelected}
                        onToggle={onTokenToggle}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
