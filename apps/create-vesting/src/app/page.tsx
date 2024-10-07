"use client";

import {
  Input,
  PeriodWithScaleInput,
  ButtonPrimary,
  ContentWrapper,
  TokenAmountInput,
  Wrapper,
} from "@bleu/cow-hooks-ui";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { Form } from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createVestingSchema, periodScaleOptions } from "#/utils/schema";

import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import { useRouter } from "next/navigation";

// TODO: fetch real token
const tokenAddress = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d";
const tokenSymbol = "WXDAI";
const tokenDecimals = 18;
const vestingEscrowFactoryAddress =
  "0x62E13BE78af77C86D38a027ae432F67d9EcD4c10";

type CreateVestingFormData = typeof createVestingSchema._type;

export default function Page() {
  const { actions, context, setHookInfo } = useIFrameContext();
  const router = useRouter();

  const form = useForm<CreateVestingFormData>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      period: 1,
      periodScale: "Day",
    },
  });

  const getHooksTransactions = useGetHooksTransactions();

  const onSubmitCallback = useCallback(
    async (data: CreateVestingFormData) => {
      if (!context) return;
      console.log("data", data);
      const hookInfo = await getHooksTransactions({
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        vestingEscrowFactoryAddress,
        formData: data,
      });
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [context?.account]
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback]
  );

  const inputStep = tokenDecimals;

  return (
    <>
      {context && (
        <Form {...form} onSubmit={onSubmit} className="contents">
          <Wrapper>
            <ContentWrapper>
              <Input
                name="recipient"
                label="Recipient"
                placeholder="0xabc..."
                autoComplete="off"
                className="h-12 p-2.5 rounded-xl bg-color-paper-darker border-none placeholder:opacity-100"
              />
              <br />
              <div className="flex gap-4 w-full">
                <PeriodWithScaleInput
                  periodScaleOptions={periodScaleOptions}
                  namePeriodValue="period"
                  namePeriodScale="periodScale"
                  label="Period"
                  validation={{ valueAsNumber: true, required: true }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                />
                <TokenAmountInput
                  name="amount"
                  type="number"
                  step={`0.${"0".repeat(tokenDecimals - 1)}1`}
                  tokenSymbol={tokenSymbol}
                  label="Amount"
                  placeholder="0.0"
                  autoComplete="off"
                  validation={{ valueAsNumber: true, required: true }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                />
              </div>
              <br />
            </ContentWrapper>
            <ButtonPrimary type="submit">
              <span>{context?.hookToEdit ? "Edit Hook" : "Add hook"}</span>
            </ButtonPrimary>
          </Wrapper>
        </Form>
      )}
    </>
  );
}
