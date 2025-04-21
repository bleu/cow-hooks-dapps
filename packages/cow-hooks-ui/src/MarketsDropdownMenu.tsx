"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";

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
}

export function MarketsDropdownMenu({
  onSelect,
  markets,
}: MarketsDropdownMenuProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
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

  // Filter markets based on search
  const filteredVaults = useMemo(() => {
    if (!search) return markets;
    const searchLower = search.toLowerCase();
    return markets.filter((market) =>
      (market.collateralAsset.symbol + market.loanAsset.symbol)
        .toLowerCase()
        .includes(searchLower),
    );
  }, [markets, search]);

  const displayedVaults = useMemo(
    () => filteredVaults.slice(0, displayCount),
    [filteredVaults, displayCount],
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
      displayCount < filteredVaults.length &&
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
            <span className="font-bold text-lg">Choose Amounts</span>
            <div className="flex gap-1 justify-center items-center cursor-pointer opacity-70 hover:opacity-90 transition-all">
              <span className="text-sm underline">Change market</span>
              <UpdateIcon className="w-3 h-3" />
            </div>
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border w-screen h-screen bg-background border-none flex flex-col gap-2">
            <div className="flex items-center gap-2 mx-4 mt-4">
              <Dialog.Title>Select market</Dialog.Title>
            </div>
            <Command
              filter={(value: string, search: string) => {
                if (!search) return 1;
                const regex = new RegExp(search, "i");
                return Number(regex.test(value));
              }}
              value={search}
            >
              <CommandInput
                className="bg-muted rounded-xl placeholder:text-muted-foreground/50 text-md mx-4 px-2 py-2 mb-4"
                placeholder="Search token symbols"
                onValueChange={handleInputChange}
                value={search}
              />
              <div className="w-full h-[1px] bg-muted my-1" />
              <CommandList
                className="overflow-y-auto max-h-[60vh]"
                onScroll={handleScroll}
              >
                <CommandEmpty>
                  <CommandEmptyContent />
                </CommandEmpty>
                <CommandGroup>
                  {displayedVaults.map((market) => (
                    <CommandItem
                      key={market.uniqueKey}
                      value={
                        market?.collateralAsset.symbol +
                        market?.loanAsset.symbol
                      }
                      onSelect={() => {
                        setOpen(false);
                        onSelect(market);
                      }}
                      className="w-full"
                    >
                      <MorphoMarketCard market={market} />
                    </CommandItem>
                  ))}
                  {!search &&
                    displayedVaults.length < filteredVaults.length && (
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
