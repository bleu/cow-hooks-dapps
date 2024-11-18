"use client";

import { RootLayout, WithdrawFormContextProvider } from "@bleu/cow-hooks-ui";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import "@bleu/cow-hooks-ui/global.css";
import Head from "next/head";

import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const getHookInfo = useGetHookInfo();

  return (
    <html lang="en" className="h-screen">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <RootLayout>
        <WithdrawFormContextProvider
          getHookInfo={getHookInfo}
          poolTypeIn="WEIGHTED"
        >
          {children}
        </WithdrawFormContextProvider>
      </RootLayout>
    </html>
  );
}
