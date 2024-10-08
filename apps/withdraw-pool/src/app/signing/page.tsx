"use client";

import { SignatureSteps } from "#/components/SignaturesSteps";
import { WaitingSignature } from "#/components/WaitingSignature";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import {
  BaseTransaction,
  useCowShedSignature,
  useHandleTokenAllowance,
  useSubmitHook,
} from "@bleu/cow-hooks-ui";
import { BigNumber, BigNumberish } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

export default function Page() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [permitTxs, setPermitTxs] = useState<BaseTransaction[]>([]);
  const {
    actions,
    hookInfo,
    cowShed,
    signer,
    context,
    jsonRpcProvider,
    publicClient,
    cowShedProxy,
  } = useIFrameContext();
  const submitHook = useSubmitHook({
    actions,
    context,
    publicClient,
  });
  const cowShedSignature = useCowShedSignature({
    cowShed,
    signer,
    context,
  });
  const handleTokenAllowance = useHandleTokenAllowance({
    signer,
    jsonRpcProvider,
    context,
    publicClient,
    spender: cowShedProxy,
  });

  const cowShedCallback = useCallback(async () => {
    if (!cowShedSignature || !hookInfo || !cowShed) return;

    const txs = [...permitTxs, ...hookInfo.txs];

    const cowShedCall = await cowShedSignature(txs);
    if (!cowShedCall) throw new Error("Error signing hooks");
    submitHook({
      target: cowShed.getFactoryAddress(),
      callData: cowShedCall,
    });
  }, [cowShedSignature, hookInfo, permitTxs, cowShed]);

  const permitCallback = useCallback(
    async (permit: {
      tokenAddress: string;
      amount: BigNumberish;
      tokenSymbol: string;
    }) => {
      const permitData = await handleTokenAllowance(
        BigNumber.from(permit.amount),
        permit.tokenAddress as Address
      );

      if (permitData) {
        setPermitTxs((prev) => [
          ...prev,
          {
            to: permitData.target,
            value: BigInt(0),
            callData: permitData.callData,
          },
        ]);
      }
      setCurrentStepIndex((prev) => prev + 1);
    },
    [handleTokenAllowance]
  );

  const steps = useMemo(() => {
    const permitSteps =
      hookInfo?.permitData.map((permit) => {
        return {
          label: `Approve ${permit.tokenSymbol}`,
          description: `Approve proxy to manage the ${permit.tokenSymbol} token`,
          id: `approve-${permit.tokenAddress}`,
          callback: async () => {
            await permitCallback(permit);
          },
          tooltipText: permit.tokenAddress,
        };
      }) || [];
    return [
      ...permitSteps,
      {
        label: "Approve and add pre-hook",
        description: "Approve proxy to execute the hook in behalf of you",
        id: "approve-hooks",
        callback: cowShedCallback,
      },
    ];
  }, [hookInfo, permitCallback]);

  return (
    <div className="flex flex-col gap-2 p-2 text-center h-full justify-between items-center">
      <WaitingSignature {...steps[currentStepIndex]} />
      <SignatureSteps steps={steps} currentStepIndex={currentStepIndex} />
    </div>
  );
}
