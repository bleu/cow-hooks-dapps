"use client";

import { cn } from "@bleu.builders/ui";
import { BalancerChainName } from "@bleu/utils";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeftIcon,
  ArrowTopRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { Token } from "@uniswap/sdk-core";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { type Address, isAddress } from "viem";
import { TokenLogoWithWeight } from "./TokenLogoWithWeight";
import { useIFrameContext } from "./context/iframe";
import type { IPool } from "./types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { Spinner } from "./ui/Spinner";
import { InfoTooltip } from "./ui/TooltipBase";
import { SupportedChainId } from "@cowprotocol/cow-sdk";

const ITEMS_PER_PAGE = 20;

interface PoolsDropdownMenuProps {
  onSelect: (pool: IPool) => void;
  pools: IPool[];
  PoolItemInfo: React.ComponentType<{ pool: IPool }>;
  selectedPool?: IPool;
  isCheckDetailsCentered?: boolean;
  tooltipText?: string;
  fetchNewPoolCallback?: (poolAddress: Address) => Promise<IPool | undefined>;
  onFetchNewPoolSuccess?: (pool: IPool | undefined) => void;
  getPoolLink: (chainId: SupportedChainId, selectedPool: IPool) => string;
}

export function PoolsDropdownMenu({
  onSelect,
  pools,
  PoolItemInfo,
  selectedPool,
  isCheckDetailsCentered = true,
  tooltipText,
  fetchNewPoolCallback = (_poolAddress: Address) => Promise.resolve(undefined),
  onFetchNewPoolSuccess = () => {},
  getPoolLink,
}: PoolsDropdownMenuProps) {
  const { context } = useIFrameContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typedAddress, setTypedAddress] = useState("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset display count when dialog opens/closes or search changes
  // biome-ignore lint:
  useEffect(() => {
    if (!open) {
      setDisplayCount(ITEMS_PER_PAGE);
    }
  }, [open, search]);

  const poolLink = useMemo(() => {
    if (!selectedPool || !context?.chainId) return;
    return getPoolLink(context.chainId, selectedPool);
  }, [selectedPool, context]);

  // Filter pools based on search
  const filteredPools = useMemo(() => {
    if (!search) return pools;
    const searchLower = search.toLowerCase();
    return pools.filter(
      (pool) =>
        pool.symbol?.toLowerCase().includes(searchLower) ||
        pool.address?.toLowerCase().includes(searchLower) ||
        pool.allTokens.some((token) =>
          token.symbol?.toLowerCase().includes(searchLower),
        ),
    );
  }, [pools, search]);

  const displayedPools = useMemo(
    () => filteredPools.slice(0, displayCount),
    [filteredPools, displayCount],
  );

  const allPoolAddressesLowerCase = useMemo(
    () => pools.map((pool) => pool.address?.toLowerCase()),
    [pools],
  );

  const { isLoading: isLoadingNewPool, error: errorNewPool } = useSWR<
    IPool | undefined
  >(
    isAddress(typedAddress) && !allPoolAddressesLowerCase.includes(typedAddress)
      ? typedAddress
      : null,
    fetchNewPoolCallback,
    {
      revalidateOnFocus: false,
      onSuccess: onFetchNewPoolSuccess,
    },
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
      displayCount < filteredPools.length &&
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
    setTypedAddress(value.trim());
    // If the value is empty (like when selecting all and deleting), reset the search
    if (!value) {
      setSearch("");
    }
  };

  const CommandEmptyContent = () => {
    if (isLoadingNewPool)
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner size="lg" />
          <span>Loading new pool</span>
        </div>
      );
    if (errorNewPool)
      return <span className="text-destructive">Error loading new pool.</span>;

    return (
      <>
        <p>No results found.</p>
        <p>Try placing your LP token address on the search bar.</p>
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
            {selectedPool ? <PoolLogo pool={selectedPool} /> : "Select a pool"}
            <ChevronDownIcon className="size-4" />
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border p-[15px] w-screen h-screen bg-background border-none flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Dialog.Close className="cursor-pointer hover:opacity-50">
                <ArrowLeftIcon className="size-5" />
              </Dialog.Close>
              <Dialog.Title>Select a pool</Dialog.Title>
              {tooltipText && <InfoTooltip text={tooltipText} />}
            </div>
            <Command
              filter={(value: string, search: string) => {
                setSearch(search);
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
                value={typedAddress}
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
                  {displayedPools.map((pool) => (
                    <CommandItem
                      key={pool.id}
                      value={
                        pool?.symbol +
                        (pool?.allTokens
                          .map((token) => token.symbol)
                          .join("") || "") +
                        (pool?.address || "")
                      }
                      onSelect={() => {
                        setOpen(false);
                        onSelect(pool);
                      }}
                      className="group hover:bg-color-paper-darkest hover:text-muted-foreground rounded-md px-2 cursor-pointer flex flex-row gap-1 items-center justify-between"
                    >
                      <PoolLogo pool={pool} />
                      <div className="w-2/5">
                        <PoolItemInfo pool={pool} />
                      </div>
                    </CommandItem>
                  ))}
                  {!search && displayedPools.length < filteredPools.length && (
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
        {poolLink && (
          <a
            className={cn(
              "inline-flex justify-start transition-colors text-primary underline-offset-4 hover:underline p-0 m-0 text-xs h-fit w-full",
              { "justify-center": isCheckDetailsCentered },
            )}
            href={poolLink}
            target="_blank"
            rel="noreferrer"
          >
            Check pool details
            <ArrowTopRightIcon className="size-4 shrink-0" />
          </a>
        )}
      </Dialog.Root>
    </div>
  );
}

interface PoolLogoProps {
  pool: IPool;
}

export function PoolLogo({ pool }: PoolLogoProps) {
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
              token.symbol,
            )
          }
          weight={token.weight}
        />
      ))}
    </div>
  );
}
