"use client";
import { BalancerChainName } from "@bleu/utils";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeftIcon,
  ArrowTopRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { Token } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
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
    <div className="flex w-full flex-col items-center gap-2">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          className={
            "w-full flex p-2 justify-between rounded-xl space-x-1 items-center text-sm bg-muted shadow-sm text-foreground group hover:bg-primary hover:text-primary-foreground"
          }
          onClick={() => setOpen(true)}
        >
          {selectedPool ? <PoolLogo pool={selectedPool} /> : "Select a pool"}
          <ChevronDownIcon className="size-4" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] border bg-background p-[15px] w-screen h-screen bg-background border-none flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Dialog.Close className="cursor-pointer hover:opacity-50">
                <ArrowLeftIcon className="size-5" />
              </Dialog.Close>
              <span>Select a pool</span>
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
                className="bg-muted mb-2 rounded-xl placeholder:text-muted-foreground/50 text-md px-2 py-2 mb-5"
                placeholder="Search name or paste address"
              />
              <div className="w-full h-[1px] bg-muted my-1" />
              <CommandList className="overflow-y-auto">
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
                    className="group hover:bg-color-paper-darkest hover:text-muted-foreground rounded-md px-2 cursor-pointer flex flex-row gap-1 items-center justify-between"
                  >
                    <PoolLogo pool={pool} />
                    <PoolItemInfo pool={pool} />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
        {poolLink && (
          <a
            className="inline-flex items-center transition-colors text-primary underline-offset-4 hover:underline justify-start p-0 px-1 m-0 text-xs h-fit w-fit"
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
