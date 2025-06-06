export const morphoPublicAllocatorAbi = [
  {
    inputs: [{ internalType: "address", name: "morpho", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AlreadySet", type: "error" },
  { inputs: [], name: "DepositMarketInWithdrawals", type: "error" },
  { inputs: [], name: "EmptyWithdrawals", type: "error" },
  { inputs: [], name: "InconsistentWithdrawals", type: "error" },
  { inputs: [], name: "IncorrectFee", type: "error" },
  {
    inputs: [{ internalType: "Id", name: "id", type: "bytes32" }],
    name: "MarketNotEnabled",
    type: "error",
  },
  {
    inputs: [{ internalType: "Id", name: "id", type: "bytes32" }],
    name: "MaxInflowExceeded",
    type: "error",
  },
  {
    inputs: [{ internalType: "Id", name: "id", type: "bytes32" }],
    name: "MaxOutflowExceeded",
    type: "error",
  },
  { inputs: [], name: "MaxSettableFlowCapExceeded", type: "error" },
  { inputs: [], name: "NotAdminNorVaultOwner", type: "error" },
  {
    inputs: [{ internalType: "Id", name: "id", type: "bytes32" }],
    name: "NotEnoughSupply",
    type: "error",
  },
  {
    inputs: [{ internalType: "Id", name: "id", type: "bytes32" }],
    name: "WithdrawZero",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: true,
        internalType: "Id",
        name: "supplyMarketId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "suppliedAssets",
        type: "uint256",
      },
    ],
    name: "PublicReallocateTo",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      { indexed: true, internalType: "Id", name: "id", type: "bytes32" },
      {
        indexed: false,
        internalType: "uint256",
        name: "withdrawnAssets",
        type: "uint256",
      },
    ],
    name: "PublicWithdrawal",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "SetAdmin",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "SetFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        components: [
          { internalType: "Id", name: "id", type: "bytes32" },
          {
            components: [
              { internalType: "uint128", name: "maxIn", type: "uint128" },
              { internalType: "uint128", name: "maxOut", type: "uint128" },
            ],
            internalType: "struct FlowCaps",
            name: "caps",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct FlowCapsConfig[]",
        name: "config",
        type: "tuple[]",
      },
    ],
    name: "SetFlowCaps",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "feeRecipient",
        type: "address",
      },
    ],
    name: "TransferFee",
    type: "event",
  },
  {
    inputs: [],
    name: "MORPHO",
    outputs: [{ internalType: "contract IMorpho", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "accruedFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "fee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "Id", name: "", type: "bytes32" },
    ],
    name: "flowCaps",
    outputs: [
      { internalType: "uint128", name: "maxIn", type: "uint128" },
      { internalType: "uint128", name: "maxOut", type: "uint128" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      {
        components: [
          {
            components: [
              { internalType: "address", name: "loanToken", type: "address" },
              {
                internalType: "address",
                name: "collateralToken",
                type: "address",
              },
              { internalType: "address", name: "oracle", type: "address" },
              { internalType: "address", name: "irm", type: "address" },
              { internalType: "uint256", name: "lltv", type: "uint256" },
            ],
            internalType: "struct MarketParams",
            name: "marketParams",
            type: "tuple",
          },
          { internalType: "uint128", name: "amount", type: "uint128" },
        ],
        internalType: "struct Withdrawal[]",
        name: "withdrawals",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "address", name: "loanToken", type: "address" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "address", name: "irm", type: "address" },
          { internalType: "uint256", name: "lltv", type: "uint256" },
        ],
        internalType: "struct MarketParams",
        name: "supplyMarketParams",
        type: "tuple",
      },
    ],
    name: "reallocateTo",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      { internalType: "address", name: "newAdmin", type: "address" },
    ],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      { internalType: "uint256", name: "newFee", type: "uint256" },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      {
        components: [
          { internalType: "Id", name: "id", type: "bytes32" },
          {
            components: [
              { internalType: "uint128", name: "maxIn", type: "uint128" },
              { internalType: "uint128", name: "maxOut", type: "uint128" },
            ],
            internalType: "struct FlowCaps",
            name: "caps",
            type: "tuple",
          },
        ],
        internalType: "struct FlowCapsConfig[]",
        name: "config",
        type: "tuple[]",
      },
    ],
    name: "setFlowCaps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vault", type: "address" },
      {
        internalType: "address payable",
        name: "feeRecipient",
        type: "address",
      },
    ],
    name: "transferFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
