import type { MorphoVault } from "@bleu/cow-hooks-ui";
import { decodeAbiParameters, formatUnits } from "viem";
import type { DepositMorphoFormData } from "#/contexts/form";
import { encodingParams } from "./encodeFormData";

export const decodeCalldata = async (
  string: `0x${string}`,
  vaults: MorphoVault[],
): Promise<DepositMorphoFormData> => {
  const encodedFormData =
    `0x${string.slice(-64 * encodingParams.length)}` as `0x${string}`;

  const [vaultId, amountBigInt] = decodeAbiParameters(
    encodingParams,
    encodedFormData,
  );

  const vault = vaults.find((v) => v.address === vaultId);

  const amount = vault && formatUnits(amountBigInt, vault.asset.decimals);

  return {
    vault,
    amount,
  } as DepositMorphoFormData;
};
