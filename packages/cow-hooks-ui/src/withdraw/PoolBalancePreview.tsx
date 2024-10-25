"use client";

import { multiplyValueByPct } from "@bleu/utils";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { formatUnits } from "viem";
import { TokenAmount } from "../TokenAmount";
import { TokenInfo } from "../TokenInfo";
import type { IBalance } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { InfoTooltip } from "../ui/TooltipBase";

export function PoolBalancesPreview({
  poolBalances,
}: {
  poolBalances: IBalance[];
}) {
  const { control } = useFormContext();

  const { withdrawPct } = useWatch({ control });

  const withdrawBalance = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct).toString(),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
    }));
  }, [poolBalances, withdrawPct]);

  return (
    <div className="border border-color-text/25 rounded-2xl">
      <Table className="overflow-grow">
        <TableHeader className="[&_tr]:border-b border-color-text/25 dark:[&_tr]:border-b-1">
          <TableRow className="hover:bg-transparent border-color-text/25">
            <TableHead>
              <span className="font-normal text-sm">Token</span>
            </TableHead>
            <TableHead>
              <span className="flex gap-1 text-sm font-normal">
                Wallet balance
                <InfoTooltip text="Withdraw of staked balances is not supported" />
              </span>
            </TableHead>
            <TableHead>
              <span className="text-sm font-normal">Withdraw balance</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {poolBalances.map((balance, index) => {
            return (
              <TableRow
                className="hover:bg-transparent border-none"
                key={balance.token.address}
              >
                <TableCell>
                  <TokenInfo token={balance.token} showExplorerLink={true} />
                </TableCell>
                <TableCell>
                  <TokenAmount
                    token={balance.token}
                    balance={Number(
                      formatUnits(
                        BigInt(balance.balance.toString()),
                        balance.token.decimals,
                      ),
                    )}
                    fiatValue={balance.fiatAmount}
                  />
                </TableCell>
                <TableCell>
                  <TokenAmount
                    token={balance.token}
                    balance={Number(
                      formatUnits(
                        BigInt(withdrawBalance[index].balance.toString()),
                        balance.token.decimals,
                      ),
                    )}
                    fiatValue={balance.fiatAmount}
                    className="font-semibold"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
