"use client";

import "@bleu/cow-hooks-ui/global.css";
import { RootLayout } from "@bleu/cow-hooks-ui";
import Head from "next/head";
import type * as React from "react";
import { FormContextProvider } from "#/context/form";
import { TokenContextProvider } from "#/context/token";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <RootLayout>
        <TokenContextProvider>
          <FormContextProvider>{children}</FormContextProvider>
        </TokenContextProvider>
      </RootLayout>
    </html>
  );
}
