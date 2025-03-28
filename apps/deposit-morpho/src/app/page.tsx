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

export default function Page() {
  const { setValue, control } = useFormContext<DepositMorphoFormData>();
  const { vault: selectedVault } = useWatch({ control });

  const { context } = useIFrameContext();
  const { data: vaults } = useMorphoVaults({}, context?.chainId);

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
