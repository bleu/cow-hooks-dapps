"use client";

import {
  cn,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { ArrowTopRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { IPool } from "./types";
import { BalancerChainName } from "@bleu/utils";
import { useIFrameContext } from "./context/iframe";
import { TokenLogoWithWeight } from "./TokenLogoWithWeight";
import { Token } from "@uniswap/sdk-core";

export function PoolsDropdownMenu({
  onSelect,
  pools,
  PoolItemInfo,
  selectedPool,
}: {
  onSelect: (pool: IPool) => void;
  pools: IPool[];
  PoolItemInfo: React.ComponentType<{ pool: IPool }>;
  selectedPool?: IPool;
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "w-full flex p-2 justify-between rounded-xl space-x-1 items-center text-sm bg-background disabled:bg-foreground/10 bg-muted text-foreground group",
            selectedPool
              ? "bg-background shadow-sm text-foreground hover:bg-muted hover:text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-color-primary-lighter"
          )}
          onClick={() => setOpen(true)}
        >
          {selectedPool ? <PoolLogo pool={selectedPool} /> : "Select a pool"}
          <ChevronDownIcon className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="w-[440px] max-h-[250px] overflow-y-auto bg-background rounded-xl">
          <Command
            filter={(value: string, search: string) => {
              setSearch(search);
              if (!search) return 1;
              const regex = new RegExp(search, "i");
              return Number(regex.test(value));
            }}
            value={search}
          >
            <CommandInput />
            <CommandList>
              <CommandEmpty>No results found</CommandEmpty>
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
                  className="group hover:bg-muted hover:text-muted-foreground rounded-md px-2 cursor-pointer flex flex-col gap-1 items-start"
                >
                  <PoolLogo pool={pool} />
                  <PoolItemInfo pool={pool} />
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

export function PoolLogo({ pool }: { pool: IPool }) {
  const { context } = useIFrameContext();

  if (!context) return null;

  return (
    <div className="flex flex-row gap-1">
      {pool.allTokens.map((token) => (
        <TokenLogoWithWeight
          className="group-hover:bg-primary group-hover:text-primary-foreground"
          key={`${pool.id}-${token.address}`}
          token={
            new Token(
              context.chainId,
              token.address,
              token.decimals,
              token.symbol
            )
          }
          weight={token.weight}
        />
      ))}
    </div>
  );
}
