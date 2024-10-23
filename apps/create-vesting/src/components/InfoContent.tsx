import { ArrowTopRightIcon } from "@radix-ui/react-icons";

export const InfoContent = () => {
  return (
    <span className="cursor-default">
      To access Vesting Post-hook contract after swap, connect with the
      recipient wallet at{" "}
      <a
        href="https://llamapay.io/vesting"
        target="_blank"
        rel="noreferrer"
        className="text-color-link underline"
      >
        llamapay.io/vesting
        <ArrowTopRightIcon className="size-4 shrink-0 inline" />
      </a>
    </span>
  );
};
