import { calculateProportionalAmounts } from "@balancer/sdk";
import type { IBalance, IPool } from "@bleu/cow-hooks-ui";
import { type Address, formatUnits, parseUnits } from "viem";

export function getTokenPrice({ balance, fiatAmount, token }: IBalance) {
  const baseUnits = Number(balance) / Number(10 ** token.decimals);
  const tokenPrice = fiatAmount / baseUnits;
  return tokenPrice;
}

// Reference: https://github.com/balancer/b-sdk/blob/96ee942dca32633334d56dcdd3f8f36d154ffd9a/src/entities/utils/proportionalAmountsHelpers.ts#L2
export function calculateProportionalTokenAmounts({
  pool,
  poolBalances,
  tokenAddress,
  tokenAmount,
}: {
  poolBalances: IBalance[];
  pool: IPool;
  tokenAddress: Address;
  tokenAmount: string;
}) {
  const referenceToken =
    poolBalances.find(
      (balance) =>
        balance.token.address.toLowerCase() === tokenAddress.toLowerCase()
    ) || poolBalances[0];

  return calculateProportionalAmounts(
    {
      address: pool.address,
      totalShares: formatUnits(
        BigInt(pool.dynamicData.totalShares.toString()),
        pool.decimals
      ) as `${number}`,
      tokens: poolBalances.map((balance) => ({
        address: balance.token.address.toLowerCase() as Address,
        balance: formatUnits(
          BigInt(balance.balance.toString()),
          balance.token.decimals
        ) as `${number}`,
        decimals: balance.token.decimals,
      })),
    },
    {
      address: referenceToken.token.address.toLowerCase() as Address,
      decimals: referenceToken.token.decimals,
      rawAmount: parseUnits(tokenAmount, referenceToken.token.decimals),
    }
  );
}

export function updateTokenBalanceAfterSwap({
  userBalance,
  tokenAddress,
  tokenDecimals,
  sellAmount,
  buyAmount,
  tokenBuyAddress,
  tokenSellAddress,
}: {
  userBalance: `${number}`;
  tokenAddress: Address;
  tokenDecimals: number;
  sellAmount: `${number}`;
  buyAmount: `${number}`;
  tokenBuyAddress: Address;
  tokenSellAddress: Address;
}): `${number}` {
  const balance = parseUnits(userBalance, tokenDecimals) || BigInt(0);

  if (
    tokenAddress.toLowerCase() === tokenSellAddress.toLowerCase() &&
    sellAmount
  ) {
    return formatUnits(
      balance - parseUnits(sellAmount, tokenDecimals),
      tokenDecimals
    ) as `${number}`;
  }

  if (
    tokenAddress.toLowerCase() === tokenBuyAddress.toLowerCase() &&
    buyAmount
  ) {
    return formatUnits(
      balance + parseUnits(buyAmount, tokenDecimals),
      tokenDecimals
    ) as `${number}`;
  }

  return formatUnits(balance, tokenDecimals) as `${number}`;
}
