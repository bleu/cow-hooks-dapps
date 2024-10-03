import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";

export const RPC_URL_MAPPING = {
  [SupportedChainId.MAINNET]: mainnet.rpcUrls.default.http[0],
  [SupportedChainId.GNOSIS_CHAIN]: gnosis.rpcUrls.default.http[0],
  [SupportedChainId.ARBITRUM_ONE]: arbitrum.rpcUrls.default.http[0],
  [SupportedChainId.SEPOLIA]: sepolia.rpcUrls.default.http[0],
};
