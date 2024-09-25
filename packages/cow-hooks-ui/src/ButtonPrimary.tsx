import type { ReactNode } from "react";

export const ButtonPrimary = ({
  children,
  disabled = false,
  ...props
}: {
  children?: ReactNode;
  disabled?: boolean;
}) => (
  <button
    className={`
      bg-color-primary text-color-button-text text-lg font-semibold border-none shadow-none rounded-2xl
      relative min-h-[58px] transition-colors duration-200 ease-in-out mt-2 mb-2 flex flex-row flex-wrap items-center justify-center
       focus:shadow-none focus:transform-none focus:bg-color-primary-lighter
       hover:shadow-none hover:transform-none hover:bg-color-primary-lighter
       active:shadow-none active:transform-none active:bg-color-primary-lighter
      disabled:border-transparent disabled:outline-none disabled:cursor-auto disabled:shadow-none
      ${
        disabled
          ? "disabled:bg-color-bg2 disabled:text-color-white disabled:opacity-70"
          : "disabled:bg-color-background disabled:text-color-info disabled:opacity-100"
      }
    `}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
