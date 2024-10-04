"use client";

import "#/global.css";
import Head from "next/head";
import type * as React from "react";
import { IFrameContextProvider } from "@bleu/cow-hooks-ui";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <IFrameContextProvider>
        <body className="flex flex-col h-full font-sans font-normal">
          {children}
        </body>
      </IFrameContextProvider>
    </html>
  );
}
