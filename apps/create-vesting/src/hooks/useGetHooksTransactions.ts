import { IHooksInfo } from "@bleu/cow-hooks-ui";
import { Address } from "viem";
import { createVestingSchema } from "#/utils/schema";
import { Token } from "@uniswap/sdk-core";
import { useTokenAmountTypeContext } from "#/context/TokenAmountType";
import { useGetHooksInfoVestAllFromSwap } from "./useGetHooksInfoVestAllFromSwap";
import { useGetHooksInfoVestUserAmount } from "./useGetHooksInfoVestUserAmount";

export interface GetHooksTransactionsParams {
  token: Token;
  vestingEscrowFactoryAddress: Address;
  formData: typeof createVestingSchema._type;
}

export function useGetHooksTransactions() {
  const getHooksInfoVestAllFromSwap = useGetHooksInfoVestAllFromSwap();
  const getHooksInfoVestUserAmount = useGetHooksInfoVestUserAmount();

  return async (
    params: GetHooksTransactionsParams
  ): Promise<IHooksInfo | undefined> => {
    const hooksInfo = params.formData.vestAllFromSwap
      ? await getHooksInfoVestAllFromSwap(params)
      : await getHooksInfoVestUserAmount(params);

    if (!hooksInfo) throw new Error("Error encoding transactions");

    return hooksInfo;
  };
}
