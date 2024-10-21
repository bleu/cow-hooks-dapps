import type { PropsWithChildren } from "react";
import { IFrameContextProvider } from "./context/iframe";
import { TokenLogoContextProvider } from "./context/tokenLogo";

export function RootLayout({ children }: PropsWithChildren) {
  return (
    <IFrameContextProvider>
      <TokenLogoContextProvider>{children}</TokenLogoContextProvider>
    </IFrameContextProvider>
  );
}
