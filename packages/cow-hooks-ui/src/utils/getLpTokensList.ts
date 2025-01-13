import type { RawTokenData } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { combineTokenLists } from "./combineTokenLists";
import { getExtraTokens } from "./storage";

interface TokenData extends Omit<RawTokenData, "extensions"> {
  tokens: string[];
}

export async function getLpTokensList(
  chainId: SupportedChainId,
  account: string
): Promise<TokenData[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/lp-tokens/uniswapv2.json"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { tokens: RawTokenData[] } = await response.json();

    const cachedLpTokens = getExtraTokens(chainId, account);

    const poolTokens = combineTokenLists(data.tokens, cachedLpTokens);

    // Transform the tokens array
    const allLpTokens: TokenData[] = {
      tokens: poolTokens,
    }.tokens.map((token) => ({
      chainId: token.chainId,
      address: token.address,
      name: token.name,
      decimals: token.decimals,
      symbol: token.symbol,
      tokens: token.extensions.tokens.split(","),
    }));

    return allLpTokens;
  } catch (error) {
    console.error("Error fetching token list:", error);
    throw error;
  }
}
