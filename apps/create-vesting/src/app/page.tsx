"use client";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import { ChevronDownIcon } from "@radix-ui/react-icons";

import { ButtonPrimary, ContentWrapper, Wrapper } from "@bleu/cow-hooks-ui";
import { AddressInput } from "form-ui/AddressInput";
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

  const { control, formState, handleSubmit } = form;
  const { recipient } = useWatch({ control });
  const { errors, isValid } = formState;

  const [open, setOpen] = useState(false);
  const [periodScale, setPeriodScale] = useState("Days");

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

  function onSubmit(data: typeof createVestingSchema._type) {
    // if (!context) return;
    console.log("data", data);
    addHook();
  }

  const periodScaleOptions = ["Days", "Weeks", "Months"];

  return (
    <>
      {/* {context && ( */}
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
            <div className="flex w-48">
              <Input
                name="period"
                type="number"
                autoComplete="off"
                className="outline-none text-right w-24 h-10 p-2.5 rounded-l-xl rounded-r-none text-base text-color-text-paper border-2 border-color-border bg-color-paper [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="w-full">
                  <div className="flex flex-col">
                    <div
                      className="w-24 h-10 p-2.5 flex items-center justify-between border-2 border-l-0 rounded-r-xl text-color-text-paper border-color-border bg-color-paper"
                      onClick={() => setOpen(true)}
                    >
                      <span className="m-0 p-0 min-h-fit">{periodScale} </span>
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col w-[100px] bg-color-paper-darker">
                  {periodScaleOptions.map((periodScale) => {
                    return (
                      <button
                        key={periodScale}
                        className="text-start p-2 hover:bg-color-paper"
                        onClick={() => {
                          setOpen(false);
                          setPeriodScale(periodScale);
                        }}
                      >
                        {periodScale}{" "}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
            </div>
          </ContentWrapper>
          <ButtonPrimary type="submit" onClick={handleSubmit(onSubmit)}>
            {/* <span>{context?.hookToEdit ? "Edit Hook" : "Add hook"}</span> */}
            Add Hook
          </ButtonPrimary>
        </Wrapper>
      </Form>
      {/* )} */}
    </>
  );
}
