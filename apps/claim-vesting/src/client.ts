import { createPublicClient, http } from "viem";
import { gnosis } from "viem/chains";

export const publicClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});
