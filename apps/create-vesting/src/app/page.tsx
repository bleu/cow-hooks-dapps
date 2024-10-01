"use client";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import { ButtonPrimary, ContentWrapper, Wrapper } from "@bleu/cow-hooks-ui";
import { PeriodWithScaleInput } from "form-ui/PeriodWithScaleInput";
import { useEffect, useState } from "react";

import { Input } from "@bleu/cow-hooks-ui";
import {
  Button,
  Form,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

const periodScaleOptions = ["Day", "Week", "Month"];

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
  period: z.number().gt(0),
  periodScale: z
    .string()
    .refine(refinePeriodScale, "Scale must be one of the options"),
});

export default function Page() {
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);

  const isDarkMode = context?.isDarkMode;
  const { account, chainId } = context || {};

  const form = useForm<typeof createVestingSchema._type>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      period: 1,
      periodScale: "Day",
    },
  });

  const { control, formState, handleSubmit } = form;
  const { recipient } = useWatch({ control });
  const { errors, isValid } = formState;

  useEffect(() => {
    const { actions } = initCoWHookDapp({ onContext: setContext });
    setActions(actions);
  }, []);

  useEffect(() => {
    const newTheme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [isDarkMode]);

  // useEffect(() => {
  //   console.log("errors", errors);
  // }, [errors]);

  const addHook = () => {
    // if (!actions) return;

    const hook = {
      target: "",
      callData: "",
      gasLimit: "",
    };

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
                className="w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border bg-color-paper-darker"
              />
              <br />
              <PeriodWithScaleInput
                periodScaleOptions={periodScaleOptions}
                namePeriodValue="period"
                namePeriodScale="periodScale"
                label="Period"
                validation={{ valueAsNumber: true }}
              />
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
