"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  formatNumber,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { ArrowTopRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { IPool } from "./types";
import { BalancerChainName } from "@bleu/utils";

export function PoolsDropdownMenu({
  onSelect,
  pools,
  PoolComponent,
  loading,
  poolsEmptyMessage,
}: {
  onSelect: (pool: IPool) => void;
  pools: IPool[];
  loading?: boolean;
  PoolComponent: React.ComponentType<{ pool: IPool }>;
  poolsEmptyMessage: string;
}) {
  const [selectedPool, setSelectedPool] = useState<IPool>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const poolLink = useMemo(() => {
    if (!selectedPool) return;
    const chainName =
      selectedPool?.chain === BalancerChainName[1]
        ? "ethereum"
        : selectedPool?.chain.toLowerCase();
    const baseUrl =
      selectedPool?.chain === BalancerChainName[11155111]
        ? "https://test.balancer.fi/pools"
        : "https://balancer.fi/pools";
    return `${baseUrl}/${chainName}/cow/${selectedPool?.id.toLowerCase()}`;
  }, [selectedPool]);

  const disabled = useMemo(() => {
    return !pools || pools.length === 0;
  }, [pools]);

  const triggerMessage = useMemo(() => {
    if (loading) return "Loading...";
    if (disabled) return poolsEmptyMessage;
    return selectedPool?.symbol || "Liquidity pool";
  }, [loading, disabled, selectedPool]);

  return (
    <div className="flex flex-col gap-1 py-2">
      <Label className="px-1 mb-1">Choose liquidity pool</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="w-full flex p-2 justify-between rounded-md space-x-1 items-center text-sm bg-background disabled:bg-foreground/10 bg-muted text-foreground rounded-md"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {selectedPool ? (
            <PoolComponent pool={selectedPool} />
          ) : (
            triggerMessage
          )}
          <ChevronDownIcon className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="w-[440px] max-h-[250px] overflow-y-auto bg-background">
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
            <CommandInput className="bg-background text-foreground pb-2" />
            <CommandList className="w-full">
              <CommandEmpty className="w-full">No results found</CommandEmpty>
              {pools?.map((pool) => (
                <CommandItem
                  key={pool.id}
                  value={
                    pool?.symbol +
                    (pool?.allTokens.map((token) => token.symbol).join("") ||
                      "")
                  }
                  onSelect={() => {
                    setOpen(false);
                    onSelect(pool);
                    setSelectedPool(pool);
                  }}
                  className="hover:bg-primary hover:text-primary-foreground rounded-md px-2"
                >
                  <PoolComponent pool={pool} />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
        {poolLink && (
          <a
            className="inline-flex items-center transition-colors text-primary underline-offset-4 hover:underline justify-start p-0 px-1 m-0 text-xs h-fit"
            href={poolLink}
            target="_blank"
          >
            Check pool details
            <ArrowTopRightIcon className="size-4 shrink-0" />
          </a>
        )}
      </Popover>
    </div>
  );
}
