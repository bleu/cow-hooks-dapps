import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";

const COW_API_BASE_URL = "https://api.cow.fi/";

export const COW_API_URL_BY_CHAIN_ID = {
  /**
   * #CHAIN-INTEGRATION
   * This needs to be changed if you want to support a new chain
   */
  [SupportedChainId.MAINNET]: `${COW_API_BASE_URL}mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${COW_API_BASE_URL}xdai`,
  [SupportedChainId.SEPOLIA]: `${COW_API_BASE_URL}sepolia`,
  [SupportedChainId.ARBITRUM_ONE]: `${COW_API_BASE_URL}arbitrum_one`,
  [SupportedChainId.BASE]: `${COW_API_BASE_URL}base`,
};

export interface INativePrice {
  price: number;
}

export async function getNativePrice(
  tokenAddress: Address,
  chainId: SupportedChainId
): Promise<number> {
  const url = COW_API_URL_BY_CHAIN_ID[chainId];

  return fetch(`${url}/api/v1/token/${tokenAddress}/native_price`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json() as Promise<INativePrice>)
    .then((data) => data.price);
}

export const USDC: Record<
  SupportedChainId,
  { address: Address; decimals: number }
> = {
  [SupportedChainId.MAINNET]: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    decimals: 6,
  },
  [SupportedChainId.SEPOLIA]: {
    address: "0xbe72E441BF55620febc26715db68d3494213D8Cb",
    decimals: 18,
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
  },
  [SupportedChainId.BASE]: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
};

export async function getCowProtocolUsdPrice({
  chainId,
  tokenAddress,
  tokenDecimals,
}: {
  chainId: SupportedChainId;
  tokenAddress: Address;
  tokenDecimals: number;
}): Promise<number> {
  const usdcToken = USDC[chainId];
  const [usdNativePrice, tokenNativePrice] = await Promise.all([
    getNativePrice(USDC[chainId].address as Address, chainId),
    getNativePrice(tokenAddress, chainId),
  ]);

  if (usdNativePrice && tokenNativePrice) {
    const usdPrice = invertNativeToTokenPrice(
      usdNativePrice,
      usdcToken.decimals
    );
    const tokenPrice = invertNativeToTokenPrice(
      tokenNativePrice,
      tokenDecimals
    );

    if (!tokenPrice) throw new Error("Token price is 0");

    return usdPrice / tokenPrice;
  }

  return 0;
}

/**
 * API response value represents the amount of native token atoms needed to buy 1 atom of the specified token
 * This function inverts the price to represent the amount of specified token atoms needed to buy 1 atom of the native token
 */
function invertNativeToTokenPrice(value: number, decimals: number): number {
  const inverted = 1 / value;
  return inverted * 10 ** (18 - decimals);
}
