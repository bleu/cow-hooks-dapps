import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { cacheExchange, fetchExchange } from "@urql/core";
import { createClient } from "urql";

const arbitrumClient = createClient({
  url: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/CStW6CSQbHoXsgKuVCrk3uShGA4JX3CAzzv2x9zaGf8w`,
  exchanges: [cacheExchange, fetchExchange],
});

const mainnetClient = createClient({
  url: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum`,
  exchanges: [cacheExchange, fetchExchange],
});

export const thegraphClientsMap = {
  [SupportedChainId.ARBITRUM_ONE]: arbitrumClient,
  [SupportedChainId.MAINNET]: mainnetClient,
};
