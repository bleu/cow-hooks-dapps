import type { IHooksInfo } from "@bleu/cow-hooks-ui";
import type { Token } from "@uniswap/sdk-core";
import type { Address } from "viem";
import type { createVestingSchema } from "#/utils/schema";
import { useGetHooksInfoVestAllFromAccount } from "./useGetHooksInfoVestAllFromAccount";
import { useGetHooksInfoVestAllFromSwap } from "./useGetHooksInfoVestAllFromSwap";
import { useGetHooksInfoVestUserAmount } from "./useGetHooksInfoVestUserAmount";

export interface GetHooksTransactionsParams {
  token: Token;
  vestingEscrowFactoryAddress: Address;
  formData: typeof createVestingSchema._type;
}

export function useGetHooksTransactions() {
  const getHooksInfoVestAllFromSwap = useGetHooksInfoVestAllFromSwap();
  const getHooksInfoVestAllFromAccount = useGetHooksInfoVestAllFromAccount();
  const getHooksInfoVestUserAmount = useGetHooksInfoVestUserAmount();

  return async (
    params: GetHooksTransactionsParams,
  ): Promise<IHooksInfo | undefined> => {
    const {
      formData: { vestAllFromAccount, vestAllFromSwap },
    } = params;

    const hooksInfo = vestAllFromAccount
      ? await getHooksInfoVestAllFromAccount(params)
      : vestAllFromSwap
        ? await getHooksInfoVestAllFromSwap(params)
        : getHooksInfoVestUserAmount(params);

    if (!hooksInfo) throw new Error("Error encoding transactions");

    return hooksInfo;
  };
}
