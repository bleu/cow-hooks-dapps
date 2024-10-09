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
    <label
      htmlFor="addressInput"
      className="text-start text-xs xsm:text-sm ml-2 my-2.5"
    >
      {label}
    </label>
    <input
      id="addressInput"
      type="text"
      placeholder="0xabc..."
      onChange={onChange}
      className="w-full mt-0 p-2.5 rounded-xl outline-none text-xs xsm:text-base text-color-text-paper border-none bg-color-paper-darker focus:border-primary"
      {...props}
    />
    <span className="text-red-700 text-xs xsm:text-sm text-start ml-2.5 mt-1">
      {errorMessage}
    </span>
  </div>
);
