import { decodeFunctionData, type Address, type PublicClient } from "viem";
import type { CreateVestingFormData } from "./schema";
import {
  cowShedAbi,
  vestingEscrowFactoryAbi,
  weirollAbi,
} from "@bleu/utils/transactionFactory";
import { scaleToSecondsMapping } from "./scaleToSecondsMapping";

export const decodeCalldata = async (
  string: `0x${string}`,
  publicClient: PublicClient,
  user: Address,
  tokenDecimals: number,
): Promise<CreateVestingFormData> => {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: string,
  });

  const result = {} as CreateVestingFormData;

  if (!decodedFunctionData?.args)
    throw new Error("error decoding cowShed calldata");

  let createVestingData: {
    args: readonly unknown[] | undefined;
    functionName: string;
  };

  let weirollData: {
    args: readonly unknown[] | undefined;
    functionName: string;
  };

  // First scenario: vestUserInput -> decode create vesting contract
  try {
    createVestingData = decodeFunctionData({
      abi: vestingEscrowFactoryAbi,
      data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
    });

    const args = createVestingData.args;
    if (!args) throw new Error("decode has no args");

    result.recipient = args[1] as string;
    result.amount = Number(args[2]) / 10 ** tokenDecimals;
    result.period = Number(args[3]) / scaleToSecondsMapping.Day;
    result.periodScale = "Day";
    result.vestUserInput = true;
    result.vestAllFromSwap = false;
    result.vestAllFromAccount = false;

    if (!result)
      throw new Error(
        "Could not compute result by decoding create vesting ABI",
      );
    return result;
  } catch {}

  // Second scenario: vestAllFromSwap -> decode weiroll contract
  try {
    weirollData = decodeFunctionData({
      abi: weirollAbi,
      data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
    });

    const args = weirollData?.args;
    if (!args) throw new Error("decode has no args");

    // The number of states in a vestAllFromSwap is 4
    if (args[1].length !== 4)
      throw new Error("type of vesting was vestAllFromAccount");

    result.recipient = `0x${args[1][2].slice(-40)}` as string;
    result.amount = undefined;
    result.period = Number.parseInt(args[1][3]) / scaleToSecondsMapping.Day;
    result.periodScale = "Day";
    result.vestUserInput = false;
    result.vestAllFromSwap = true;
    result.vestAllFromAccount = false;
    return result;
  } catch {}

  // Third scenario: vestAllFromAccount -> decode weiroll contract
  try {
    weirollData = decodeFunctionData({
      abi: weirollAbi,
      data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
    });

    const args = weirollData?.args;
    if (!args) throw new Error("decode has no args");

    // The number of states in a vestAllFromAccount is 6
    if (args[1].length !== 6) throw new Error("Unknown type of transaction");

    result.recipient = `0x${args[1][3].slice(-40)}` as string;
    result.amount = undefined;
    result.period = Number.parseInt(args[1][4]) / scaleToSecondsMapping.Day;
    result.periodScale = "Day";
    result.vestUserInput = false;
    result.vestAllFromSwap = false;
    result.vestAllFromAccount = true;
    return result;
  } catch {}

  throw new Error("Couldn't decode cowShed callData");
};
