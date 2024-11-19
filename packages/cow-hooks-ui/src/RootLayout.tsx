import { Provider as JotaiProvider } from "jotai";
import type { PropsWithChildren } from "react";
import { IFrameContextProvider } from "./context/iframe";
import { TokenLogoContextProvider } from "./context/tokenLogo";
import { Scrollbar } from "./ui/Scrollbar";

export function RootLayout({ children }: PropsWithChildren) {
  return (
    <JotaiProvider>
      <IFrameContextProvider>
        <TokenLogoContextProvider>
          <body className="bg-transparent">
            <Scrollbar>{children}</Scrollbar>
          </body>
        </TokenLogoContextProvider>
      </IFrameContextProvider>
    </JotaiProvider>
  );
}
