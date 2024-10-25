import {
  cowShedAbi,
  vestingEscrowFactoryAbi,
  weirollAbi,
} from "@bleu/utils/transactionFactory";
import { type DecodeFunctionDataReturnType, decodeFunctionData } from "viem";
import { scaleToSecondsMapping } from "./scaleToSecondsMapping";
import { type CreateVestingFormData, periodScaleOptions } from "./schema";

function recoverPeriodFieldFromSeconds(periodInSeconds: number) {
  let largestScaleThatFitsValue: (typeof periodScaleOptions)[number] =
    periodScaleOptions[0];
  for (const scale of periodScaleOptions) {
    if (periodInSeconds % scaleToSecondsMapping[scale] === 0) {
      largestScaleThatFitsValue = scale;
    } else {
      break;
    }
  }

  return {
    period: periodInSeconds / scaleToSecondsMapping[largestScaleThatFitsValue],
    periodScale: largestScaleThatFitsValue,
  };
}

export const decodeCalldata = async (
  string: `0x${string}`,
  tokenDecimals: number,
): Promise<CreateVestingFormData> => {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: string,
  });

  if (!decodedFunctionData?.args)
    throw new Error("error decoding cowShed calldata");

  // First scenario: vestUserInput -> decode create vesting contract
  try {
    const result = decodeVestFromUserInput(decodedFunctionData, tokenDecimals);
    return result;
  } catch {}

  // Second scenario: vestAllFromSwap -> decode weiroll contract
  try {
    const result = decodeVestAllFromSwap(decodedFunctionData);
    return result;
  } catch {}

  // Third scenario: vestAllFromAccount -> decode weiroll contract
  try {
    const result = decodeVestAllFromAccount(decodedFunctionData);
    return result;
  } catch {}

  throw new Error("Couldn't recover hook params");
};

const decodeVestFromUserInput = (
  decodedFunctionData: DecodeFunctionDataReturnType,
  tokenDecimals: number,
) => {
  const result = {} as CreateVestingFormData;

  const createVestingData = decodeFunctionData({
    abi: vestingEscrowFactoryAbi,
    //@ts-ignore
    data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
  });

  const args = createVestingData.args;
  if (!args) throw new Error("decode has no args");

  const { period, periodScale } = recoverPeriodFieldFromSeconds(
    //@ts-ignore
    Number(args[3]),
  );

  result.recipient = args[1] as string;
  result.amount = Number(args[2]) / 10 ** tokenDecimals;
  result.period = period;
  result.periodScale = periodScale;
  result.vestUserInput = true;
  result.vestAllFromSwap = false;
  result.vestAllFromAccount = false;

  if (!result)
    throw new Error("Could not compute result by decoding create vesting ABI");
  return result;
};

const decodeVestAllFromSwap = (
  decodedFunctionData: DecodeFunctionDataReturnType,
) => {
  const result = {} as CreateVestingFormData;

  const weirollData = decodeFunctionData({
    abi: weirollAbi,
    //@ts-ignore
    data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
  });

  const args = weirollData?.args;
  if (!args) throw new Error("decode has no args");

  // The number of states in a vestAllFromSwap is 4
  //@ts-ignore
  if (args[1].length !== 4)
    throw new Error("type of vesting was vestAllFromAccount");

  const { period, periodScale } = recoverPeriodFieldFromSeconds(
    //@ts-ignore
    Number.parseInt(args[1][3]),
  );

  //@ts-ignore
  result.recipient = `0x${args[1][2].slice(-40)}` as string;
  result.amount = undefined;
  result.period = period;
  result.periodScale = periodScale;
  result.vestUserInput = false;
  result.vestAllFromSwap = true;
  result.vestAllFromAccount = false;
  return result;
};

const decodeVestAllFromAccount = (
  decodedFunctionData: DecodeFunctionDataReturnType,
) => {
  const result = {} as CreateVestingFormData;

  const weirollData = decodeFunctionData({
    abi: weirollAbi,
    //@ts-ignore
    data: decodedFunctionData.args[0].at(-1).callData as `0x${string}`,
  });
  const args = weirollData?.args;
  if (!args) throw new Error("decode has no args");

  // The number of states in a vestAllFromAccount is 6
  //@ts-ignore
  if (args[1].length !== 6) throw new Error("Unknown type of transaction");

  const { period, periodScale } = recoverPeriodFieldFromSeconds(
    //@ts-ignore
    Number.parseInt(args[1][4]),
  );

  //@ts-ignore
  result.recipient = `0x${args[1][3].slice(-40)}` as string;
  result.amount = undefined;
  //@ts-ignore
  result.period = period;
  result.periodScale = periodScale;
  result.vestUserInput = false;
  result.vestAllFromSwap = false;
  result.vestAllFromAccount = true;
  return result;
};
