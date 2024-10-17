import { JsonRpcProvider } from "@ethersproject/providers";
import { RPC_URL_MAPPING } from "@bleu/utils/transactionFactory";

const provider = new JsonRpcProvider(RPC_URL_MAPPING[1]);

export async function getAddressByEns(ensName: string): Promise<string | null> {
  try {
    const address = await provider.resolveName(ensName);
    //console.log("address from ENS", address);
    return address;
  } catch (error) {
    console.error("Error getting ENS name", error);
    return null;
  }
}
