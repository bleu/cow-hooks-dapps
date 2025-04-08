"use client";

import { formatNumber } from "@bleu.builders/ui";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Token } from "@uniswap/sdk-core";
import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { TokenLogo } from "./TokenLogo";
import { useIFrameContext } from "./context/iframe";
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
  selectedMarket?: MorphoMarket;
}

export function MarketsDropdownMenu({
  onSelect,
  markets,
  selectedMarket,
}: MarketsDropdownMenuProps) {
  const [open, setOpen] = useState(false);
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
          <Dialog.Trigger
            className="w-full flex p-2 justify-between rounded-xl space-x-1 items-center text-sm bg-muted shadow-sm text-foreground group hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={() => setOpen(true)}
          >
            {selectedMarket ? (
              <div className="group rounded-md px-2 cursor-pointer flex flex-row gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <span>Collateral:</span>
                  <AssetLogo asset={selectedMarket.collateralAsset} />
                  <span>{selectedMarket.collateralAsset.symbol}</span>
                </div>
                <div className="flex gap-2">
                  <span>Loan:</span>
                  <AssetLogo asset={selectedMarket.loanAsset} />
                  <span>{selectedMarket.loanAsset.symbol}</span>
                </div>
                <div className="flex gap-2">
                  <span>LLTV:</span>
                  <span>
                    {formatNumber(
                      Number(selectedMarket.lltv) /
                        10 ** selectedMarket.collateralAsset.decimals,
                      0,
                      "percent",
                    )}
                  </span>
                </div>
              </div>
            ) : (
              "Select a market"
            )}
            <ChevronDownIcon className="size-4" />
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border p-[15px] w-screen h-screen bg-background border-none flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Dialog.Close className="cursor-pointer hover:opacity-50 transition-all">
                <ArrowLeftIcon className="size-5" />
              </Dialog.Close>
              <Dialog.Title>Select a market</Dialog.Title>
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
                className="bg-muted rounded-xl placeholder:text-muted-foreground/50 text-md px-2 py-2 mb-5"
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
                      className="w-full hover:bg-color-paper-darkest hover:text-muted-foreground rounded-md px-2 cursor-pointer grid grid-cols-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <AssetLogo asset={market.collateralAsset} />
                          <span>{market.collateralAsset.symbol}</span>
                        </div>
                        {market?.position && (
                          <span>
                            {formatNumber(
                              formatUnits(
                                market.position.collateral,
                                market.collateralAsset.decimals,
                              ),
                              4,
                              "decimal",
                              "standard",
                              0.0001,
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2">
                          <AssetLogo asset={market.loanAsset} />
                          <span>{market.loanAsset.symbol}</span>
                        </div>
                        {market?.position && (
                          <span>
                            {formatNumber(
                              formatUnits(
                                market.position.borrowAssets,
                                market.loanAsset.decimals,
                              ),
                              4,
                              "decimal",
                              "standard",
                              0.0001,
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span>
                          {formatNumber(
                            Number(market.lltv.toString().slice(0, 3)) / 1000,
                            1,
                            "percent",
                          )}
                        </span>
                      </div>
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

interface AssetProps {
  address: string;
  decimals: number;
  symbol: string;
}

export function AssetLogo({ asset }: { asset: AssetProps }) {
  const { context } = useIFrameContext();

  if (!context) return null;

  return (
    <div className="flex flex-row gap-1">
      <TokenLogo
        className="group-hover:bg-primary group-hover:text-primary-foreground"
        width={20}
        height={20}
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
