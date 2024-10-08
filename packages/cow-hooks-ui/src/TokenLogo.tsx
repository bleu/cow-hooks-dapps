"use client";

import { cowTokenList } from "@bleu/utils";
import Image from "next/image";
import { useState } from "react";

import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Token } from "@uniswap/sdk-core";

type ImageAttributes = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

type ImageFallbackProps = Omit<ImageAttributes, "src"> & {
  token: Token;
  quality?: number;
};

const tokenUrlRoot =
  "https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images";

export const cowprotocolTokenLogoUrl = (
  address?: string,
  chainId?: SupportedChainId
) => `${tokenUrlRoot}/${chainId}/${address}/logo.png`;

export const cowTokenListLogoUrl = (
  address?: string,
  chainId?: SupportedChainId
) => {
  return cowTokenList.find(
    (token) =>
      token.chainId === chainId &&
      token.address.toLowerCase() === address?.toLowerCase()
  )?.logoURI;
};

const chainIdToName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.GNOSIS_CHAIN]: "xdai",
  [SupportedChainId.SEPOLIA]: "ethereum",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
};

export function trustTokenLogoUrl(
  address?: string,
  chainId?: SupportedChainId
): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainIdToName[chainId || 1]}/assets/${address}/logo.png`;
}

const FALLBACK_SRC = "/assets/generic-token-logo.png";
export const TokenLogo = ({
  token,
  alt,
  width,
  height,
  className,
  quality,
}: ImageFallbackProps) => {
  const imagesSrc = [
    cowprotocolTokenLogoUrl(token.address?.toLowerCase(), token.chainId),
    cowprotocolTokenLogoUrl(token.address?.toLowerCase(), 1),
    cowTokenListLogoUrl(token.address, token.chainId),
    cowTokenListLogoUrl(token.address, 1),
    trustTokenLogoUrl(token.address?.toLowerCase(), token.chainId),
    trustTokenLogoUrl(token.address?.toLowerCase(), 1),
    FALLBACK_SRC,
  ];
  const [index, setIndex] = useState(0);

  return (
    <Image
      className={className}
      width={Number(width)}
      height={Number(height)}
      quality={quality}
      alt={alt || ""}
      src={imagesSrc[index] || FALLBACK_SRC}
      onError={() => {
        if (index < imagesSrc.length - 1) {
          setIndex(index + 1);
        }
      }}
      unoptimized // Disabling to avoid 404 error log on the console
    />
  );
};
