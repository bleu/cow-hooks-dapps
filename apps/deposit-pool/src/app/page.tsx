"use client";

import { Button, Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { depositSchema, depositSchemaType } from "#/utils/schema";
import {
  IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { useTokenPools } from "#/hooks/useTokenPools";
import { PoolItemInfo } from "#/components/PoolItemInfo";
import { TokenAmountInputs } from "#/components/TokenAmountInputs";

export default function Page() {
  const { context } = useIFrameContext();
  const { data: pools, isLoading: isLoadingPools } = useTokenPools(
    context?.chainId,
    context?.orderParams?.buyTokenAddress
  );

  const form = useForm<depositSchemaType>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      poolId: "",
    },
  });

  const {
    setValue,
    control,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const { poolId } = useWatch({ control });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

  const onSubmitCallback = useCallback(async (data: depositSchemaType) => {
    console.log(data);
  }, []);

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback]
  );

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (isLoadingPools) {
    return (
      <div className="text-center mt-10 p-2">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!context?.orderParams?.buyTokenAddress) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Please specify your swap order before proceeding</span>
      </div>
    );
  }

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        PoolItemInfo={PoolItemInfo}
        pools={pools || []}
        selectedPool={selectedPool}
      />
      {selectedPool && (
        <div className="size-full flex flex-col gap-2">
          <TokenAmountInputs pool={selectedPool} />
          <Button
            type="submit"
            className="my-2 rounded-xl text-lg min-h-[58px]"
            loading={isSubmitting || isSubmitSuccessful}
            loadingText="Creating hook..."
          >
            Add post-hook
          </Button>
        </div>
      )}
    </Form>
  );
}
