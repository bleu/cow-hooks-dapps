"use client";

import { StrictMode, useEffect, useState } from "react";
import {
  initCoWHookDapp,
  type HookDappContext,
} from "@cowprotocol/hook-dapp-lib";
import { Dialog } from "@bleu/ui";

export default function Page() {
  const [context, setContext] = useState<HookDappContext | null>(null);

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
  }, []);

  return (
    <StrictMode>
      <Dialog />
      <p>This is a test</p>
    </StrictMode>
  );
}
