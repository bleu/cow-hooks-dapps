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
import { useForm } from "react-hook-form";

import { createVestingSchema, periodScaleOptions } from "#/utils/schema";

//will be used
import { scaleToSecondsMapping } from "#/utils/scaleToSecondsMapping";

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
                  tokenSymbol="ETH"
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
