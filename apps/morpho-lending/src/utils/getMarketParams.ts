import type { MorphoMarket, MorphoMarketParams } from "@bleu/cow-hooks-ui";
import { zeroAddress } from "viem";

export function getMarketParams(market: MorphoMarket): MorphoMarketParams {
  return {
    loanToken: market.loanAsset.address,
    collateralToken: market?.collateralAsset?.address ?? zeroAddress,
    oracle: market?.oracle?.address ?? zeroAddress,
    irm: market?.irmAddress ?? zeroAddress,
    lltv: market?.lltv ?? BigInt(0),
  };
}
