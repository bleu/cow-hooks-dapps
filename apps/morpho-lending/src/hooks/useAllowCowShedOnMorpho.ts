import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoAbi } from "@bleu/utils/transactionFactory";
import { MORPHO_ADDRESS_MAP } from "@bleu/utils/transactionFactory/morpho";
import { splitSignature } from "ethers/lib/utils";
import { useCallback } from "react";
import useSWR from "swr";
import { type Address, encodeFunctionData } from "viem";

interface MorphoAuthorizationData {
  authorizer: Address;
  authorized: Address;
  isAuthorized: boolean;
  nonce: bigint;
  deadline: bigint;
}

export const useIsCowShedAuthorizedOnMorpho = () => {
  const { cowShedProxy, context, publicClient } = useIFrameContext();

  return useSWR([context?.account, cowShedProxy], async () => {
    if (!publicClient || !context?.account || !cowShedProxy)
      return { isProxyAuthorized: undefined, userNonce: undefined };

    const [isAuthorizedResult, nonceResult] = await publicClient.multicall({
      contracts: [
        {
          address: MORPHO_ADDRESS_MAP[context.chainId],
          abi: morphoAbi,
          functionName: "isAuthorized",
          args: [context.account, cowShedProxy],
        },
        {
          address: MORPHO_ADDRESS_MAP[context.chainId],
          abi: morphoAbi,
          functionName: "nonce",
          args: [context.account],
        },
      ],
    });

    return {
      isProxyAuthorized:
        isAuthorizedResult.status === "success"
          ? isAuthorizedResult.result
          : undefined,
      userNonce:
        nonceResult.status === "success" ? nonceResult.result : undefined,
    };
  });
};

function getAuthorizationData(
  authorizer: Address,
  authorized: Address,
  nonce: bigint,
): MorphoAuthorizationData {
  const isAuthorized = true;
  const deadline = BigInt(Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 30));

  return {
    authorizer,
    authorized,
    isAuthorized,
    nonce,
    deadline,
  };
}

export function useAllowCowShedOnMorpho({
  isCowShedAuthorizedOnMorpho,
  userNonce,
}: {
  isCowShedAuthorizedOnMorpho: boolean | undefined;
  userNonce: bigint | undefined;
}) {
  const { web3Provider, publicClient, jsonRpcProvider, context, cowShedProxy } =
    useIFrameContext();

  return useCallback(async () => {
    if (
      !publicClient ||
      !jsonRpcProvider ||
      !context?.account ||
      !web3Provider ||
      !cowShedProxy ||
      userNonce === undefined
    )
      throw new Error("Missing context");

    if (isCowShedAuthorizedOnMorpho) return;

    const { chainId, account } = context;

    const authorizationData = getAuthorizationData(account, cowShedProxy, userNonce);

    const domain = {
      chainId: chainId,
      verifyingContract: MORPHO_ADDRESS_MAP[chainId],
    };

    // Define the types
    const types = {
      Authorization: [
        { name: "authorizer", type: "address" },
        { name: "authorized", type: "address" },
        { name: "isAuthorized", type: "bool" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const signer = web3Provider.getSigner();

    // Request the signature using EIP-712 (typed data signing)
    const signature = await signer._signTypedData(
      domain,
      types,
      authorizationData,
    );

    if (!signature) return;

    const splittedSignature = splitSignature(signature) as {
      v: number;
      r: `0x${string}`;
      s: `0x${string}`;
    };

    const hook = {
      target: MORPHO_ADDRESS_MAP[chainId],
      callData: encodeFunctionData({
        abi: morphoAbi,
        functionName: "setAuthorizationWithSig",
        args: [authorizationData, splittedSignature],
      }),
      gasLimit: "500000",
    };

    if (!hook) throw new Error("User rejected permit");

    return hook;
  }, [
    jsonRpcProvider,
    context,
    publicClient,
    web3Provider,
    isCowShedAuthorizedOnMorpho,
    userNonce,
    cowShedProxy
  ]);
}
