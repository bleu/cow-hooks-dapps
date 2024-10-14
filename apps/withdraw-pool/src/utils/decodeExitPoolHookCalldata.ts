import { Address, decodeFunctionData, PublicClient } from "viem";
import { cowShedAbi } from "./abis/cowShedAbi";
import { withdrawSchema } from "./schema";
import { cowAmmAbi } from "./abis/cowAmmAbi";
import { getPctFromValue } from "./math";

interface ICalldata {
  allowFailures: boolean;
  callData: string;
  isDelegateCall: boolean;
  target: string;
  value: string;
}

export async function decodeExitPoolHookCalldata(
  string: `0x${string}`,
  publicClient: PublicClient,
  user: Address
): Promise<typeof withdrawSchema._type> {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: string,
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

  const decodedCoWAmmCallData = decodeFunctionData({
    abi: cowAmmAbi,
    data: call.callData as `0x${string}`,
  });

  const poolAddress = call.target;

  if (decodedCoWAmmCallData.functionName !== "exitPool") {
    throw new Error("Invalid decoded function name");
  }

  if (!decodedCoWAmmCallData.args?.length) {
    throw new Error("Invalid decoded args name");
  }

  const bptAmountToExit = decodedCoWAmmCallData.args[0] as bigint;

  const bptUserPoolBalance = (await publicClient.readContract({
    address: poolAddress as Address,
    abi: cowAmmAbi,
    functionName: "balanceOf",
    args: [user],
  })) as bigint;

  const withdrawPct = getPctFromValue(bptAmountToExit, bptUserPoolBalance);

  return {
    poolId: call.target,
    withdrawPct,
  };
}
