import "#/global.css";

import * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={"flex h-full flex-col font-sans font-normal"}>
        {children}
      </body>
    </html>
  );
}
