"use client";

import { IFrameContextProvider } from "@bleu/cow-hooks-ui";
import { FormContextProvider } from "#/contexts/form";
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
          <div className="font-sans font-normal scrollbar scrollbar-custom h-screen overflow-y-scroll p-[16px] bg-transparent text-color-text">
            <FormContextProvider>{children}</FormContextProvider>
          </div>
        </IFrameContextProvider>
      </body>
    </html>
  );
}
