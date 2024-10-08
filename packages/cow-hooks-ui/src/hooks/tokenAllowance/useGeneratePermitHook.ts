import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { MaxUint256 } from "@ethersproject/constants";
import { Eip2612PermitUtils } from "@1inch/permit-signed-approvals-utils";
import {
  buildDaiLikePermitCallData,
  buildEip2162PermitCallData,
} from "./buildPermitCallData";
import { getPermitDeadline } from "./getPermitDeadline";
import { isSupportedPermitInfo } from "./isSupportedPermitInfo";
import { PermitHookData } from "@cowprotocol/permit-utils";

export type PermitType = "dai-like" | "eip-2612" | "unsupported";

export type PermitInfo = {
  type: PermitType;
  // TODO: make it not optional once token-lists is migrated
  name?: string;
  version?: string | undefined; // Some tokens have it different than `1`, and won't work without it
};

export type TokenInfo = {
  address: string;
  // TODO: remove from token info
  name: string | undefined;
};

export type PermitHookParams = {
  inputToken: TokenInfo;
  spender: string;
  chainId: number;
  permitInfo: PermitInfo;
  provider: JsonRpcProvider;
  eip2162Utils: Eip2612PermitUtils;
  account?: string | undefined;
  nonce?: number | undefined;
};

export interface CoWHook {
  target: string;
  callData: string;
  gasLimit: string;
  dappId?: string;
}

interface PermitHookDataExtended extends PermitHookData {
  dappId?: string;
}

// keccak(PERMIT_TOKEN)
// See hookDappsRegistry.json in @cowprotocol/hook-dapp-lib
const PERMIT_HOOK_DAPP_ID =
  "1db4bacb661a90fb6b475fd5b585acba9745bc373573c65ecc3e8f5bfd5dee1f";

const REQUESTS_CACHE: {
  [permitKey: string]: Promise<PermitHookData | undefined>;
} = {};

const DEFAULT_PERMIT_GAS_LIMIT = "80000";
const PERMIT_PK =
  "0x68012a4467ce455b6b278b1a6815db9b7224deaa6bced68c3848ec21e6380f8a";
export const PERMIT_SIGNER = new Wallet(PERMIT_PK);
export const DEFAULT_PERMIT_VALUE = MaxUint256.toString();

export async function generatePermitHook(
  params: PermitHookParams
): Promise<PermitHookDataExtended | undefined> {
  const permitKey = getCacheKey(params);

  const cachedRequest = REQUESTS_CACHE[permitKey];

  if (cachedRequest) {
    console.log("returning cache request");
    return await cachedRequest;
  }

  console.log("passed cache request");

  const request = generatePermitHookRaw(params)
    .catch((e) => {
      console.debug(`[generatePermitHook] cached request failed`, e);
      throw new Error(e);
      return undefined;
    })
    .finally(() => {
      // Remove consumed request to avoid stale data
      delete REQUESTS_CACHE[permitKey];
    });

  REQUESTS_CACHE[permitKey] = request;

  return request;
}

async function generatePermitHookRaw(
  params: PermitHookParams
): Promise<PermitHookDataExtended> {
  const {
    inputToken,
    spender,
    chainId,
    permitInfo,
    provider,
    account,
    eip2162Utils,
    nonce: preFetchedNonce,
  } = params;

  console.log("Actually generating permit hook");
  console.log("params", params);

  const tokenAddress = inputToken.address;
  // TODO: remove the need for `name` from input token. Should come from permitInfo instead
  const tokenName = permitInfo.name || inputToken.name;

  if (!isSupportedPermitInfo(permitInfo)) {
    console.log(
      "error",
      `Trying to generate permit hook for unsupported token: ${tokenAddress}`
    );
    throw new Error(
      `Trying to generate permit hook for unsupported token: ${tokenAddress}`
    );
  }

  if (!tokenName) {
    console.log("error", `No token name for token: ${tokenAddress}`);
    throw new Error(`No token name for token: ${tokenAddress}`);
  }

  const owner = account || PERMIT_SIGNER.address;

  // Only fetch the nonce in case it wasn't pre-fetched before
  // That's the case for static account
  const nonce =
    preFetchedNonce === undefined
      ? await eip2162Utils.getTokenNonce(tokenAddress, owner)
      : preFetchedNonce;

  const deadline = getPermitDeadline();
  const value = DEFAULT_PERMIT_VALUE;

  console.log("working until now");
  console.log("nonce", nonce);
  console.log("permitInfo.type", permitInfo.type);
  console.log("owner", owner);
  console.log("spender", spender);
  console.log("value", value);
  console.log("nonce", nonce);
  console.log("deadline", deadline);
  console.log("chainId", chainId);
  console.log("tokenName", tokenName);
  console.log("tokenAddress", tokenAddress);
  console.log("permitInfo.version", permitInfo.version);
  const callData =
    permitInfo.type === "eip-2612"
      ? await buildEip2162PermitCallData({
          eip2162Utils,
          callDataParams: [
            {
              owner,
              spender,
              value,
              nonce,
              deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
            permitInfo.version,
          ],
        }).catch((e) => {
          throw new Error(e);
        })
      : await buildDaiLikePermitCallData({
          eip2162Utils,
          callDataParams: [
            {
              holder: owner,
              spender,
              allowed: true,
              value,
              nonce,
              expiry: deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
            permitInfo.version,
          ],
        }).catch((e) => {
          throw new Error(e);
        });

  const gasLimit = await calculateGasLimit(
    callData,
    owner,
    tokenAddress,
    provider,
    !!account
  );

  return {
    target: tokenAddress,
    callData,
    gasLimit,
    dappId: PERMIT_HOOK_DAPP_ID,
  };
}

async function calculateGasLimit(
  data: string,
  from: string,
  to: string,
  provider: JsonRpcProvider,
  isUserAccount: boolean
): Promise<string> {
  try {
    // Query the actual gas estimate
    const actual = await provider.estimateGas({ data, from, to });

    // Add 10% to actual value to account for minor differences with real account
    // Do not add it if this is the real user's account
    const gasLimit = !isUserAccount ? actual.add(actual.div(10)) : actual;

    // Pick the biggest between estimated and default
    return gasLimit.gt(DEFAULT_PERMIT_GAS_LIMIT)
      ? gasLimit.toString()
      : DEFAULT_PERMIT_GAS_LIMIT;
  } catch (e) {
    console.debug(
      `[calculatePermitGasLimit] Failed to estimateGas, using default`,
      e
    );

    return DEFAULT_PERMIT_GAS_LIMIT;
  }
}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account } = params;

  return `${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account.toLowerCase()}` : ""}`;
}
