"use client";

import { useTheme } from "./ThemeContext";

import { useDebounceValue } from "@bleu/ui";

import {
  type CoWHookDappActions,
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";

import {
  AddressInput,
  ButtonPrimary,
  ClaimableAmountContainer,
  ContentWrapper,
  Wrapper,
} from "@bleu/cow-hooks-ui";
import { useEffect, useState } from "react";

import { useClaimVestingData } from "../hooks/useClaimVestingData";

export default function Page() {
  const { theme, toggleTheme } = useTheme();
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);

  const { account, chainId } = context || {};

  const [typedAddress, setTypedAddress] = useState("");

  const [debouncedAddress] = useDebounceValue(typedAddress, 300, {
    leading: true,
  });

  useEffect(() => {
    const { actions } = initCoWHookDapp({ onContext: setContext });

    setActions(actions);
  }, []);

  const { errorMessage, formattedClaimableAmount, tokenSymbol, loading } =
    useClaimVestingData({ chainId, account, debouncedAddress });

  return (
    <Wrapper>
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 text-yellow-700"
      >
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <ContentWrapper>
        <AddressInput
          onChange={(e) => setTypedAddress(e.target.value)}
          theme={theme}
          label="Place vesting contract address"
        />
        <div className="flex flex-col w-full">
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>
              {formattedClaimableAmount} {tokenSymbol && tokenSymbol}
            </span>
          </ClaimableAmountContainer>
        </div>
      </ContentWrapper>
      {errorMessage && (
        <span className="text-center my-6 text-red-500">{errorMessage}</span>
      )}
      {!errorMessage && loading && (
        <span className="text-center my-6">Loading...</span>
      )}
      {!errorMessage && !loading && (
        <ButtonPrimary disabled={debouncedAddress === ""}>
          <span>Add hook</span>
        </ButtonPrimary>
      )}
    </Wrapper>
  );
}
