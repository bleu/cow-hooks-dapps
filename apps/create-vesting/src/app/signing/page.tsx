"use client";

import {
  type BaseTransaction,
  SignatureSteps,
  WaitingSignature,
  useCowShedSignature,
  useHandleTokenAllowance,
  useIFrameContext,
  useSubmitHook,
} from "@bleu/cow-hooks-ui";
import { BigNumber, type BigNumberish } from "ethers";
import { useCallback, useMemo, useState } from "react";
import type { Address } from "viem";

export default function Page() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [permitTxs, setPermitTxs] = useState<BaseTransaction[]>([]);
  const { hookInfo, cowShed, signer, context, cowShedProxy } =
    useIFrameContext();

  const submitHook = useSubmitHook({
    recipientOverride: hookInfo?.recipientOverride,
    defaultGasLimit: BigInt(730_000),
  });
  const cowShedSignature = useCowShedSignature({
    cowShed,
    signer,
    context,
  });
  const handleTokenAllowance = useHandleTokenAllowance({
    spender: cowShedProxy,
  });

  const cowShedCallback = useCallback(async () => {
    if (!cowShedSignature || !hookInfo || !cowShed) return;

    const txs = [...permitTxs, ...hookInfo.txs];

    const cowShedCall = await cowShedSignature(txs);
    if (!cowShedCall) throw new Error("Error signing hooks");
    await submitHook({
      target: cowShed.getFactoryAddress(),
      callData: cowShedCall,
    });
  }, [cowShedSignature, submitHook, hookInfo, permitTxs, cowShed]);

  const permitCallback = useCallback(
    async (permit: {
      tokenAddress: string;
      amount: BigNumberish;
      tokenSymbol: string;
    }) => {
      const permitData = await handleTokenAllowance(
        BigNumber.from(permit.amount),
        permit.tokenAddress as Address,
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
    [handleTokenAllowance],
  );

  const steps = useMemo(() => {
    const permitSteps =
      hookInfo?.permitData?.map((permit) => {
        return {
          label: `Approve ${permit.tokenSymbol}`,
          description: `Approve proxy to spend the ${permit.tokenSymbol} token`,
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
        label: "Approve hooks",
        description: "Approve proxy to execute the hooks on your behalf",
        id: "approve-hooks",
        callback: cowShedCallback,
      },
    ];
  }, [hookInfo, permitCallback, cowShedCallback]);

  return (
    <div className="flex flex-col gap-2 p-2 text-center h-full justify-between items-center">
      <WaitingSignature {...steps[currentStepIndex]} />
      <SignatureSteps steps={steps} currentStepIndex={currentStepIndex} />
    </div>
  );
}
