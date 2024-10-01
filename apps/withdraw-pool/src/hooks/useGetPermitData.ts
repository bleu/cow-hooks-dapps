import { Address, erc20Abi } from "viem";
import { useTokenContract } from "./useTokenContract";
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

export function useGetPermitData() {
  const { web3Provider, context, publicClient } = useIFrameContext();

  return useCallback(
    async (amount: BigNumber, tokenAddress: Address, spender: Address) => {
      if (!publicClient || !web3Provider || !context?.account) return;

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

      if (!currentAllowance || !tokenName) {
        return;
      }

      if (amount.lte(currentAllowance)) {
        return;
      }

      const { chainId, account } = context;

      const permitInfo = await getTokenPermitInfo({
        spender,
        tokenAddress,
        chainId,
        provider: web3Provider,
      });

      if (!permitInfo || !checkIsPermitInfo(permitInfo)) {
        return;
      }

      const eip2162Utils = getPermitUtilsInstance(
        chainId,
        web3Provider,
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
        provider: web3Provider,
        permitInfo,
        eip2162Utils: eip2162Utils,
        account,
        nonce,
      });
    },
    [web3Provider, context, publicClient]
  );
}

export function checkIsPermitInfo(
  permitInfo: GetTokenPermitIntoResult
): permitInfo is PermitInfo {
  return "type" in permitInfo;
}
