import { useCallback, useState } from "react";

export const useCopyToClipboard = ({
  copiedEffectTimeMs,
}: {
  copiedEffectTimeMs: number;
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, copiedEffectTimeMs);
    },
    [copiedEffectTimeMs],
  );

  return { copied, copyToClipboard };
};
