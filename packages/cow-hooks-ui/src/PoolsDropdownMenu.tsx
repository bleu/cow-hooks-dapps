"use client";

import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { ArrowTopRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { Spinner } from "./Spinner";
import { IMinimalPool } from "./types";
import { BalancerChainName } from "@bleu/utils";

export function PoolsDropdownMenu({
  onSelect,
  selectedPool,
  pools,
  loading,
}: {
  onSelect: (pool: IMinimalPool) => void;
  selectedPool?: IMinimalPool;
  pools: IMinimalPool[];
  loading?: boolean;
}) {
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

  return (
    <div className="flex flex-col gap-1 py-2">
      <Label className="px-1">Choose liquidity pool</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full bg-background">
          <div className="flex flex-col">
            <div
              className="flex p-2 justify-between rounded-md space-x-1 bg-muted text-foreground items-center text-sm"
              onClick={() => setOpen(true)}
            >
              {selectedPool?.symbol || "Pool to withdraw"}
              <ChevronDownIcon className="size-4 shrink-0" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[440px] bg-background">
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
              {loading && <Spinner />}
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
                  }}
                  className="hover:bg-primary hover:text-primary-foreground rounded-md px-2"
                >
                  {pool.symbol}
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
            Check the pool details
            <ArrowTopRightIcon className="size-4 shrink-0" />
          </a>
        )}
      </Popover>
    </div>
  );
}