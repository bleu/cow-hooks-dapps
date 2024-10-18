import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { ClipboardCopyIcon, CheckIcon } from "@radix-ui/react-icons";

export const ClipBoardButton = ({
  contentToCopy,
  buttonText,
  className,
}: {
  contentToCopy: string;
  buttonText: string;
  className: string;
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard({
    copiedEffectTimeMs: 2000,
  });
  return (
    <button
      type="button"
      onClick={() => copyToClipboard(contentToCopy)}
      className={className}
    >
      {copied ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <ClipboardCopyIcon className="w-4 h-4" />
      )}
      {buttonText}
    </button>
  );
};
