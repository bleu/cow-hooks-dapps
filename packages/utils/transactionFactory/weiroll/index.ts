// Copied from weiroll repo: https://github.com/EnsoFinance/enso-weiroll.js/blob/25081c263663c035cc773b7d90dfc352b7d7a541/src/planner.ts
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

export const WEIROLL_ADDRESS = "0x53A349b7E27741a12d9aDe861F78De46bb4b828F";
