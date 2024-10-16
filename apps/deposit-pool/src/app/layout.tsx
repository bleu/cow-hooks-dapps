"use client";

import { IFrameContextProvider } from "@bleu/cow-hooks-ui";
import "@bleu/cow-hooks-ui/global.css";
import Head from "next/head";

import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="flex h-full flex-col font-sans font-normal bg-transparent text-foreground">
        <IFrameContextProvider>{children}</IFrameContextProvider>
      </body>
    </html>
  );
}
