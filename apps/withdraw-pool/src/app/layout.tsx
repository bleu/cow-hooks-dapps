"use client";

import { IFrameContextProvider } from "@bleu/cow-hooks-ui";
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
      <body>
        <IFrameContextProvider>
          <div className="font-sans font-normal scrollbar-custom h-screen overflow-y-scroll p-[16px] text-color-text">
            <UserPoolContextProvider>
              <FormContextProvider>{children}</FormContextProvider>
            </UserPoolContextProvider>
          </div>
        </IFrameContextProvider>
      </body>
    </html>
  );
}
