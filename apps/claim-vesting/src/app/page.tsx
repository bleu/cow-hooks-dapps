"use client";

import { StrictMode, useEffect, useState } from "react";
import { initCoWHookDapp, HookDappContext } from "@cowprotocol/hook-dapp-lib";

export default function Page() {
  const [context, setContext] = useState<HookDappContext | null>(null);

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
  }, []);

  return (
    <StrictMode>
      <p>This is a test</p>
    </StrictMode>
  );
}
