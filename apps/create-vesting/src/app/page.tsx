"use client";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import { ButtonPrimary, ContentWrapper, Wrapper } from "@bleu/cow-hooks-ui";
import { AddressInput } from "form-ui/AddressInput";
import { useEffect, useState } from "react";

import { Input } from "@bleu/cow-hooks-ui";
import { Button, Form } from "@bleu/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

export const createVestingSchema = z.object({
  recipient: z
    .string()
    .min(1, "Address is required")
    .refine((value: string) => {
      console.log("refining", value);
      return value === "" || isAddress(value);
    }, "Insert a valid Ethereum address"),
});

export default function Page() {
  // const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  // const [context, setContext] = useState<HookDappContext | null>(null);

  // @ts-ignore
  // const isDarkMode = context?.isDarkMode;
  // const { account, chainId } = context || {};

  const form = useForm<typeof createVestingSchema._type>({
    resolver: zodResolver(createVestingSchema),
    defaultValues: {
      recipient: "",
    },
  });

  const { setValue, control, register, formState, handleSubmit } = form;
  const { recipient } = useWatch({ control });
  const { errors, isValid } = formState;

  // useEffect(() => {
  //   const { actions } = initCoWHookDapp({ onContext: setContext });
  //   setActions(actions);
  // }, []);

  // useEffect(() => {
  //   const newTheme = isDarkMode ? "dark" : "light";
  //   document.documentElement.setAttribute("data-theme", newTheme);
  // }, [isDarkMode]);

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

  function onSubmit() {
    // if (!context) return;
    addHook();
  }

  return (
    <>
      {/* {context && ( */}
      <Form {...form} className="contents">
        <Wrapper>
          <ContentWrapper>
            <Input
              name="recipient"
              type="text"
              placeholder="0xabc..."
              autoComplete="off"
              className="w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border bg-color-paper-darker"
            />
          </ContentWrapper>
          <ButtonPrimary type="submit" onClick={handleSubmit(onSubmit)}>
            {/* <span>{context?.hookToEdit ? "Edit Hook" : "Add hook"}</span> */}
          </ButtonPrimary>
        </Wrapper>
      </Form>
      {/* )} */}
    </>
  );
}
