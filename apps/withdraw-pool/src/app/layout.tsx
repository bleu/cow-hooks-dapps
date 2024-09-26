import { IFrameContextProvider } from "#/context/iframe";
import "#/global.css";
import Head from "next/head";

import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="flex h-full flex-col font-sans font-normal text-foreground">
        <IFrameContextProvider>{children}</IFrameContextProvider>
      </body>
    </html>
  );
}
