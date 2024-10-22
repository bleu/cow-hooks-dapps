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
      <body>
        <RootLayout>
          <div
            className="font-sans overflow-y-auto font-normal h-screen text-color-text p-[16px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full"
            style={{ scrollbarGutter: "stable" }}
          >
            <UserPoolContextProvider>
              <FormContextProvider>{children}</FormContextProvider>
            </UserPoolContextProvider>
          </div>
        </RootLayout>
      </body>
    </html>
  );
}
