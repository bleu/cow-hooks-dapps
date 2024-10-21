import { decodeFunctionData } from "viem";
import { cowShedAbi } from "./abis/cowShedAbi";
import type { withdrawSchema } from "./schema";

interface ICalldata {
  allowFailures: boolean;
  callData: string;
  isDelegateCall: boolean;
  target: string;
  value: string;
}

export async function decodeExitPoolHookCalldata(
  callData: `0x${string}`,
): Promise<typeof withdrawSchema._type> {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: callData,
  });

  if (decodedFunctionData.functionName !== "executeHooks") {
    throw new Error("Invalid function name");
  }

  if (!decodedFunctionData.args?.length) {
    throw new Error("Invalid args length");
  }

  const calls = decodedFunctionData.args[0] as ICalldata[];

  const lastCallIndex = calls.length - 1;
  const call = calls[lastCallIndex];

  const withdrawPct = Number(`0x${callData.slice(-2)}`);

  return {
    poolId: call.target,
    withdrawPct,
  };
}
