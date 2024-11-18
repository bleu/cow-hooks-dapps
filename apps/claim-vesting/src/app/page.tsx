"use client";

import { useDebounceValue } from "@bleu.builders/ui";

import type { HookDappContext } from "@cowprotocol/hook-dapp-lib";

import {
  AddressInput,
  ButtonPrimary,
  ClaimableAmountContainer,
  ContentWrapper,
  Wrapper,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useEffect, useState } from "react";

import { useClaimVestingData } from "../hooks/useClaimVestingData";

export default function Page() {
  const { context, actions } = useIFrameContext();

  const isDarkMode = context?.isDarkMode;

  const [typedAddress, setTypedAddress] = useState<string>(
    context?.hookToEdit?.hook.target || "",
  );

  const [debouncedAddress] = useDebounceValue(typedAddress, 300, {
    leading: true,
  });

  useEffect(() => {
    setTypedAddress(context?.hookToEdit?.hook.target ?? "");
  }, [context?.hookToEdit?.hook.target]);

  const {
    errorMessage,
    formattedClaimableAmount,
    formattedClaimableAmountFullDecimals,
    tokenSymbol,
    loading,
    callData,
    gasLimit,
  } = useClaimVestingData({ account: context?.account, debouncedAddress });

  const handleAddHook = () => {
    if (!actions || !context?.account || !callData || !gasLimit) return;
    const hook = {
      target: debouncedAddress,
      callData: callData,
      gasLimit: gasLimit,
    };

    if (context?.hookToEdit) {
      actions.editHook({ hook, uuid: context.hookToEdit.uuid });
    } else {
      actions.addHook({ hook });
    }
  };

  return (
    <>
      {context?.account ? (
        <Wrapper>
          <ContentWrapper>
            <AddressInput
              value={typedAddress}
              onChange={(e) => setTypedAddress(e.target.value.trim())}
              theme={isDarkMode ? "dark" : "light"}
              label="Place vesting contract address"
              autoComplete="off"
            />
            {formattedClaimableAmount !== "0.0" && (
              <div className="flex flex-col w-full">
                <ClaimableAmountContainer>
                  <span>Claimable amount</span>
                  <span title={formattedClaimableAmountFullDecimals}>
                    {formattedClaimableAmount} {tokenSymbol && tokenSymbol}
                  </span>
                </ClaimableAmountContainer>
              </div>
            )}
          </ContentWrapper>
          <ButtonPrimary
            onClick={handleAddHook}
            disabled={debouncedAddress === "" || !!errorMessage || loading}
          >
            <ButtonText
              context={context}
              errorMessage={errorMessage}
              loading={loading}
            />
          </ButtonPrimary>
        </Wrapper>
      ) : (
        context && (
          <span className="mt-10 text-center">Connect your wallet</span>
        )
      )}
    </>
  );
}

const ButtonText = ({
  context,
  errorMessage,
  loading,
}: {
  context: HookDappContext;
  errorMessage: string | undefined;
  loading: boolean;
}) => {
  if (errorMessage) return <span>{errorMessage}</span>;

  if (loading) return <span>Loading...</span>;

  if (context?.hookToEdit && context?.isPreHook)
    return <span>Update Pre-hook</span>;
  if (context?.hookToEdit && !context?.isPreHook)
    return <span>Update Post-hook</span>;
  if (!context?.hookToEdit && context?.isPreHook)
    return <span>Add Pre-hook</span>;
  if (!context?.hookToEdit && !context?.isPreHook)
    return <span>Add Post-hook</span>;
};
