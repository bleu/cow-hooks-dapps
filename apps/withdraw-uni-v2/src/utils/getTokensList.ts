import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { TokenData } from "#/types";
import { combineTokenLists } from "./combineTokenLists";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
const tokenListUrlMap = {
  [SupportedChainId.MAINNET]: [
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/CowSwap.json",
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/CoinGecko.json",
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/ArbitrumOneUniswapTokensList.json",
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/ArbitrumOneCoingeckoTokensList.json",
  ],
  [SupportedChainId.GNOSIS_CHAIN]: [
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/GnosisCoingeckoTokensList.json",
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/GnosisUniswapTokensList.json",
  ],
  [SupportedChainId.SEPOLIA]: [
    "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/CowSwapSepolia.json",
  ],
};

export async function getTokensList(
  chainId: SupportedChainId,
): Promise<TokenData[]> {
  try {
    const response = await Promise.all(
      tokenListUrlMap[chainId].map((file) => fetch(file)),
    );

    if (!response.every((res) => res.ok)) {
      throw new Error(
        `HTTP error! status: ${response.map((res) => res.status)}`,
      );
    }

    const allJsonFiles = (await Promise.all(
      response.map((res) => res.json()),
    )) as { tokens: TokenData[] }[];

    const allTokens = allJsonFiles.map(({ tokens }) => tokens);

    return combineTokenLists(...allTokens);
  } catch (error) {
    console.error("Error fetching token list:", error);
    throw error;
  }
}
