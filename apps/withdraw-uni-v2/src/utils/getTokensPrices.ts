import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { isChainIdSupported } from "./uniswapSupportedChains";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
const coingeckoPlatfromMap = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum-one",
  [SupportedChainId.GNOSIS_CHAIN]: "",
  [SupportedChainId.SEPOLIA]: "",
};

export async function getTokensPrices(
  addresses: string[],
  chainId: SupportedChainId,
): Promise<Record<string, number>> {
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} is not supported`);
  }

  if (chainId === SupportedChainId.SEPOLIA) {
    return addresses.reduce(
      (acc, address) => {
        acc[address] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  const baseUrl = "https://api.coingecko.com/api/v3/simple/token_price";
  const getUrl = (address: string) =>
    `${baseUrl}/${coingeckoPlatfromMap[chainId]}?contract_addresses=${address}&vs_currencies=usd`;

  const responses = await Promise.all(
    addresses.map((address) => fetch(getUrl(address))),
  );

  const pricesData = await Promise.all(
    responses.map((response) => response.json()),
  );

  const tokensPrices: Record<string, number> = {};
  pricesData.forEach((priceData, idx) => {
    if (!priceData) {
      tokensPrices[addresses[idx]] = 0;
    } else {
      tokensPrices[addresses[idx]] = priceData[addresses[idx].toLowerCase()]
        .usd as number;
    }
  });

  return tokensPrices;
}
