// Copied from weiroll repo: https://github.com/weiroll/weiroll.js/blob/main/src/planner.ts
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

export const WEIROLL_ADDRESS = "0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963";
