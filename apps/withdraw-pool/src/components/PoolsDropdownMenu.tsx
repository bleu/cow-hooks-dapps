"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { useUserPools } from "#/hooks/useUserPools";
import type { IMinimalPool } from "#/types";
import { SupportedChainId } from "@cowprotocol/cow-sdk";

export function PoolsDropdownMenu({
  chainId,
  account,
  onSelect,
  selectedPoolId,
}: {
  chainId: SupportedChainId;
  account?: string;
  onSelect: (pool: IMinimalPool) => void;
  selectedPoolId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: pools } = useUserPools(chainId, account);
  const [search, setSearch] = useState("");

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === selectedPoolId),
    [pools, selectedPoolId]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <div className="flex flex-col">
          <div
            className="flex p-2 justify-between rounded-md space-x-1 bg-muted text-foreground items-center text-sm"
            onClick={() => setOpen(true)}
          >
            {selectedPool ? selectedPool.symbol : "Select token"}
            <ChevronDownIcon className="size-4 shrink-0" />
          </div>
        </div>
      </PopoverTrigger>
      {/* for some reason w-full wasn't working here, so I hardcoded the pixel size */}
      <PopoverContent className="w-[410px] bg-background">
        <Command
          className="w-full"
          filter={(value: string, search: string) => {
            setSearch(search);
            if (!search) return 1;
            const regex = new RegExp(search, "i");
            return Number(regex.test(value));
          }}
          value={search}
        >
          <CommandInput className="text-black pb-2" />
          <CommandList className="w-full">
            <CommandEmpty className="w-full">No results found</CommandEmpty>
            {pools?.map((pool) => (
              <CommandItem
                key={pool.id}
                value={
                  pool?.symbol +
                  (pool?.allTokens.map((token) => token.symbol).join("") || "")
                }
                onSelect={() => {
                  setOpen(false);
                  onSelect(pool);
                }}
                className="hover:bg-primary hover:text-primary-foreground rounded-md px-2"
              >
                {pool.symbol}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
