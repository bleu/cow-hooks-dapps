import type { MorphoMarket, MorphoMarketParams } from "@bleu/cow-hooks-ui";

export function getMarketParams(market: MorphoMarket): MorphoMarketParams {
  return {
    loanToken: market.loanAsset.address,
    collateralToken: market.collateralAsset.address,
    oracle: market.oracle.address,
    irm: market.irmAddress,
    lltv: market.lltv,
  };
}
