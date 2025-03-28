import { RPC_URL_MAPPING } from "@bleu/utils/transactionFactory";
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new JsonRpcProvider(RPC_URL_MAPPING[1]);

export async function getAddressByEns(ensName: string): Promise<string | null> {
  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error("Error getting ENS name", error);
    return null;
  }
}
