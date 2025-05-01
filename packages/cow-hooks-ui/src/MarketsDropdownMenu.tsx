"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MagnifyingGlassIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@bleu.builders/ui";
import { MorphoMarketCard } from "./morpho/MorphoMarketCard";
import type { MorphoMarket } from "./types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { Spinner } from "./ui/Spinner";

const ITEMS_PER_PAGE = 20;

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
  const [search, setSearch] = useState("");
  const [searchRule, setSearchRule] = useState<"all" | "collateral" | "loan">(
    "all",
  );
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset display count when dialog opens/closes or search changes
  // biome-ignore lint:
  useEffect(() => {
    if (!open) {
      setDisplayCount(ITEMS_PER_PAGE);
    }
  }, [open, search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const filterMarket = useCallback(
    (value: string, search: string): number => {
      if (!search) return 1;
      const searchLower = search.toLowerCase();

      const market = markets.find((market) => market.uniqueKey === value);
      if (!market) return 0;

      if (searchRule === "collateral")
        return Number(
          market.collateralAsset.symbol.toLowerCase().includes(searchLower),
        );

      if (searchRule === "loan")
        return Number(
          market.loanAsset.symbol.toLowerCase().includes(searchLower),
        );

      return Number(
        (market.collateralAsset.symbol + market.loanAsset.symbol)
          .toLowerCase()
          .includes(searchLower) ||
          (market.loanAsset.symbol + market.collateralAsset.symbol)
            .toLowerCase()
            .includes(searchLower),
      );
    },
    [markets, searchRule],
  );

  // Filter markets based on search
  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => filterMarket(market.uniqueKey, search));
  }, [search, markets, filterMarket]);

  const displayedVaults = useMemo(
    () => filteredMarkets.slice(0, displayCount),
    [filteredMarkets, displayCount],
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
      displayCount < filteredMarkets.length &&
      !isLoadingMore
    ) {
      setIsLoadingMore(true);
      // Use setTimeout to simulate loading and prevent multiple triggers
      setTimeout(() => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
        setIsLoadingMore(false);
      }, 100);
    }
  };

  const handleInputChange = (value: string) => {
    setSearch(value.trim());
    // If the value is empty (like when selecting all and deleting), reset the search
    if (!value) {
      setSearch("");
    }
  };

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
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border w-screen h-screen bg-background border-none flex flex-col gap-3">
            <div className="flex items-center gap-2 mx-4 mt-4">
              <Dialog.Title>Select market</Dialog.Title>
            </div>
            <Command filter={filterMarket} value={search}>
              <div className="px-4">
                <CommandInput
                  className="flex items-center rounded-2xl mb-2 bg-color-paper-darker"
                  asChild={true}
                >
                  <div className="flex gap-2 items-center justify-start px-3 py-2.5 mt-1 border border-transparent focus-within:ring-2 focus-within:ring-color-primary">
                    <MagnifyingGlassIcon className="w-5 h-5 opacity-60" />
                    <input
                      className="w-full text-sm bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
                      placeholder="Search by asset or symbol"
                      onChange={(e) => handleInputChange(e.target.value)}
                      value={search}
                    />
                  </div>
                </CommandInput>
                {search && (
                  <div className="flex justify-start items-center gap-2 mb-2">
                    <button
                      type="button"
                      className={cn(
                        "bg-color-paper-darker px-3 py-1 rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-all",
                        {
                          "bg-primary text-primary-foreground":
                            searchRule === "all",
                        },
                      )}
                      onClick={() => setSearchRule("all")}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "bg-color-paper-darker px-3 py-1 rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-all",
                        {
                          "bg-primary text-primary-foreground":
                            searchRule === "collateral",
                        },
                      )}
                      onClick={() => setSearchRule("collateral")}
                    >
                      Collateral
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "bg-color-paper-darker px-3 py-1 rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-all",
                        {
                          "bg-primary text-primary-foreground":
                            searchRule === "loan",
                        },
                      )}
                      onClick={() => setSearchRule("loan")}
                    >
                      Loan
                    </button>
                  </div>
                )}
                {search && (
                  <span className="mb-2 opacity-80 text-xs">
                    {filteredMarkets.length} results found for "{search}".
                  </span>
                )}
              </div>

              <CommandList
                className="overflow-y-auto max-h-[60vh] px-4 xsm:px-0"
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
                  {!search &&
                    displayedVaults.length < filteredMarkets.length && (
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
