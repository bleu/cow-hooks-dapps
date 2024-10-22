import type { FormType } from "#/types";
import { hexToNumber } from "viem";

export const decodeCalldata = (string: `0x${string}`): FormType => {
  const encodedFormData = string.slice(-288);

  const poolId = `0x${encodedFormData.slice(0, 40)}`;
  const token1 = `0x${encodedFormData.slice(40, 80)}`;
  const token2 = `0x${encodedFormData.slice(80, 120)}`;

  const amount1 =
    hexToNumber(`0x${encodedFormData.slice(120, 184)}`) / 10 ** 18;
  const amount2 =
    hexToNumber(`0x${encodedFormData.slice(184, 248)}`) / 10 ** 18;

  const amounts = {
    [token1]: amount1,
    [token2]: amount2,
  };

  const referenceTokenAddress = `0x${encodedFormData.slice(248, 288)}`;

  const result = {
    poolId,
    amounts,
    referenceTokenAddress,
  } as FormType;
  console.log({ result });

  return result;
};
