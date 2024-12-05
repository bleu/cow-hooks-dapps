import { getCowProtocolUsdPrice } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";
import type { TokenData } from "#/types";
import { isChainIdSupported } from "./uniswapSupportedChains";

export async function getTokensPrices(
  tokens: TokenData[],
  chainId: SupportedChainId,
): Promise<number[]> {
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} is not supported`);
  }

  return await Promise.all(
    tokens.map((token) =>
      getCowProtocolUsdPrice({
        chainId,
        tokenAddress: token.address as Address,
        tokenDecimals: token.decimals,
      }),
    ),
  );
}
