import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoAbi } from "@bleu/utils/transactionFactory";
import { MORPHO_ADDRESS } from "@bleu/utils/transactionFactory/morpho";
import { useCallback } from "react";
import useSWR from "swr";
import { encodeFunctionData } from "viem";

export const useIsCowShedAuthorizedOnMorpho = () => {
  const { cowShedProxy, context, publicClient } = useIFrameContext();

  const { data: isProxyAuthorized } = useSWR(
    [publicClient, context?.account, cowShedProxy],
    async () => {
      if (!publicClient || !context?.account || !cowShedProxy) return;
      return await publicClient.readContract({
        address: MORPHO_ADDRESS,
        abi: morphoAbi,
        functionName: "isAuthorized",
        args: [context.account, cowShedProxy],
      });
    },
  );

  return isProxyAuthorized;
};

export const useAuthorizeCowShedOnMorpho = (
  isProxyAuthorized: boolean | undefined,
) => {
  const { cowShedProxy, signer } = useIFrameContext();

  return useCallback(async () => {
    if (!signer || !cowShedProxy) throw new Error("missing context");

    if (isProxyAuthorized) return;

    const transaction = await signer
      .sendTransaction({
        to: MORPHO_ADDRESS,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: morphoAbi,
          functionName: "setAuthorization",
          args: [cowShedProxy, true],
        }),
      })
      .catch(() => {
        throw new Error("User rejected transaction");
      });

    await transaction.wait();
  }, [cowShedProxy, signer, isProxyAuthorized]);
};
