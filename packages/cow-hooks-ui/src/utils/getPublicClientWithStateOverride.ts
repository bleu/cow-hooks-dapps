import type {
  CallParameters,
  MulticallParameters,
  PublicClient,
  ReadContractParameters,
  StateOverride,
} from "viem";

export function getPublicClientWithStateOverride(
  publicClient: PublicClient,
  stateOverride: StateOverride | undefined,
) {
  return {
    ...publicClient,

    call: async (args: CallParameters) => {
      return publicClient.call({
        ...args,
        stateOverride,
      });
    },

    multicall: async (args: MulticallParameters) => {
      return publicClient.multicall({
        ...args,
        stateOverride,
      });
    },

    readContract: async (args: ReadContractParameters) => {
      return publicClient.readContract({
        ...args,
        stateOverride,
      });
    },
  } as PublicClient;
}
