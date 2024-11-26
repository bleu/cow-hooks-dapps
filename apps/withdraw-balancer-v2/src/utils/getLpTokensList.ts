interface RawTokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  extensions: {
    tokens: string;
  };
}

type TokenListResponse = RawTokenData[];

interface TokenData extends Omit<RawTokenData, "extensions"> {
  tokens: string[];
}

// TODO: Remove this test token after review
const additionalLpTokens: RawTokenData[] = [
  {
    chainId: 42161,
    address: "0xf64dfe17c8b87f012fcf50fbda1d62bfa148366a",
    name: "Uniswap V2 WETH/USDC",
    decimals: 18,
    symbol: "WETH/USDC",
    extensions: {
      tokens:
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1,0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    },
  },
];

export async function getLpTokensList(): Promise<TokenData[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/lp-tokens/uniswapv2.json",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { tokens: TokenListResponse } = await response.json();

    // Transform the tokens array
    const allLpTokens: TokenData[] = {
      tokens: [...data.tokens, ...additionalLpTokens], // TODO: Remove this test token after review
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
