import { Address, erc20Abi, PublicClient } from "viem";
import { useCallback } from "react";
import { BigNumber, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  // generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
  GetTokenPermitIntoResult,
  PermitInfo,
} from "@cowprotocol/permit-utils";
import { generatePermitHook } from "./useGeneratePermitHook";
import { useHandleTokenApprove } from "./useHandleTokenApprove";
import { HookDappContextAdjusted } from "../../types";

export function useHandleTokenAllowance({
  signer,
  jsonRpcProvider,
  context,
  publicClient,
  spender,
}: {
  signer: Signer | undefined;
  jsonRpcProvider: JsonRpcProvider | undefined;
  context: HookDappContextAdjusted | undefined;
  publicClient: PublicClient | undefined;
  spender: Address | undefined;
}) {
  const handleTokenApprove = useHandleTokenApprove({
    signer,
    spender,
  });

  return useCallback(
    async (amount: BigNumber, tokenAddress: Address) => {
      if (!publicClient || !jsonRpcProvider || !context?.account || !spender)
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
      console.log("currentAllowance", currentAllowance);
      console.log("tokenName", tokenName);
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

      console.log("permitInfo", permitInfo);

      if (!permitInfo || !checkIsPermitInfo(permitInfo)) {
        console.log("calling handleTokenApprove");
        await handleTokenApprove(tokenAddress);
        return;
      }

      console.log("starting dealing with permit");

      const eip2162Utils = getPermitUtilsInstance(
        chainId,
        jsonRpcProvider,
        account
      );

      const nonce = await eip2162Utils.getTokenNonce(tokenAddress, account);
      const hook = await generatePermitHook({
        chainId,
        inputToken: {
          address: tokenAddress,
          name: tokenName,
        },
        spender: spender,
        provider: jsonRpcProvider,
        permitInfo,
        eip2162Utils: eip2162Utils,
        account,
        nonce,
      }).catch((e) => console.log("error", e));
      console.log("hook", hook);
      return hook;
    },
    [jsonRpcProvider, context, publicClient, spender]
  );
}

export function checkIsPermitInfo(
  permitInfo: GetTokenPermitIntoResult
): permitInfo is PermitInfo {
  return "type" in permitInfo && permitInfo.type !== "unsupported";
}
