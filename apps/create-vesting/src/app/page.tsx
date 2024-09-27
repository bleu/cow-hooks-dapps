"use client";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import { ButtonPrimary, ContentWrapper, Wrapper } from "@bleu/cow-hooks-ui";
import { useEffect, useState } from "react";

export default function Page() {
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);

  // @ts-ignore
  const isDarkMode = context?.isDarkMode;
  const { account, chainId } = context || {};

  useEffect(() => {
    const { actions } = initCoWHookDapp({ onContext: setContext });
    setActions(actions);
  }, []);

  useEffect(() => {
    const newTheme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [isDarkMode]);

  const handleAddHook = () => {
    if (!actions) return;

    const hook = {
      target: "",
      callData: "",
      gasLimit: "",
    };

    if (context?.hookToEdit) {
      actions.editHook({ hook, uuid: context.hookToEdit.uuid });
    } else {
      actions.addHook({ hook });
    }
  };

  return (
    <>
      {context && (
        <Wrapper>
          <ContentWrapper>
            <div className="flex flex-col w-full">asdnkmcnsd</div>
          </ContentWrapper>
          <ButtonPrimary onClick={handleAddHook}>
            <span>{context?.hookToEdit ? "Edit Hook" : "Add hook"}</span>
          </ButtonPrimary>
        </Wrapper>
      )}
    </>
  );
}
