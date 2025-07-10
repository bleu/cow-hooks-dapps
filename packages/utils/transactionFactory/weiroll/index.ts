// Copied from weiroll repo: https://github.com/weiroll/weiroll.js/blob/main/src/planner.ts

import { SupportedChainId } from "@cowprotocol/cow-sdk";

/**
 * CommandFlags
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandFlags {
  DELEGATECALL = 0,
  CALL = 1,
  STATICCALL = 2,
  CALL_WITH_VALUE = 3,
  CALLTYPE_MASK = 3,
  EXTENDED_COMMAND = 64,
  TUPLE_RETURN = 128,
}

export const WEIROLL_ADDRESS_MAP: Record<SupportedChainId | 137, string> = {
  [SupportedChainId.MAINNET]: "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963",
  [SupportedChainId.ARBITRUM_ONE]: "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963",
  [SupportedChainId.SEPOLIA]: "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963",
  [SupportedChainId.GNOSIS_CHAIN]: "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963",
  [SupportedChainId.BASE]: "0x93e99CE9ad4b9124CBBBE647DaE88c8E33e857f7",
  [137]: "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963",
};
