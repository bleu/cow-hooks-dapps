import {
  type GetTokenPermitIntoResult,
  type PermitInfo,
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
} from "@cowprotocol/permit-utils";
import { BigNumber } from "ethers";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { type Address, erc20Abi, maxUint256 } from "viem";
import { useIFrameContext } from "../../context/iframe";
import { getPermitCacheAtom, storePermitCacheAtom } from "./state";
import { handleTokenApprove } from "./useHandleTokenApprove";

export function useHandleTokenAllowance({
  spender,
}: {
  spender: Address | undefined;
}) {
  const { web3Provider, publicClient, jsonRpcProvider, context, signer } =
    useIFrameContext();
  const storePermit = useSetAtom(storePermitCacheAtom);
  const getCachedPermit = useSetAtom(getPermitCacheAtom);

  return useCallback(
    async (amount: BigNumber, tokenAddress: Address) => {
      if (
        !publicClient ||
        !jsonRpcProvider ||
        !context?.account ||
        !spender ||
        !web3Provider
      )
        throw new Error("Missing context");

      const tokenContract = {
        address: tokenAddress,
        abi: erc20Abi,
      };

      const [{ result: currentAllowance }, { result: tokenName }] =
        await publicClient.multicall({
          contracts: [
            {
              ...tokenContract,
              functionName: "allowance",
              args: [context.account, spender],
            },
            {
              ...tokenContract,
              functionName: "name",
            },
          ],
        });
      if (currentAllowance === undefined || !tokenName) {
        throw new Error("Token allowance not available");
      }

      if (amount.lte(BigNumber.from(currentAllowance))) {
        // amount is less than or equal to current allowance so no need to approve
        return;
      }

      const { chainId, account } = context;

      const eip2162Utils = getPermitUtilsInstance(
        chainId,
        web3Provider,
        account,
      );

      const [permitInfo, nonce] = await Promise.all([
        getTokenPermitInfo({
          spender,
          tokenAddress,
          chainId,
          provider: jsonRpcProvider,
        }),
        eip2162Utils.getTokenNonce(tokenAddress, account),
      ]).catch(() => [undefined, undefined]);

      const cachedPermit = getCachedPermit({
        chainId: context.chainId,
        tokenAddress,
        account: context.account,
        spender,
        nonce,
      });

      if (cachedPermit) {
        return cachedPermit;
      }

      if (!permitInfo || !checkIsPermitInfo(permitInfo)) {
        await handleTokenApprove({
          signer,
          spender,
          tokenAddress,
          amount: maxUint256,
        });
        return;
      }

      const hook = await generatePermitHook({
        chainId,
        inputToken: {
          address: tokenAddress,
          name: tokenName,
        },
        spender,
        provider: jsonRpcProvider,
        permitInfo,
        eip2162Utils: eip2162Utils,
        account,
        nonce,
      });
      if (!hook) throw new Error("User rejected permit");
      storePermit({
        chainId,
        tokenAddress,
        account,
        nonce,
        spender,
        hookData: hook,
      });
      return hook;
    },
    [
      jsonRpcProvider,
      context,
      publicClient,
      spender,
      signer,
      web3Provider,
      getCachedPermit,
      storePermit,
    ],
  );
}

export function checkIsPermitInfo(
  permitInfo: GetTokenPermitIntoResult,
): permitInfo is PermitInfo {
  return "type" in permitInfo && permitInfo.type !== "unsupported";
}
