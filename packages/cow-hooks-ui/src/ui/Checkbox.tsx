import { Input, Label } from "@bleu/ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useFormContext, useWatch } from "react-hook-form";

export const Checkbox = ({
  name,
  label,
  isSelectedMessage,
  onSelectSideEffect,
  radius = 14,
  ...props
}: {
  name: string;
  label?: string;
  isSelectedMessage?: string;
  onSelectSideEffect?: () => void;
  radius?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const { register, control } = useFormContext();
  const isSelected = useWatch({ control, name });

  return (
    <div className="flex flex-col items-start justify-start">
      <div className="flex items-center">
        <div className="relative p-1">
          <Input
            type="checkbox"
            id={name}
            {...register(name, {
              onChange: (e) => {
                if (e.target.value && onSelectSideEffect) onSelectSideEffect();
              },
            })}
            disabled={isSelected}
            className="sr-only" // This hides the input visually but keeps it accessible
            {...props}
          />
          <Label
            htmlFor={name}
            style={{
              width: `${radius}px`,
              height: `${radius}px`,
            }}
            className={`
            flex items-center justify-center rounded-full border-none cursor-pointer
            bg-color-primary-lighter hover:bg-color-primary [&>span>span]:hover:bg-color-primary
          `}
          >
            <span
              // It's weird, but tailwind classes don't work for this
              style={{
                width: `${(radius * 3) / 4}px`,
                height: `${(radius * 3) / 4}px`,
              }}
              className={`
              flex items-center justify-center rounded-full bg-color-paper
              transition-opacity duration-200 ease-in-out
            `}
            >
              <span
                style={{
                  width: `${(radius * 3) / 8}px`,
                  height: `${(radius * 3) / 8}px`,
                }}
                className={`
              block rounded-full bg-color-primary-lighter
              transition-opacity duration-200 ease-in-out
              ${isSelected ? "opacity-100" : "opacity-0"}
            `}
              />
            </span>
          </Label>
        </div>
        <Label>{label}</Label>
      </div>
      {isSelected && isSelectedMessage && (
        <span className="ml-4 pt-1 font-normal text-xs opacity-70">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1 inline" />
          {isSelectedMessage}
        </span>
      )}
    </div>
  );
};
