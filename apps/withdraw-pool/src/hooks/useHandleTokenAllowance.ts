import { Address, erc20Abi } from "viem";
import { useCallback } from "react";
import { BigNumber } from "ethers";
import {
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
  GetTokenPermitIntoResult,
  PermitInfo,
} from "@cowprotocol/permit-utils";
import { useIFrameContext } from "#/context/iframe";
import { useHandleTokenApprove } from "./useHandleTokenApprove";

export function useHandleTokenAllowance() {
  const { jsonRpcProvider, context, publicClient, cowShedProxy } =
    useIFrameContext();

  const handleTokenApprove = useHandleTokenApprove();

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
