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
import { useMemo, useState } from "react";
import useSWR from "swr";
import { type Address, isAddress } from "viem";
import { TokenLogoWithWeight } from "./TokenLogoWithWeight";
import { useIFrameContext } from "./context/iframe";
import type { IPool } from "./types";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { Spinner } from "./ui/Spinner";
import { InfoTooltip } from "./ui/TooltipBase";

export function PoolsDropdownMenu({
  onSelect,
  pools,
  PoolItemInfo,
  selectedPool,
  isCheckDetailsCentered = true,
  tooltipText,
  fetchNewPoolCallback,
}: {
  onSelect: (pool: IPool) => void;
  pools: IPool[];
  PoolItemInfo: React.ComponentType<{ pool: IPool }>;
  selectedPool?: IPool;
  isCheckDetailsCentered: boolean;
  tooltipText?: string;
  fetchNewPoolCallback?: (poolAddress: Address) => Promise<IPool>;
}) {
  const [fetchedPool, setFetchedPool] = useState<IPool | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typedAddress, setTypedAddress] = useState("");

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

  const swrConfig = {
    revalidateOnFocus: false,
    onSuccess: (data: IPool) => {
      // Add new pool on the list (avoid repeating or 0-balance pools)
      if (
        !pools.map((pool) => pool.address).includes(data.address) &&
        data.userBalance.walletBalance.toString() !== "0"
      )
        setFetchedPool(data);
    },
  };

  const allPools = [...pools, fetchedPool].filter((pool) => !!pool);

  const {
    data: newPool,
    isLoading: isLoadingNewPool,
    error: errorNewPool,
  } = fetchNewPoolCallback
    ? useSWR<IPool>(
        isAddress(typedAddress) ? typedAddress : null,
        fetchNewPoolCallback,
        swrConfig,
      )
    : { data: undefined, isLoading: undefined, error: undefined };

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

    if (newPool?.userBalance.walletBalance.toString() === "0")
      return (
        <span className="text-destructive">
          You don't have any LP tokens on this pool
        </span>
      );
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
            className={
              "w-full flex p-2 justify-between rounded-xl space-x-1 items-center text-sm bg-muted shadow-sm text-foreground group hover:bg-primary hover:text-primary-foreground"
            }
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
                onValueChange={(e) => setTypedAddress(e)}
              />
              <div className="w-full h-[1px] bg-muted my-1" />
              <CommandList className="overflow-y-auto">
                <CommandEmpty>
                  <CommandEmptyContent />
                </CommandEmpty>
                {allPools.map((pool) => (
                  <CommandItem
                    key={pool.id}
                    value={
                      pool?.symbol +
                      (pool?.allTokens.map((token) => token.symbol).join("") ||
                        "") +
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
              token.symbol,
            )
          }
          weight={token.weight}
        />
      ))}
    </div>
  );
}
