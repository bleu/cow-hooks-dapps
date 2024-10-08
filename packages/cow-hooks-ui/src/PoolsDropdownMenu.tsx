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
import { Spinner } from "./Spinner";
import { IMinimalPool } from "./types";
import { BalancerChainName } from "@bleu/utils";
import { TokenLogo } from "./TokenLogo";
import { Token } from "@uniswap/sdk-core";
import { useIFrameContext } from "./context/iframe";

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

  const disabled = useMemo(() => {
    return !pools || pools.length === 0;
  }, [pools]);

  const triggerMessage = useMemo(() => {
    if (loading) return "Loading pools";
    if (disabled) return "No pools available";
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
          {selectedPool ? <PoolItem pool={selectedPool} /> : triggerMessage}
          <ChevronDownIcon className="size-4" />
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
                  <PoolItem pool={pool} />
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

export function PoolItem({ pool }: { pool: IMinimalPool }) {
  const { context } = useIFrameContext();

  if (!context) return null;

  return (
    <div className="flex flex-row items-center gap-1">
      <span>{pool.symbol.slice(5)}</span>

      {pool.allTokens.map((token) => {
        const tokenObject = new Token(
          context?.chainId,
          token.address,
          token.decimals,
          token.symbol
        );

        return (
          <TokenLogo
            key={`${pool.id}-${token.address}`}
            token={tokenObject}
            width={20}
            height={20}
          />
        );
      })}
      <i>${formatNumber(pool.userBalance.totalBalanceUsd, 2)}</i>
    </div>
  );
}
