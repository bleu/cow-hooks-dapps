import { getAddressByEns } from "@bleu/cow-hooks-ui";
import { isAddress } from "viem";

export const validateRecipient = async (recipient: string) => {
  if (isAddress(recipient)) return recipient;

  let address: string | null;
  try {
    address = await getAddressByEns(recipient);
    if (!address) {
      throw new Error("Insert a valid ENS name");
    }
    return address;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Error resolving ENS name");
  }
};
