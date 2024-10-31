import { cn } from "@bleu/ui";
import type { ButtonHTMLAttributes } from "react";

export const ButtonPrimary: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, disabled = false, ...props }) => (
  <button
    className={cn(
      "flex flex-row flex-wrap w-full items-center justify-center text-sm font-semibold border-none shadow-none rounded-2xl relative min-h-[58px] xsm:text-lg disabled:border-transparent bg-color-primary text-color-button-text transition-colors duration-200 ease-in-out focus:shadow-none focus:transform-none focus:bg-color-primary-lighter hover:shadow-none hover:transform-none hover:bg-color-primary-lighter active:shadow-none active:transform-none active:bg-color-primary-lighter disabled:outline-none disabled:cursor-auto disabled:shadow-none disabled:bg-color-paper-darker disabled:text-color-button-text-disabled mb-4",
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
