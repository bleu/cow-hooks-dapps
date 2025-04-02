import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { arbitrum, gnosis } from "viem/chains";
/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const RPC_URL_MAPPING =
  process.env.NODE_ENV === "development"
    ? {
        [SupportedChainId.MAINNET]: "https://eth.llamarpc.com",
        [SupportedChainId.GNOSIS_CHAIN]: gnosis.rpcUrls.default.http[0],
        [SupportedChainId.ARBITRUM_ONE]: arbitrum.rpcUrls.default.http[0],
        [SupportedChainId.SEPOLIA]:
          "https://ethereum-sepolia-rpc.publicnode.com",
        [SupportedChainId.BASE]: "https://base.llamarpc.com",
      }
    : {
        [SupportedChainId.MAINNET]:
          "https://lb.drpc.org/ogrpc?network=ethereum&dkey=AnOfyGnZ_0nWpS-OOwQzqAnACrGNjLcR77k8TgFkVp5j",
        [SupportedChainId.GNOSIS_CHAIN]:
          "https://lb.drpc.org/ogrpc?network=gnosis&dkey=AnOfyGnZ_0nWpS-OOwQzqAnACrGNjLcR77k8TgFkVp5j",
        [SupportedChainId.ARBITRUM_ONE]:
          "https://lb.drpc.org/ogrpc?network=arbitrum&dkey=AnOfyGnZ_0nWpS-OOwQzqAnACrGNjLcR77k8TgFkVp5j",
        [SupportedChainId.SEPOLIA]:
          "https://lb.drpc.org/ogrpc?network=sepolia&dkey=AnOfyGnZ_0nWpS-OOwQzqAnACrGNjLcR77k8TgFkVp5j",
        [SupportedChainId.BASE]:
          "https://lb.drpc.org/ogrpc?network=base&dkey=AnOfyGnZ_0nWpS-OOwQzqAnACrGNjLcR77k8TgFkVp5j",
      };
