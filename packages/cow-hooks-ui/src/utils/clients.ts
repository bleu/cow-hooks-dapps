import { RPC_URL_MAPPING } from "@bleu/utils/transactionFactory";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { http, createPublicClient } from "viem";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const publicClientMapping = {
  [SupportedChainId.MAINNET]: createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL_MAPPING[SupportedChainId.MAINNET]),
  }),
  [SupportedChainId.GNOSIS_CHAIN]: createPublicClient({
    chain: gnosis,
    transport: http(RPC_URL_MAPPING[SupportedChainId.GNOSIS_CHAIN]),
  }),
  [SupportedChainId.ARBITRUM_ONE]: createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URL_MAPPING[SupportedChainId.ARBITRUM_ONE]),
  }),
  [SupportedChainId.SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL_MAPPING[SupportedChainId.SEPOLIA]),
  }),
};
