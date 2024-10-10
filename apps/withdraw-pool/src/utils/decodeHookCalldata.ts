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

export async function decodeHookCallData(
  string: `0x${string}`,
  publicClient: PublicClient,
  user: Address
): Promise<typeof withdrawSchema._type | undefined> {
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

  const decodedCoWAmmCallData = decodeFunctionData({
    abi: cowAmmAbi,
    data: call.callData as `0x${string}`,
  });

  const poolAddress = call.target;

  if (decodedCoWAmmCallData.functionName !== "exitPool") {
    return;
  }

  if (!decodedCoWAmmCallData.args?.length) {
    return;
  }

  const bptAmountToExit = decodedCoWAmmCallData.args[0] as bigint;

  const userPoolBalance = (await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: cowAmmAbi,
    functionName: "balanceOf",
    args: [user],
  })) as bigint;

  const withdrawPct = getPctFromValue(bptAmountToExit, userPoolBalance);

  return {
    poolId: call.target,
    withdrawPct,
  };
}
