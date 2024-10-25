"use client";

import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { WithdrawFormContextProvider } from "@bleu/cow-hooks-ui";
import { PageWrapped } from "./components/PageWrapped";

export default function Page() {
  const getHookInfo = useGetHookInfo();

  return (
    <WithdrawFormContextProvider getHookInfo={getHookInfo}>
      <PageWrapped />
    </WithdrawFormContextProvider>
  );
}
