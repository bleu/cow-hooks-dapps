import type { Address } from "viem";
import { base, mainnet } from "viem/chains";

export const chainIdToMorphoBundler: Record<number, Address> = {
  [mainnet.id]: "0x4095F064B8d3c3548A3bebfd0Bbfd04750E30077",
  [base.id]: "0x23055618898e202386e6c13955a58D3C68200BFB",
};
