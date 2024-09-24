"use client";

import { TokenLogo } from "@bleu/cow-hooks-ui";
import {
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";
import { StrictMode, useEffect, useState } from "react";

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
