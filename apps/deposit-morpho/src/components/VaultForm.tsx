import { formatNumber } from "@bleu.builders/ui";
import {
  ButtonPrimary,
  Info,
  InfoContent,
  type Vault,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";

export function VaultForm({ vault }: { vault: Vault }) {
  const { context } = useIFrameContext();

  if (!context) return null;

  const collateralAssets = vault.state.allocation
    .map((allocation) => allocation.market.collateralAsset)
    .filter((asset) => asset);

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
      <Info content={<InfoContent />} />
      <ButtonPrimary type="submit" className="mb-0">
        Add Hook
      </ButtonPrimary>
    </div>
  );
}
