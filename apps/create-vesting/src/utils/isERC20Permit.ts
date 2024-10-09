import { Contract, providers } from "ethers";

const minimalERCAbi = [
  // ERC20 functions
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  // ERC20Permit functions
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function isERC20Permit(
  tokenAddress: string,
  jsonRpcProvider: providers.Provider
): Promise<boolean> {
  const contract = new Contract(tokenAddress, minimalERCAbi, jsonRpcProvider);

  try {
    await contract.DOMAIN_SEPARATOR();
    await contract.nonces("0x0000000000000000000000000000000000000000");
    return true;
  } catch (error) {
    return false;
  }
}
