import { Address, erc20Abi, PublicClient } from "viem";
import { useCallback } from "react";
import { BigNumber, Signer } from "ethers";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import {
  generatePermitHook,
  getPermitUtilsInstance,
  getTokenPermitInfo,
  GetTokenPermitIntoResult,
  PermitInfo,
} from "@cowprotocol/permit-utils";
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
      if (currentAllowance === undefined || !tokenName) {
        throw new Error("Token allowance not available");
      }

      if (amount <= BigNumber.from(currentAllowance)) {
        // amount is less than or equal to current allowance so no need to approve
        return;
      }

      const { chainId, account } = context;

      const web3Provider = new Web3Provider(window.ethereum);
      async function connectWallet() {
        if (typeof window.ethereum !== "undefined") {
          try {
            // Request account access
            await window.ethereum.request({ method: "eth_requestAccounts" });
          } catch (error) {
            console.error("User denied account access");
          }
        } else {
          console.log("Please install MetaMask!");
        }
      }

      await connectWallet();

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
        web3Provider,
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
        //provider: jsonRpcProvider,
        provider: web3Provider,
        permitInfo,
        eip2162Utils: eip2162Utils,
        account,
        nonce,
      });
      if (!hook) throw new Error("Couldn't build hook");
      console.log(hook);
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
