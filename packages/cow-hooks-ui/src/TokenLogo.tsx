"use client";

import { cowTokenList } from "@bleu/utils";
import Image from "next/image";
import { Suspense, useState } from "react";

import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Token } from "@uniswap/sdk-core";
import { useTokenLogoContext } from "./context/tokenLogo";

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
  chainId?: SupportedChainId,
) => `${tokenUrlRoot}/${chainId}/${address}/logo.png`;

export const cowTokenListLogoUrl = (
  address?: string,
  chainId?: SupportedChainId,
) => {
  return cowTokenList.find(
    (token) =>
      token.chainId === chainId &&
      token.address.toLowerCase() === address?.toLowerCase(),
  )?.logoURI;
};

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
const chainIdToName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.GNOSIS_CHAIN]: "xdai",
  [SupportedChainId.SEPOLIA]: "ethereum",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
  [SupportedChainId.BASE]: "base",
};

export function trustTokenLogoUrl(
  address?: string,
  chainId?: SupportedChainId,
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
  const { getTokenLogoSrcIndex, setTokenLogoSrcIndex } = useTokenLogoContext();
  const [index, setIndex] = useState(getTokenLogoSrcIndex(token.address));

  const [reveal, setReveal] = useState(false);
  const visibility = reveal ? "visible" : "hidden";

  const imagesSrc = [
    cowprotocolTokenLogoUrl(token.address?.toLowerCase(), token.chainId),
    cowprotocolTokenLogoUrl(token.address?.toLowerCase(), 1),
    cowTokenListLogoUrl(token.address, token.chainId),
    cowTokenListLogoUrl(token.address, 1),
    trustTokenLogoUrl(token.address?.toLowerCase(), token.chainId),
    trustTokenLogoUrl(token.address?.toLowerCase(), 1),
    FALLBACK_SRC,
  ];

  const onError = () => {
    if (index < imagesSrc.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <Suspense fallback={<div style={{ width, height }} />}>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Image
          className={className}
          quality={quality}
          layout="fill"
          objectFit="cover"
          alt={alt || ""}
          style={{ visibility }}
          src={imagesSrc[index] || (FALLBACK_SRC as string)}
          onError={onError}
          onLoadingComplete={() => {
            setReveal(true);
            setTokenLogoSrcIndex(token.address, index);
          }}
          unoptimized
        />
      </div>
    </Suspense>
  );
};
