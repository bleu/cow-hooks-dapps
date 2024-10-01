"use client";

import { SignatureSteps } from "#/components/SignaturesSteps";
import { WaitingSignature } from "#/components/WaitingSignature";
import { useIFrameContext } from "#/context/iframe";
import { useCowShedSignature } from "#/hooks/useCowShedSignature";
import { useGetPermitData } from "#/hooks/useGetPermitData";
import { BaseTransaction } from "#/utils/transactionFactory/types";
import { BigNumber, BigNumberish } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permitTxs, setPermitTxs] = useState<BaseTransaction[]>([]);
  const { hookInfo, cowShedProxy } = useIFrameContext();
  const cowShedSignature = useCowShedSignature();
  const getPermitData = useGetPermitData();

  const cowShedCallback = useCallback(async () => {
    if (!cowShedSignature || !hookInfo) return;

    const txs = [...permitTxs, ...hookInfo.txs];

    await cowShedSignature(txs);
  }, [cowShedSignature, hookInfo, permitTxs]);

  const permitCallback = useCallback(
    async (permit: {
      tokenAddress: string;
      amount: BigNumberish;
      tokenSymbol: string;
    }) => {
      const permitData = await getPermitData(
        BigNumber.from(permit.amount),
        permit.tokenAddress as Address,
        cowShedProxy as Address
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
      setCurrentIndex((prev) => prev + 1);
    },
    [getPermitData, cowShedProxy]
  );

  const steps = useMemo(() => {
    const permitSteps =
      hookInfo?.permitData.map((permit) => {
        return {
          label: `Approve ${permit.tokenSymbol}`,
          description: `Approve proxy to manage your ${permit.tokenSymbol} (${permit.tokenAddress})`,
          id: `approve-${permit.tokenAddress}`,
          callback: async () => {
            await permitCallback(permit);
          },
        };
      }) || [];
    return [
      ...permitSteps,
      {
        label: "Approve hooks",
        description: "Approve proxy to execute the hooks in behalf of you",
        id: "approve-hooks",
        callback: cowShedCallback,
      },
    ];
  }, [hookInfo, cowShedProxy]);

  return (
    <div className="flex flex-col gap-2 p-2 text-center h-full justify-between items-center">
      <WaitingSignature {...steps[currentIndex]} />
      <SignatureSteps steps={steps} currentIndex={currentIndex} />
    </div>
  );
}
