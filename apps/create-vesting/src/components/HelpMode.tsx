import type { Dispatch, SetStateAction } from "react";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { ClipBoardButton } from "./ClipboardButton";

const scanUrlSearchAddressMap = {
  [SupportedChainId.MAINNET]: "https://etherscan.io",
  [SupportedChainId.GNOSIS_CHAIN]: "https://gnosisscan.io",
  [SupportedChainId.ARBITRUM_ONE]: "https://arbiscan.io",
};

export function HelpMode({
  setOnHelpMode,
}: { setOnHelpMode: Dispatch<SetStateAction<boolean>> }) {
  const { cowShedProxy, context } = useIFrameContext();

  const scanProxyUrl =
    context?.chainId && context?.chainId !== SupportedChainId.SEPOLIA
      ? `${scanUrlSearchAddressMap[context?.chainId]}/address/${cowShedProxy}#tokentxns`
      : "";

  return (
    <div>
      <div className="flex flex-col absolute p-4 top-[-0px] left-[0px] w-full h-full bg-color-paper">
        <p className="mb-1">Go to your proxy transactions</p>
        <ClipBoardButton
          contentToCopy={scanProxyUrl}
          buttonText={cowShedProxy as string}
          className="flex items-center justify-center gap-2 text-color-button-text bg-color-primary hover:bg-color-primary-lighter rounded-lg p-1.5"
        />
        <br />
        <p>
          After the swap, take a look at all transactions in the last block, one
          of them will target a Simple Vesting Escrow.
        </p>
        <button
          className="rounded-xl p-2 mt-2 bg-color-paper-darker text-color-text-paper hover:text-color-button-text hover:bg-color-primary"
          type="button"
          onClick={() => setOnHelpMode(false)}
        >
          Quit tip
        </button>
      </div>
    </div>
  );
}
