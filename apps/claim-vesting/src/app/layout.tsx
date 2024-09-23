import "#/global.css";

import type * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={"flex h-full flex-col font-sans font-normal"}>
        {children}
      </body>
    </html>
  );
}
