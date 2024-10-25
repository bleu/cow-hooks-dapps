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
  const referenceToken = poolBalances.find(
    (balance) =>
      balance.token.address.toLowerCase() === tokenAddress.toLowerCase(),
  );

  if (!referenceToken) {
    throw new Error("Token not found in pool balances");
  }

  return calculateProportionalAmounts(
    {
      address: pool.address,
      totalShares: formatUnits(
        BigInt(pool.dynamicData.totalShares.toString()),
        pool.decimals,
      ) as `${number}`,
      tokens: poolBalances.map((balance) => ({
        address: balance.token.address.toLowerCase() as Address,
        balance: formatUnits(
          BigInt(balance.balance.toString()),
          balance.token.decimals,
        ) as `${number}`,
        decimals: balance.token.decimals,
      })),
    },
    {
      address: referenceToken.token.address.toLowerCase() as Address,
      decimals: referenceToken.token.decimals,
      rawAmount: parseUnits(tokenAmount, referenceToken.token.decimals),
    },
  );
}
