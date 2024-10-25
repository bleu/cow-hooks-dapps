import { withdrawSchema } from "./schema";
import { cowShedAbi } from "./transactionFactory/abis/cowShedAbi";
import { decodeFunctionData } from "viem";

interface ICalldata {
  allowFailures: boolean;
  callData: string;
  isDelegateCall: boolean;
  target: string;
  value: string;
}

export async function decodeExitPoolHookCalldata(
  callData: `0x${string}`
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

  const lastCallIndex = calls.length - 3;
  const call = calls[lastCallIndex];

  const withdrawPct = Number(`0x${callData.slice(-2)}`);

  return {
    poolId: call.target,
    withdrawPct,
  };
}
