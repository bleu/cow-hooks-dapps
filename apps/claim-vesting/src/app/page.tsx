"use client";

//import { COW } from '@cowprotocol/common-const'
//import { TokenWithLogo } from '@cowprotocol/common-const'
//import { useGasLimit } from '@cowprotocol/common-hooks'
//import { SupportedChainId } from '@cowprotocol/cow-sdk'
//import { ButtonPrimary } from '@cowprotocol/ui'
//import { Token } from '@uniswap/sdk-core'

//import { HookDappProps } from 'modules/hooksStore/types/hooks'

//import { AIRDROP_PREVIEW_ERRORS, useClaimData } from './hooks/useClaimData'
import {
  ClaimableAmountContainer,
  ContentWrapper,
  ContractInput,
  LabelContainer,
  Row,
  Wrapper,
  ButtonPrimary,
} from "../components";
//import { IAirdrop, IClaimData } from './types'

export default function Page() {
  return (
    // <div className="flex items-center justify-center mt-48">
    //   <div className="w-96 border-2 rounded-xl">
    <Wrapper>
      <ContentWrapper>
        <Row>
          <LabelContainer label="Type vesting contract" />
          <ContractInput />
        </Row>
        <Row>
          <ClaimableAmountContainer>
            <span>Total Available to claim</span>
            <span>0,0 ETH</span>
          </ClaimableAmountContainer>
        </Row>
      </ContentWrapper>
      <ButtonPrimary>
        <span>Add airdrop</span>
      </ButtonPrimary>
    </Wrapper>
    //   </div>
    // </div>
  );
}
