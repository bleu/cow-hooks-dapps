import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { PublicClient } from "viem";
import type { TokenData } from "#/types";
import { getTokensPrices } from "./getTokensPrices";
import { readTokensData } from "./readTokensData";

interface TokenWithPrice extends TokenData {
  priceUsd: number;
}

export async function getTokensInfo(
  addresses: string[],
  tokensInList: TokenData[],
  chainId: SupportedChainId,
  client: PublicClient,
) {
  const uniqueAddresses = [...new Set(addresses)];

  const tokens: Record<string, TokenData> = {};

  // First option: get token data from tokens list
  const tokensNotInList: string[] = [];
  for (const address of uniqueAddresses) {
    const tokenInfo = tokensInList.find((token) => token.address === address);
    if (tokenInfo) {
      tokens[address] = tokenInfo;
    } else {
      tokensNotInList.push(address);
    }
  }

  // Second option: read info on-chain
  const onChainTokensData =
    tokensNotInList.length > 0
      ? await readTokensData(tokensNotInList, client, chainId)
      : [];
  for (const tokenData of onChainTokensData) {
    tokens[tokenData.address] = tokenData;
  }

  // Fetch USD prices
  const tokenList = Object.values(tokens);
  const prices = await getTokensPrices(tokenList, chainId);
  const tokensWithPrices: TokenWithPrice[] = tokenList.map((token, i) => {
    return { ...token, priceUsd: prices[i] };
  });

  return tokensWithPrices;
}
