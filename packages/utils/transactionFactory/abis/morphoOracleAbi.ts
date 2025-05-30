export const morphoOracleAbi = [
  {
    inputs: [
      { internalType: "contract IERC4626", name: "vault", type: "address" },
      {
        internalType: "contract AggregatorV3Interface",
        name: "baseFeed1",
        type: "address",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "baseFeed2",
        type: "address",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "quoteFeed1",
        type: "address",
      },
      {
        internalType: "contract AggregatorV3Interface",
        name: "quoteFeed2",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "vaultConversionSample",
        type: "uint256",
      },
      { internalType: "uint256", name: "baseTokenDecimals", type: "uint256" },
      { internalType: "uint256", name: "quoteTokenDecimals", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "MathOverflowedMulDiv", type: "error" },
  {
    inputs: [],
    name: "BASE_FEED_1",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BASE_FEED_2",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "QUOTE_FEED_1",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "QUOTE_FEED_2",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SCALE_FACTOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VAULT",
    outputs: [{ internalType: "contract IERC4626", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VAULT_CONVERSION_SAMPLE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
