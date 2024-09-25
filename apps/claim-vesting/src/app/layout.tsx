"use client";

import "#/global.css";
import type * as React from "react";
import Head from "next/head";

import { ThemeProvider } from "./ThemeContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="flex flex-col h-full font-sans font-normal">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
