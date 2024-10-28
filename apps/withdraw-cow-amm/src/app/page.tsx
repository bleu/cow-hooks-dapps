"use client";

import { WithdrawFormContextProvider } from "@bleu/cow-hooks-ui";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { PageWrapped } from "./components/PageWrapped";

export default function Page() {
  const getHookInfo = useGetHookInfo();

  return (
    <WithdrawFormContextProvider getHookInfo={getHookInfo}>
      <PageWrapped />
    </WithdrawFormContextProvider>
  );
}
