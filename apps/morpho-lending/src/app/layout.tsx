"use client";

import { RootLayout } from "@bleu/cow-hooks-ui";
import { FormContextProvider } from "#/contexts/form";
import "@bleu/cow-hooks-ui/global.css";
import Head from "next/head";

import type * as React from "react";
import { MorphoContextProvider } from "#/contexts/morpho";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <RootLayout>
        <MorphoContextProvider>
          <FormContextProvider>{children}</FormContextProvider>
        </MorphoContextProvider>
      </RootLayout>
    </html>
  );
}
