import {
  type GetTokenPermitIntoResult,
  type PermitInfo,
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
} from "@cowprotocol/permit-utils";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { type Address, type PublicClient, erc20Abi, maxUint256 } from "viem";
import { handleTokenApprove } from "./useHandleTokenApprove";
import { useIFrameContext } from "../../context/iframe";

export function useHandleTokenAllowance({
  spender,
}: {
  spender: Address | undefined;
}) {
  const { web3Provider, publicClient, jsonRpcProvider, context, signer } =
    useIFrameContext();
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
        account
      );

      try {
        const [permitInfo, nonce] = await Promise.all([
          getTokenPermitInfo({
            spender,
            tokenAddress,
            chainId,
            provider: jsonRpcProvider,
          }),
          eip2162Utils.getTokenNonce(tokenAddress, account),
        ]);

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
        if (!hook) throw new Error("Couldn't build permit");
        return hook;
      } catch (error) {
        await handleTokenApprove({
          signer,
          spender,
          tokenAddress,
          amount: maxUint256,
        });
        return;
      }
    },
    [jsonRpcProvider, context, publicClient, spender, signer, web3Provider]
  );
}

export function checkIsPermitInfo(
  permitInfo: GetTokenPermitIntoResult
): permitInfo is PermitInfo {
  return "type" in permitInfo && permitInfo.type !== "unsupported";
}
