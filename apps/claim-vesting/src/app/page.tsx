"use client";

import { useTheme } from "./ThemeContext";

import {
  ClaimableAmountContainer,
  Wrapper,
  ContentWrapper,
  AddressInput,
  ButtonPrimary,
} from "@bleu/cow-hooks-ui";

export default function Page() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Wrapper>
      <button onClick={toggleTheme} className="p-2 text-yellow-700">
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <ContentWrapper>
        <AddressInput theme={theme} label="Place vesting contract address" />
        <div className="flex flex-col w-full">
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>0,0</span>
          </ClaimableAmountContainer>
        </div>
      </ContentWrapper>
      <ButtonPrimary>
        <span>Add hook</span>
      </ButtonPrimary>
    </Wrapper>
  );
}
