import { Input } from "@bleu/cow-hooks-ui";
import clsx from "clsx";
import { type InputHTMLAttributes, ReactNode } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface AddressInputProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: Path<TFieldValues>;
  isDarkMode: boolean | undefined;
  label: string;
  errorMessage?: string;
  //register: UseFormRegister<TFieldValues>;
}

export function AddressInput<TFieldValues extends FieldValues>({
  name,
  isDarkMode,
  label,
  errorMessage,
  //register,
  ...props
}: AddressInputProps<TFieldValues>) {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name} className="text-start text-sm ml-2 my-2.5">
        Place recipient address
      </label>
      <Input
        id={name}
        name={name}
        label="recipient"
        type="text"
        placeholder="0xabc..."
        autoComplete="off"
        className={clsx(
          "w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border-2 border-color-border",
          { "bg-color-paper-darker": isDarkMode },
          { "bg-color-paper": !isDarkMode },
        )}
        //{...register(name)}
        //{...props}
      />
      <span
        className={clsx("text-red-700 text-sm text-start ml-2.5 mt-1", {
          "text-transparent": !errorMessage,
        })}
      >
        {errorMessage ?? "field ok"}
      </span>
    </div>
  );
}
