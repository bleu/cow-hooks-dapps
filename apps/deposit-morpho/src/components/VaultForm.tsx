import { formatNumber } from "@bleu.builders/ui";
import { Token } from "@uniswap/sdk-core";

import {
  ButtonPrimary,
  type HookDappContextAdjusted,
  Info,
  InfoContent,
  TokenAmountInput,
  type Vault,
  useIFrameContext,
  useReadTokenContract,
} from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { DepositMorphoFormData } from "#/contexts/form";

export function VaultForm({ vault }: { vault: Vault }) {
  const { context } = useIFrameContext();

  const { control } = useFormContext<DepositMorphoFormData>();
  const { amount } = useWatch({ control });
  const fiatAmount = amount
    ? `~${formatNumber(Number(amount) * vault.asset.priceUsd, 2, "currency", "standard")}`
    : "~$0.0";

  const { userBalance, tokenDecimals } = useReadTokenContract({
    tokenAddress: vault.asset.address,
  });

  const userBalanceFloat = useMemo(
    () =>
      userBalance !== undefined && tokenDecimals
        ? Number(userBalance) / 10 ** Number(tokenDecimals)
        : undefined,
    [userBalance, tokenDecimals]
  );

  const formattedUserBalance = useMemo(
    () =>
      userBalanceFloat !== undefined
        ? formatNumber(userBalanceFloat, 4, "decimal", "standard", 0.0001)
        : "",
    [userBalanceFloat]
  );

  if (!context) return null;

  const collateralAssets = vault.state.allocation
    .map((allocation) => allocation.market.collateralAsset)
    .filter((asset) => asset);

  const handleSetValue = (value: string) => {
    if (value === "") return undefined;
    if (typeof value === "number") return value;

    let v = value;
    v = v.replace(",", ".");
    const inputedDecimals = v.includes(".") && v.split(".").at(-1);
    if (inputedDecimals && inputedDecimals.length > vault.asset.decimals)
      return Number(
        v.slice(0, -(inputedDecimals.length - vault.asset.decimals))
      );
    return Number(v);
  };

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
      <div className="flex w-full flex-col justify-between border border-muted px-5 py-2 rounded-xl text-md">
        <span>
          Daily APY: {formatNumber(vault.state.dailyNetApy, 2, "percent")}
        </span>
        <span>
          Weekly APY: {formatNumber(vault.state.weeklyNetApy, 2, "percent")}
        </span>
        <span>
          30-day APY: {formatNumber(vault.state.monthlyNetApy, 2, "percent")}
        </span>
        <span>
          90-day APY: {formatNumber(vault.state.quarterlyNetApy, 2, "percent")}
        </span>
        <span>
          Total assets: ${formatNumber(vault.state.totalAssetsUsd, 1)}
        </span>
        <span>Liquidity: ${formatNumber(vault.liquidity.usd, 1)}</span>
        <span>Curators:</span>
        {vault.metadata.curators.map((curator) => (
          <div key={curator.name} className="flex flex-row">
            <img
              width={24}
              height={24}
              src={curator.image}
              alt={curator.name}
            />
            <span>{curator.name}</span>
          </div>
        ))}
        <span>Collaterals:</span>
        <div className="flex ">
          {collateralAssets.slice(0, 4).map((asset) => {
            return (
              <div
                key={asset.address}
                className="min-w-4 min-h-6 max-w-4 max-h-6"
              >
                <div className="w-6 h-6">
                  <img
                    width={24}
                    height={24}
                    src={asset.logoURI}
                    alt={asset.symbol}
                    title={asset.symbol}
                  />
                </div>
              </div>
            );
          })}
          {collateralAssets.length > 4 && (
            <span className="ml-3 cursor-default">
              +{collateralAssets.length - 4}
            </span>
          )}
        </div>
      </div>
      <TokenAmountInput
        name="amount"
        type="number"
        inputMode="decimal"
        step={`0.${"0".repeat(vault.asset.decimals - 1)}1`}
        max="1000000000000"
        token={
          new Token(
            vault.chain.id,
            vault.asset.address,
            vault.asset.decimals,
            vault.asset.symbol
          )
        }
        label="Deposit Amount"
        placeholder="0.0"
        autoComplete="off"
        disabled={false}
        userBalance={formattedUserBalance}
        userBalanceFullDecimals={String(userBalanceFloat)}
        fiatAmount={fiatAmount}
        shouldEnableMaxSelector={true}
        validation={{ setValueAs: handleSetValue }}
        onKeyDown={(e) =>
          ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
        }
      />
      <Info content={<InfoContent />} />
      <ButtonPrimary type="submit" className="mb-0">
        <ButtonText context={context} />
      </ButtonPrimary>
    </div>
  );
}

const ButtonText = ({
  context,
  errorMessage,
  isLoading,
}: {
  context: HookDappContextAdjusted;
  errorMessage?: string | undefined;
  isLoading?: boolean;
}) => {
  if (errorMessage) return <span>{errorMessage}</span>;

  if (isLoading) return <span>Loading...</span>;

  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update Pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update Post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add Pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add Post-hook</span>;
};
