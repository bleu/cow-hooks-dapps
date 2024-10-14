import { cn } from "@bleu/ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const ButtonPrimary: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, disabled = false, ...props }) => (
  <button
    className={cn(
      "flex flex-row flex-wrap items-center justify-center text-sm font-semibold border-none shadow-none rounded-2xl relative min-h-[58px] mt-2 mb-2 xsm:text-lg",
      {
        "bg-color-primary text-color-button-text transition-colors duration-200 ease-in-out focus:shadow-none focus:transform-none focus:bg-color-primary-lighter hover:shadow-none hover:transform-none hover:bg-color-primary-lighter active:shadow-none active:transform-none active:bg-color-primary-lighter":
          !disabled,
      },
      {
        "border-transparent outline-none cursor-auto shadow-none bg-color-primary text-color-button-text bg-color-paper-darker text-color-button-text-disabled":
          disabled,
      },
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
