import { useTheme } from "./ThemeContext";

import { ClaimableAmountContainer, Row } from "../components";

import {
  Wrapper,
  ContentWrapper,
  AddressInput,
  ButtonPrimary,
} from "@bleu/cow-hooks-ui";

export function ClaimVestingApp() {
  const { theme, toggleTheme } = useTheme();

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
