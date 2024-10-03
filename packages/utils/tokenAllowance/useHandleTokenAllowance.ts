import { Address, erc20Abi, PublicClient } from "viem";
import { useCallback } from "react";
import { BigNumber, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
  GetTokenPermitIntoResult,
  PermitInfo,
} from "@cowprotocol/permit-utils";
import { useHandleTokenApprove } from "./useHandleTokenApprove";
import { HookDappContextAdjusted } from "../cowShed/types";

export function useHandleTokenAllowance({
  signer,
  jsonRpcProvider,
  context,
  publicClient,
  cowShedProxy,
}: {
  signer: Signer | undefined;
  jsonRpcProvider: JsonRpcProvider | undefined;
  context: HookDappContextAdjusted | undefined;
  publicClient: PublicClient | undefined;
  cowShedProxy: Address | undefined;
}) {
  const handleTokenApprove = useHandleTokenApprove({ signer, cowShedProxy });

  const spender = cowShedProxy as Address;

  return useCallback(
    async (amount: BigNumber, tokenAddress: Address) => {
      if (!publicClient || !jsonRpcProvider || !context?.account)
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

      if (amount.lte(currentAllowance)) {
        // amount is less than or equal to current allowance so no need to approve
        return;
      }

      const { chainId, account } = context;

      const permitInfo = await getTokenPermitInfo({
        spender,
        tokenAddress,
        chainId,
        provider: jsonRpcProvider,
      });

      if (!permitInfo || !checkIsPermitInfo(permitInfo)) {
        await handleTokenApprove(tokenAddress);
        return;
      }

      const eip2162Utils = getPermitUtilsInstance(
        chainId,
        jsonRpcProvider,
        account
      );

      const nonce = await eip2162Utils.getTokenNonce(tokenAddress, account);

      return await generatePermitHook({
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
    },
    [jsonRpcProvider, context, publicClient, cowShedProxy]
  );
}

export function checkIsPermitInfo(
  permitInfo: GetTokenPermitIntoResult
): permitInfo is PermitInfo {
  return "type" in permitInfo && permitInfo.type !== "unsupported";
}
