import type { IHooksInfo } from "@bleu/cow-hooks-ui";
import type { Token } from "@uniswap/sdk-core";
import type { Address } from "viem";
import type { createVestingSchema } from "#/utils/schema";
import { useGetHooksInfoVestAll } from "./useGetHooksInfoVestAll";
import { useGetHooksInfoVestAllFromSwap } from "./useGetHooksInfoVestAllFromSwap";
import { useGetHooksInfoVestUserAmount } from "./useGetHooksInfoVestUserAmount";

export interface GetHooksTransactionsParams {
  token: Token;
  vestingEscrowFactoryAddress: Address;
  formData: typeof createVestingSchema._type;
}

export function useGetHooksTransactions() {
  const getHooksInfoVestAllFromSwap = useGetHooksInfoVestAllFromSwap();
  const getHooksInfoVestAll = useGetHooksInfoVestAll();
  const getHooksInfoVestUserAmount = useGetHooksInfoVestUserAmount();

  return async (
    params: GetHooksTransactionsParams,
  ): Promise<IHooksInfo | undefined> => {
    const {
      formData: { vestAll, vestAllFromSwap },
    } = params;

    const hooksInfo = vestAll
      ? await getHooksInfoVestAll(params)
      : vestAllFromSwap
        ? await getHooksInfoVestAllFromSwap(params)
        : getHooksInfoVestUserAmount(params);

    if (!hooksInfo) throw new Error("Error encoding transactions");

    return hooksInfo;
  };
}
