import { useTheme } from "./ThemeContext";

import { ClaimableAmountContainer, Row } from "../components";
import { useDebounceValue } from "../hooks/useDebounceValue";

import {
  CoWHookDappActions,
  HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";
import { Web3Provider } from "@ethersproject/providers";
import type { Signer } from "@ethersproject/abstract-signer";

import {
  Wrapper,
  ContentWrapper,
  AddressInput,
  ButtonPrimary,
} from "@bleu/cow-hooks-ui";
import { useEffect, useState } from "react";

import { useClaimVestingData } from "../hooks/useClaimVestingData";

export function ClaimVestingApp() {
  const { theme, toggleTheme } = useTheme();
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const { account, orderParams, chainId } = context || {};

  const [typedAddress, setTypedAddress] = useState("");

  const [debouncedAddress] = useDebounceValue(typedAddress, 300, {
    leading: true,
  });

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    console.log(provider);

    setActions(actions);
    setSigner(signer);
  }, []);

  const { errorMessage, formattedClaimableAmount, tokenSymbol, loading } =
    useClaimVestingData({ chainId, account, debouncedAddress });

  useEffect(() => {
    console.log("errorMessage", errorMessage);
  }, [errorMessage]);

  return (
    <Wrapper>
      <button onClick={toggleTheme} className="p-2 text-yellow-700">
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <ContentWrapper>
        <AddressInput
          onChange={(e) => setTypedAddress(e.target.value)}
          theme={theme}
          label="Place vesting contract address"
        />
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>
              {formattedClaimableAmount} {tokenSymbol && tokenSymbol}
            </span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      {errorMessage ? (
        <span className="text-center mb-6">{errorMessage}</span>
      ) : loading ? (
        <span>Loading...</span>
      ) : (
        <ButtonPrimary>
          <span>Add hook</span>
        </ButtonPrimary>
      )}
    </Wrapper>
  );
}
