"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@bleu/ui";
import { formatUnits } from "ethers/lib/utils";
import { IBalance } from "./types";
import { Spinner } from "./Spinner";
import { TokenInfo } from "./TokenInfo";
import { TokenAmount } from "./TokenAmount";
import { useMemo } from "react";

// This component expects that labels and balances are in the same order.
// For example, if labels = ["Pool Balance", "Withdraw Balance"],
// then balances should be an array of arrays where each inner array has two elements.
// TODO: Improve the component interface to make it more clear
export function BalancesPreview({
  labels,
  isLoading,
  balancesList,
}: {
  labels: string[];
  isLoading: boolean;
  balancesList?: IBalance[][];
}) {
  if (isLoading) return <Spinner />;

  const tokenBalancesList = useMemo(
    () =>
      labels.map((label, index) =>
        balancesList?.map((balances) => balances[index])
      ),
    [balancesList, labels]
  );

  if (!balancesList && isLoading) return <Spinner />;

  return (
    <div className="p-1 border-muted border-2 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Token</TableHead>
            {labels.map((label) => (
              <TableHead key={`label-${label}`}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokenBalancesList.map((balances) => {
            if (!balances) return <></>;
            return (
              <BalancePreview
                key={`pool-balance-${balances?.[0].token.address}`}
                balances={balances}
                labels={labels}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function BalancePreview({
  balances,
  labels,
}: {
  balances: IBalance[];
  labels: string[];
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell>
        <TokenInfo token={balances[0].token} showExplorerLink={true} />
      </TableCell>
      {balances.map((poolBalance, index) => (
        <TableCell key={`${labels[index]}-${poolBalance.token.address}`}>
          <TokenAmount
            token={poolBalance.token}
            balance={Number(
              formatUnits(poolBalance.balance, poolBalance.token.decimals)
            )}
            fiatValue={poolBalance.fiatAmount}
            className="items-start"
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
