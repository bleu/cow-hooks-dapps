"use client";

import { IFrameContextProvider } from "@bleu/cow-hooks-ui";
import { UserPoolContextProvider } from "#/context/userPools";
import "@bleu/cow-hooks-ui/global.css";
import Head from "next/head";

import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="bg-transparent scrollbar-thumb-primary scrollbar-track-primary">
        <div className="flex h-full flex-col font-sans font-normal bg-transparent text-foreground scrollbar h-32 overflow-y-scroll">
          <IFrameContextProvider>
            <UserPoolContextProvider>{children}</UserPoolContextProvider>
          </IFrameContextProvider>
        </div>
      </body>
    </html>
  );
}
