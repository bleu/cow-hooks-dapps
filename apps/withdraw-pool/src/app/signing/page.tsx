"use client";

import {
  SignatureSteps,
  WaitingSignature,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import {
  type BaseTransaction,
  useCowShedSignature,
  useHandleTokenAllowance,
  useSubmitHook,
} from "@bleu/cow-hooks-ui";
import { BigNumber, type BigNumberish } from "ethers";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";
import type { WithdrawSchemaType } from "#/utils/schema";

export default function Page() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [permitTxs, setPermitTxs] = useState<BaseTransaction[]>([]);
  const {
    actions,
    hookInfo,
    cowShed,
    signer,
    context,
    publicClient,
    cowShedProxy,
  } = useIFrameContext();
  const { getValues } = useFormContext<WithdrawSchemaType>();
  const [account, setAccount] = useState<string>();
  const router = useRouter();
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
    spender: cowShedProxy,
  });

  useEffect(() => {
    if (!account && context?.account) {
      setAccount(context.account);
      return;
    }
    if (
      account &&
      context?.account &&
      context.account.toLowerCase() !== account.toLowerCase()
    ) {
      router.push("/");
    }
  }, [context?.account, account, router.push]);

  const cowShedCallback = useCallback(async () => {
    if (!cowShedSignature || !hookInfo || !cowShed) return;

    const txs = [...permitTxs, ...hookInfo.txs];
    const cowShedCall = await cowShedSignature(txs);
    if (!cowShedCall) throw new Error("Error signing hooks");
    const withdrawPct = getValues("withdrawPct");
    const cowShedCallDataWithWithdrawPct =
      cowShedCall + Number(Number(withdrawPct).toFixed()).toString(16); // adding to facilitate editing the hook
    await submitHook({
      target: cowShed.getFactoryAddress(),
      callData: cowShedCallDataWithWithdrawPct,
    });
  }, [cowShedSignature, submitHook, hookInfo, permitTxs, cowShed, getValues]);

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
        label: "Approve and add pre-hook",
        description: "Approve proxy to execute the hook on your behalf",
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
