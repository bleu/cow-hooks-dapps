"use client";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import {
  Input,
  PeriodWithScaleInput,
  ButtonPrimary,
  ContentWrapper,
  TokenAmountInput,
  Wrapper,
} from "@bleu/cow-hooks-ui";

import { useEffect, useState } from "react";

import { Form } from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

const periodScaleOptions = ["Day", "Week", "Month"];

//will be used
const scaleToSecondsMapping = {
  Day: 24 * 60 * 60,
  Week: 7 * 24 * 60 * 60,
  Month: 30 * 24 * 60 * 60,
};

const refinePeriodScale = (value: string) => {
  return periodScaleOptions.includes(value);
};

export const createVestingSchema = z.object({
  recipient: z
    .string()
    .min(1, "Address is required")
    .refine(isAddress, "Insert a valid Ethereum address"),
  period: z
    .number({ message: "Invalid amount" })
    .gt(0, "Period must be greater than 0"),
  periodScale: z
    .string()
    .refine(refinePeriodScale, "Scale must be one of the options"),
  amount: z
    .number({ message: "Invalid amount" })
    .gt(0, "Amount must be greater than 0"),
});

export default function Page() {
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);

  const isDarkMode = context?.isDarkMode;
  // will be used
  const { account, chainId } = context || {};

  const form = useForm<typeof createVestingSchema._type>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      period: 1,
      periodScale: "Day",
    },
  });

  const { handleSubmit } = form;

  useEffect(() => {
    const { actions } = initCoWHookDapp({ onContext: setContext });
    setActions(actions);
  }, []);

  useEffect(() => {
    const newTheme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [isDarkMode]);

  const addHook = () => {
    if (!actions) return;

    const hook = {
      target: "",
      callData: "",
      gasLimit: "",
    };
    // will be used
    // if (context?.hookToEdit) {
    //   actions.editHook({ hook, uuid: context.hookToEdit.uuid });
    // } else {
    //   actions.addHook({ hook });
    // }
  };

  function onSubmit(data: typeof createVestingSchema._type) {
    if (!context) return;
    console.log("data", data);
    addHook();
  }

  return (
    <>
      {context && (
        <Form {...form} className="contents">
          <Wrapper>
            <ContentWrapper>
              <Input
                name="recipient"
                label="Recipient"
                placeholder="0xabc..."
                autoComplete="off"
                className="w-full h-12 mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border bg-color-paper-darker placeholder:opacity-100"
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
            <ButtonPrimary type="submit" onClick={handleSubmit(onSubmit)}>
              <span>{context?.hookToEdit ? "Edit Hook" : "Add hook"}</span>
            </ButtonPrimary>
          </Wrapper>
        </Form>
      )}
    </>
  );
}
