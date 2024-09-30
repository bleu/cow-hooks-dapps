import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const ButtonPrimary: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, disabled = false, ...props }) => (
  <button
    className={clsx(
      "flex flex-row flex-wrap items-center justify-center text-lg font-semibold border-none shadow-none rounded-2xl relative min-h-[58px] mt-2 mb-2",
      {
        "bg-color-primary text-color-button-text transition-colors duration-200 ease-in-out focus:shadow-none focus:transform-none focus:bg-color-primary-lighter hover:shadow-none hover:transform-none hover:bg-color-primary-lighter active:shadow-none active:transform-none active:bg-color-primary-lighter":
          !disabled,
      },
      {
        "border-transparent outline-none cursor-auto shadow-none opacity-80 bg-color-primary text-color-button-text text-opacity-80":
          disabled,
      },
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);