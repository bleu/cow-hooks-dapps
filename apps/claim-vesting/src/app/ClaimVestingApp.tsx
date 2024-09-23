import { useTheme } from "./ThemeContext";

import {
  ClaimableAmountContainer,
  ContentWrapper,
  LabelContainer,
  Row,
  Wrapper,
  ButtonPrimary,
  Input,
} from "../components";

export function ClaimVestingApp() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Wrapper>
      <button onClick={toggleTheme} className="p-2 text-yellow-700">
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
      <ContentWrapper>
        <Row>
          <LabelContainer label="Type vesting contract" />
          <Input />
        </Row>
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>0,0</span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      <ButtonPrimary>
        <span>Add airdrop</span>
      </ButtonPrimary>
    </Wrapper>
  );
}
