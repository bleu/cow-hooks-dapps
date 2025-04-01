"use client";

import {
  Spinner,
  type Vault,
  VaultsDropdownMenu,
  useIFrameContext,
  useMorphoVaults,
} from "@bleu/cow-hooks-ui";
import { useFormContext, useWatch } from "react-hook-form";
import { VaultForm } from "#/components/VaultForm";
import type { DepositMorphoFormData } from "#/contexts/form";
import { useCallback, useState } from "react";
import { decodeCalldata } from "#/utils/decodeCalldata";

export default function Page() {
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { setValue, control } = useFormContext<DepositMorphoFormData>();
  const { vault: selectedVault } = useWatch({ control });

  const { context } = useIFrameContext();
  const { data: vaults } = useMorphoVaults({}, context?.chainId);

  const loadHookInfo = useCallback(async () => {
    if (
      !context?.hookToEdit ||
      !context.account ||
      !vaults ||
      !isEditHookLoading
    )
      return;
    try {
      const data = await decodeCalldata(
        context?.hookToEdit?.hook.callData as `0x${string}`,
        vaults
      );
      if (data) {
        setValue("vault", data.vault);
        setValue("amount", data.amount);
        setIsEditHookLoading(false);
      }
    } catch {}
  }, [
    context?.hookToEdit,
    context?.account,
    vaults,
    setValue,
    isEditHookLoading,
  ]);

  if (!context || (context?.hookToEdit && isEditHookLoading)) {
    if (context?.hookToEdit && isEditHookLoading) loadHookInfo();
    return (
      <div className="flex items-center justify-center w-full h-full bg-transparent text-color-text-paper">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!vaults)
    return (
      <div className="text-center mt-10 p-2">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div className="w-full flex flex-col py-1 px-4">
      <VaultsDropdownMenu
        onSelect={(vault: Vault) => setValue("vault", vault)}
        vaults={vaults}
        selectedVault={selectedVault as Vault | undefined}
      />
      {selectedVault && <VaultForm vault={selectedVault as Vault} />}
    </div>
  );
}
