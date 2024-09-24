import { useTheme } from "./ThemeContext";

import { ClaimableAmountContainer, Row } from "../components";

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

export function ClaimVestingApp() {
  const { theme, toggleTheme } = useTheme();
  const [actions, setActions] = useState<CoWHookDappActions | null>(null);
  const [context, setContext] = useState<HookDappContext | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const { account, orderParams, chainId } = context || {};

  useEffect(() => {
    // TODO: test change address -> update signer
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();

    setActions(actions);
    setSigner(signer);
  }, []);

  return (
    <Wrapper>
      <button onClick={toggleTheme} className="p-2 text-yellow-700">
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <ContentWrapper>
        <AddressInput theme={theme} label="Place vesting contract address" />
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>0,0</span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      <ButtonPrimary>
        <span>Add hook</span>
      </ButtonPrimary>
    </Wrapper>
  );
}
