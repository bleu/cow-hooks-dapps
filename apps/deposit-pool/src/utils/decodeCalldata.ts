import { cowShedAbi } from "@bleu/utils/transactionFactory";
import { decodeFunctionData } from "viem";
import type { FormType } from "#/types";

export const decodeCalldata = async (
  string: `0x${string}`,
): Promise<FormType> => {
  const decodedFunctionData = decodeFunctionData({
    abi: cowShedAbi,
    data: string,
  });

  if (!decodedFunctionData?.args)
    throw new Error("error decoding cowShed calldata");

  // const decodedDeposit = decodeFunctionData({
  //   abi: simplePoolAbi
  //   data: decodedFunctionData?.args[0].at(-1),
  // });

  console.log({ args: decodedFunctionData?.args });
  const result = {} as FormType;
  return result;
};
