"use client";

import { formatNumber } from "@bleu.builders/ui";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Token } from "@uniswap/sdk-core";
import { useEffect, useMemo, useState } from "react";
import { TokenLogo } from "./TokenLogo";
import { useIFrameContext } from "./context/iframe";
import type { Vault } from "./hooks/useMorphoVaults";
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

interface VaultsDropdownMenuProps {
  onSelect: (vault: Vault) => void;
  vaults: Vault[];
  selectedVault?: Vault;
}

export function VaultsDropdownMenu({
  onSelect,
  vaults,
  selectedVault,
}: VaultsDropdownMenuProps) {
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

  // Filter vaults based on search
  const filteredVaults = useMemo(() => {
    if (!search) return vaults;
    const searchLower = search.toLowerCase();
    return vaults.filter((vault) =>
      vault.name.toLowerCase().includes(searchLower),
    );
  }, [vaults, search]);

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
            className="w-full flex p-2 justify-between rounded-xl space-x-1 items-center text-sm bg-muted shadow-sm text-foreground group hover:bg-primary hover:text-primary-foreground"
            onClick={() => setOpen(true)}
          >
            {selectedVault ? (
              <VaultLogo vault={selectedVault} />
            ) : (
              "Select a vault"
            )}
            <ChevronDownIcon className="size-4" />
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border p-[15px] w-screen h-screen bg-background border-none flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Dialog.Close className="cursor-pointer hover:opacity-50">
                <ArrowLeftIcon className="size-5" />
              </Dialog.Close>
              <Dialog.Title>Select a vault</Dialog.Title>
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
                placeholder="Search name or paste address"
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
                  {displayedVaults.map((vault) => (
                    <CommandItem
                      key={vault.name}
                      value={vault?.name + (vault?.address || "")}
                      onSelect={() => {
                        setOpen(false);
                        onSelect(vault);
                      }}
                      className="group hover:bg-color-paper-darkest hover:text-muted-foreground rounded-md px-2 cursor-pointer flex flex-row gap-2 items-center justify-between"
                    >
                      <div className="flex gap-2">
                        <VaultLogo vault={vault} />
                        <span>{vault.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span>
                          Assets: ${formatNumber(vault.state.totalAssetsUsd, 1)}
                        </span>
                        <span>
                          APY:{" "}
                          {formatNumber(vault.state.dailyNetApy, 2, "percent")}
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

interface VaultLogoProps {
  vault: Vault;
}

export function VaultLogo({ vault }: VaultLogoProps) {
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
            vault.asset.address,
            vault.asset.decimals,
            vault.asset.symbol,
          )
        }
      />
    </div>
  );
}
