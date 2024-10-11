import { IHooksInfo } from "@bleu/cow-hooks-ui";
import { Address } from "viem";
import { createVestingSchema } from "#/utils/schema";
import { Token } from "@uniswap/sdk-core";
import { useGetHooksInfoVestAllFromSwap } from "./useGetHooksInfoVestAllFromSwap";
import { useGetHooksInfoVestAll } from "./useGetHooksInfoVestAll";
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
    params: GetHooksTransactionsParams
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
