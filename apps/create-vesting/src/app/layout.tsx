"use client";

import "@bleu/cow-hooks-ui/global.css";
import { RootLayout, Scrollbar } from "@bleu/cow-hooks-ui";
import Head from "next/head";
import type * as React from "react";
import { FormContextProvider } from "#/context/form";
import { TokenContextProvider } from "#/context/token";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <RootLayout>
        <TokenContextProvider>
          <body className="bg-transparent">
            <FormContextProvider>
              <Scrollbar>{children}</Scrollbar>
            </FormContextProvider>
          </body>
        </TokenContextProvider>
      </RootLayout>
    </html>
  );
}
