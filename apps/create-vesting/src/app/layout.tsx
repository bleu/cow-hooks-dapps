"use client";

import "@bleu/cow-hooks-ui/global.css";
import { IFrameContextProvider } from "@bleu/cow-hooks-ui";
import Head from "next/head";
import type * as React from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

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
