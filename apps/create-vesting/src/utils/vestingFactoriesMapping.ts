import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { Address } from "viem";

export const vestingFactoriesMapping: Record<
  SupportedChainId,
  Address | undefined
> = {
  [SupportedChainId.MAINNET]: "0xcf61782465Ff973638143d6492B51A85986aB347",
  [SupportedChainId.GNOSIS_CHAIN]: "0x62E13BE78af77C86D38a027ae432F67d9EcD4c10",
  [SupportedChainId.ARBITRUM_ONE]: "0x62E13BE78af77C86D38a027ae432F67d9EcD4c10",
  [SupportedChainId.SEPOLIA]: undefined,
};
