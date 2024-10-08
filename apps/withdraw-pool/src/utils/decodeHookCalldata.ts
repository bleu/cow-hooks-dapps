import { decodeFunctionData } from "viem";
import { cowShedAbi } from "./abis/cowShedAbi";

interface ICalldata {
  allowFailures: boolean;
  callData: string;
  isDelegateCall: boolean;
  target: string;
  value: string;
}

export function findPoolIdOnCallData(string: `0x${string}`) {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: string,
  });

  if (decodedFunctionData.functionName !== "executeHooks") {
    return;
  }

  if (!decodedFunctionData.args?.length) {
    return;
  }

  const calls = decodedFunctionData.args[0] as ICalldata[];

  const lastCallIndex = calls.length - 1;
  const call = calls[lastCallIndex];
  return call.target.toLowerCase();
}
