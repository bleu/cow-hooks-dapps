"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MagnifyingGlassIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { FilterButton, TokenFilterModal } from "./components";
import {
  FilterType,
  mapFilterTypeToTokenType,
  useInfiniteScroll,
  useMarketFilters,
} from "./hooks";
import { MorphoMarketCard } from "./morpho/MorphoMarketCard";
import type { MorphoMarket } from "./types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { Spinner } from "./ui/Spinner";

interface MarketsDropdownMenuProps {
  onSelect: (market: MorphoMarket) => void;
  markets: MorphoMarket[];
  market?: MorphoMarket;
}

export function MarketsDropdownMenu({
  onSelect,
  market,
  markets,
}: MarketsDropdownMenuProps) {
  const [open, setOpen] = useState(!market);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const {
    filterType,
    setFilterType,
    selectedCollateralTokens,
    selectedLoanTokens,
    search,
    setSearch,
    collateralTokens,
    loanTokens,
    filteredMarkets,
    handleTokenToggle,
    clearFilters,
    getFilterLabel,
    resetSearch,
  } = useMarketFilters(markets);

  const {
    displayedItems: displayedVaults,
    isLoadingMore,
    handleScroll,
    resetPagination,
  } = useInfiniteScroll(filteredMarkets);

  useEffect(() => {
    if (!open) {
      resetPagination();
    }
  }, [open, resetPagination]);

  useEffect(() => {
    if (!open) {
      resetSearch();
    }
  }, [open, resetSearch]);

  const CommandEmptyContent = () => {
    return (
      <>
        <p>No results found.</p>
      </>
    );
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <div className="flex flex-row gap-1 w-full justify-between">
          <Dialog.Trigger className="w-full flex justify-between items-center cursor-default">
            <span className="font-bold text-sm xsm:text-lg">
              Choose Amounts
            </span>
            <div className="flex gap-1 justify-center items-center cursor-pointer opacity-70 hover:opacity-90 transition-all">
              <span className="text-xxs underline">Change market</span>
              <UpdateIcon className="w-3 h-3" />
            </div>
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border w-screen h-screen bg-background border-none flex flex-col">
            <div className="flex items-center justify-between m-4">
              <Dialog.Title>Select market</Dialog.Title>
              <div className="flex gap-3 mr-1">
                <FilterButton
                  type={FilterType.COLLATERAL}
                  label="Collateral"
                  selectedTokens={selectedCollateralTokens}
                  onFilterClick={(type) => {
                    setFilterType(type);
                    setFilterModalOpen(true);
                  }}
                  getFilterLabel={getFilterLabel}
                />
                <FilterButton
                  type={FilterType.LOAN}
                  label="Loan"
                  selectedTokens={selectedLoanTokens}
                  onFilterClick={(type) => {
                    setFilterType(type);
                    setFilterModalOpen(true);
                  }}
                  getFilterLabel={getFilterLabel}
                />
              </div>
            </div>
            {/* Search Input */}
            <div className="px-4 mb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search symbols (e.g. 'WETH USDC')"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-color-paper-darker rounded-lg border-none focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            {/* Market List with Command */}
            <div className="flex-1 min-h-0">
              <Command>
                <CommandList
                  className="overflow-y-auto h-full px-4 xsm:px-0"
                  onScroll={handleScroll}
                >
                  <CommandEmpty>
                    <CommandEmptyContent />
                  </CommandEmpty>
                  <CommandGroup className="px-0 xsm:px-1">
                    {displayedVaults.map((market) => (
                      <CommandItem
                        key={market.uniqueKey}
                        value={market.uniqueKey}
                        onSelect={() => {
                          setOpen(false);
                          onSelect(market);
                        }}
                        className="w-full px-0 py-1 xsm:px-2"
                      >
                        <MorphoMarketCard market={market} />
                      </CommandItem>
                    ))}
                    {isLoadingMore && (
                      <CommandItem
                        value=""
                        className="justify-center"
                        onSelect={() => {}}
                      >
                        <Spinner size="sm" />
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <TokenFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        filterType={filterType}
        search={search}
        onSearchChange={setSearch}
        tokens={
          filterType === FilterType.COLLATERAL ? collateralTokens : loanTokens
        }
        selectedTokens={
          filterType === FilterType.COLLATERAL
            ? selectedCollateralTokens
            : selectedLoanTokens
        }
        onTokenToggle={(tokenAddress) =>
          handleTokenToggle(tokenAddress, mapFilterTypeToTokenType(filterType))
        }
        onClearFilters={clearFilters}
      />
    </div>
  );
}
