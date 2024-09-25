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
import { VestingEscrowAbi } from "#/abis/VestingEscrowAbi";

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

  const {
    errorMessage,
    formattedClaimableAmount,
    tokenSymbol,
    loading,
    callData,
    gasLimit,
  } = useClaimVestingData({ chainId, account, debouncedAddress });

  const handleAddHook = () => {
    if (!actions || !account || !callData || !gasLimit) return;
    console.log("calldata", callData);
    console.log("gasLimit", gasLimit);
    console.log("debouncedAddress", debouncedAddress);
    actions.addHook({
      hook: {
        target: debouncedAddress,
        callData: callData,
        gasLimit: gasLimit,
      },
    });
  };

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
      {errorMessage ? (
        <span className="text-center my-[25px] text-red-500">
          {errorMessage}
        </span>
      ) : loading ? (
        <span className="text-center my-[25px]">Loading...</span>
      ) : (
        <ButtonPrimary
          onClick={handleAddHook}
          disabled={debouncedAddress === ""}
        >
          <span>Add hook</span>
        </ButtonPrimary>
      )}
    </Wrapper>
  );
}
