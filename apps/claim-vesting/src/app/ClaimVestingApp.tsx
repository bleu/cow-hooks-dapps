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

import { publicClient } from "../client";
import { VestingEscrowAbi } from "../abis/VestingEscrowAbi";
import { type Address, isAddress } from "viem";

import useSWR from "swr";

async function readData(address: Address) {
  const data = await publicClient.readContract({
    address: address,
    abi: VestingEscrowAbi,
    functionName: "unclaimed",
  });

  return data;
}

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

  const shouldFetch = isAddress(debouncedAddress);
  console.log("shouldFetch", shouldFetch);

  const {
    data: claimableAmountWei,
    isLoading,
    error,
  } = useSWR(shouldFetch ? debouncedAddress : null, readData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  useEffect(() => {
    console.log(debouncedAddress);
  }, [debouncedAddress]);

  useEffect(() => {
    // TODO: test change address -> update signer
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    console.log(provider);

    setActions(actions);
    setSigner(signer);
  }, []);

  if (claimableAmountWei) {
    console.log("claimableAmount", claimableAmountWei);
  }
  if (error) {
    console.log("error", error);
  }

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
