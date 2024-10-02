import { cn } from "@bleu/ui";
import type { InputHTMLAttributes } from "react";

interface AddressInputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme: string;
  label: string;
  errorMessage?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  theme,
  label,
  errorMessage,
  onChange,
  ...props
}: {
  theme: string;
  label: string;
  errorMessage?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col w-full">
    <label htmlFor="addressInput" className="text-start text-sm ml-2 my-2.5">
      {label}
    </label>
    <input
      id="addressInput"
      type="text"
      placeholder="0xabc..."
      onChange={onChange}
      className={cn(
        "w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border focus:border-primary",
        { "bg-color-paper-darker": theme === "dark" },
        { "bg-color-paper": theme === "light" }
      )}
      {...props}
    />
    <span className="text-red-700 text-sm text-start ml-2.5 mt-1">
      {errorMessage}
    </span>
  </div>
);
