import { formatUnits } from "viem";
import type { Vault } from "@bleu/cow-hooks-ui";
import type { DepositMorphoFormData } from "#/contexts/form";

export const decodeCalldata = async (
  string: `0x${string}`,
  vaults: Vault[]
): Promise<DepositMorphoFormData> => {
  const encodedFormData = string.slice(-104);

  const vaultId = `0x${encodedFormData.slice(0, 40)}`;
  const amountString = `0x${encodedFormData.slice(40, 104)}`;

  const vault = vaults.find((v) => v.address === vaultId);

  const amount =
    vault && formatUnits(BigInt(amountString), vault.asset.decimals);

  return {
    vault,
    amount,
  } as DepositMorphoFormData;
};
