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
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { useAllowCowShedOnMorpho } from "#/hooks/useAllowCowShedOnMorpho";
import { encodeFormData } from "#/utils/hookEncoding";
import { OperationType } from "#/constants/forms";

export default function Page() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [permitTxs, setPermitTxs] = useState<BaseTransaction[]>([]);
  const { hookInfo, cowShed, signer, context, cowShedProxy } =
    useIFrameContext();
  const [account, setAccount] = useState<string>();
  const router = useRouter();

  const { getValues } = useFormContext<MorphoSupplyFormData>();
  const {
    borrowAmount,
    supplyAmount,
    operationType,
    repayAmount,
    withdrawAmount,
  } = getValues();

  const submitHook = useSubmitHook({ defaultGasLimit: BigInt(700000) });
  const cowShedSignature = useCowShedSignature({
    cowShed,
    signer,
    context,
  });
  const handleTokenAllowance = useHandleTokenAllowance({
    spender: cowShedProxy,
  });

  const { control } = useFormContext<MorphoSupplyFormData>();
  const formData = useWatch({ control });

  const { isCowShedAuthorizedOnMorpho, userNonce } = useMorphoContext();
  const getAllowCowShedOnMoprhoHook = useAllowCowShedOnMorpho({
    isCowShedAuthorizedOnMorpho,
    userNonce,
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

    const encodedFormData = encodeFormData(formData as MorphoSupplyFormData);

    await submitHook({
      target: cowShed.getFactoryAddress(),
      callData: cowShedCall + encodedFormData,
    });
  }, [cowShedSignature, submitHook, hookInfo, permitTxs, cowShed, formData]);

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

  const allowMorphoCallback = useCallback(async () => {
    const allowMorphoHook = await getAllowCowShedOnMoprhoHook();

    if (allowMorphoHook) {
      setPermitTxs((prev) => [
        ...prev,
        {
          to: allowMorphoHook.target,
          value: BigInt(0),
          callData: allowMorphoHook.callData,
        },
      ]);
    }
    setCurrentStepIndex((prev) => prev + 1);
  }, [getAllowCowShedOnMoprhoHook]);

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

    const morphoAuthorization = isCowShedAuthorizedOnMorpho
      ? []
      : [
          {
            label: "Allow Morpho operations",
            description: "Authorize proxy to operate Morpho on your behalf",
            id: "allow-morpho-operations",
            callback: allowMorphoCallback,
          },
        ];

    return [
      ...morphoAuthorization,
      ...permitSteps,
      {
        label: "Approve and add pre-hook",
        description: "Approve proxy to execute the hook on your behalf",
        id: "approve-hooks",
        callback: cowShedCallback,
      },
    ];
  }, [
    hookInfo,
    permitCallback,
    cowShedCallback,
    allowMorphoCallback,
    isCowShedAuthorizedOnMorpho,
  ]);
  const getOperationText = () => {
    if (operationType === OperationType.SupplyBorrow) {
      if (supplyAmount && borrowAmount) return "Supply/Borrow Morpho position";
      if (supplyAmount) return "Supply Morpho position";
      if (borrowAmount) return "Borrow Morpho position";
    } else {
      if (repayAmount && withdrawAmount)
        return "Repay/Withdraw Morpho position";
      if (repayAmount) return "Repay Morpho position";
      if (withdrawAmount) return "Withdraw Morpho position";
    }
  };

  return (
    <div className="flex flex-col gap-1 p-2 text-center h-full justify-between items-center">
      <p className="text-lg font-semibold mb-4">{getOperationText()}</p>
      <WaitingSignature {...steps[currentStepIndex]} />
      <SignatureSteps steps={steps} currentStepIndex={currentStepIndex} />
    </div>
  );
}
