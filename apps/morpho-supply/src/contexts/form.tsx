"use client";

import { type PropsWithChildren, useCallback } from "react";

import { Form } from "@bleu.builders/ui";
import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { useForm } from "react-hook-form";

export interface MorphoSupplyFormData {
  market: MorphoMarket;
  amount: string;
}

export function FormContextProvider({ children }: PropsWithChildren) {
  const form = useForm<MorphoSupplyFormData>({});

  const { handleSubmit } = form;

  const onSubmitCallback = useCallback(async () => {}, []);

  return (
    <Form
      className="w-full justify-center flex h-full"
      onSubmit={handleSubmit(onSubmitCallback)}
      {...form}
    >
      {children}
    </Form>
  );
}
