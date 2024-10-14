export const weirollAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "command_index", type: "uint256" },
      { internalType: "address", name: "target", type: "address" },
      { internalType: "string", name: "message", type: "string" },
    ],
    name: "ExecutionFailed",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes32[]", name: "commands", type: "bytes32[]" },
      { internalType: "bytes[]", name: "state", type: "bytes[]" },
    ],
    name: "execute",
    outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
];
