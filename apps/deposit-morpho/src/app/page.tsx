"use client";

import { useIFrameContext, useMorphoVaults } from "@bleu/cow-hooks-ui";

export default function Page() {
  const { context } = useIFrameContext();
  const { data: vaults, error } = useMorphoVaults({}, context?.chainId);

  return (
    <div>
      Deposit morpho
      {vaults ? (
        <p>{JSON.stringify(vaults)}</p>
      ) : (
        <p>{JSON.stringify(error)}</p>
      )}
    </div>
  );
}
