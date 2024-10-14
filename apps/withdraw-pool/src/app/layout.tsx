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
      <body className="bg-transparent">
        <IFrameContextProvider>
          <div className="font-sans flex justify-center font-normal scrollbar-w-1 scrollbar scrollbar-thumb-foreground/90 scrollbar-track-slate-300 h-[350px] overflow-y-scroll">
            <UserPoolContextProvider>{children}</UserPoolContextProvider>
          </div>
        </IFrameContextProvider>
      </body>
    </html>
  );
}
