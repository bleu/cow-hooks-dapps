import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { TokenData } from "#/types";

const tokenListUrlMap = {
  [SupportedChainId.MAINNET]:
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/CowSwap.json",
  [SupportedChainId.ARBITRUM_ONE]:
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/ArbitrumOneUniswapTokensList.json",
  [SupportedChainId.GNOSIS_CHAIN]: "",
  [SupportedChainId.SEPOLIA]: "",
};

export async function getTokensList(
  chainId: SupportedChainId,
): Promise<TokenData[]> {
  if (
    chainId !== SupportedChainId.MAINNET &&
    chainId !== SupportedChainId.ARBITRUM_ONE
  ) {
    console.error("Unsupported chainId:", chainId);
    throw new Error("Unsupported chain");
  }

  try {
    const response = await fetch(tokenListUrlMap[chainId]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { tokens: TokenData[] } = await response.json();

    return data.tokens;
  } catch (error) {
    console.error("Error fetching token list:", error);
    throw error;
  }
}
