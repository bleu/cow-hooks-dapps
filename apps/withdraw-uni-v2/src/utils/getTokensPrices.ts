import { SupportedChainId } from "@cowprotocol/cow-sdk";

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
  if (
    chainId !== SupportedChainId.MAINNET &&
    chainId !== SupportedChainId.ARBITRUM_ONE
  ) {
    console.error("Unsupported chainId:", chainId);
    throw new Error("Unsupported chain");
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
