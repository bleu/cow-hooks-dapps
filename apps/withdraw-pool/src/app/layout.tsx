"use client";

import { RootLayout } from "@bleu/cow-hooks-ui";
import { UserPoolContextProvider } from "#/context/userPools";
import "@bleu/cow-hooks-ui/global.css";
import Head from "next/head";

import type * as React from "react";
import { FormContextProvider } from "#/context/form";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-screen">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <RootLayout>
        <UserPoolContextProvider>
          <FormContextProvider>{children}</FormContextProvider>
        </UserPoolContextProvider>
      </RootLayout>
    </html>
  );
}
