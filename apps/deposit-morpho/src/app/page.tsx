"use client";

import {
  Spinner,
  type Vault,
  VaultsDropdownMenu,
  useIFrameContext,
  useMorphoVaults,
} from "@bleu/cow-hooks-ui";
import { useState } from "react";
import { VaultForm } from "#/components/VaultForm";

export default function Page() {
  const [selectedVault, setSelectedVault] = useState<Vault | undefined>(
    undefined,
  );
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
        onSelect={(vault: Vault) => setSelectedVault(vault)}
        vaults={vaults}
        selectedVault={selectedVault}
      />
      {selectedVault && <VaultForm vault={selectedVault} />}
    </div>
  );
}
