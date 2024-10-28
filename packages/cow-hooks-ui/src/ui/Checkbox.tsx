import { Input, Label, cn } from "@bleu/ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useFormContext, useWatch } from "react-hook-form";

export const Checkbox = ({
  name,
  label,
  isSelectedMessage,
  onSelectSideEffect,
  radius = 7,
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

  const center = radius;
  const secondRadius = (radius * 3) / 4;
  const thirdRadius = (radius * 3) / 8;
  const viewBoxSize = radius * 2;

  return (
    <div className="w-full flex flex-col items-start justify-start">
      <Label
        htmlFor={name}
        className="flex items-center hover:text-primary [&>div>svg>circle#circle1]:hover:fill-primary [&>div>svg>circle#circle3]:hover:fill-primary"
      >
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
          <svg
            width={viewBoxSize}
            height={viewBoxSize}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="overflow-visible cursor-pointer"
          >
            <title>rounded-checkbox</title>
            <circle
              id="circle1"
              cx={center}
              cy={center}
              r={radius}
              className="fill-color-primary-lighter transition-opacity"
            />
            <circle
              id="circle2"
              cx={center}
              cy={center}
              r={secondRadius}
              className="fill-color-paper transition-opacity"
            />
            <circle
              id="circle3"
              cx={center}
              cy={center}
              r={thirdRadius}
              className={cn("fill-color-primary-lighter transition-opacity", {
                "opacity-0": !isSelected,
              })}
            />
          </svg>
        </div>
        <span className="cursor-pointer">{label}</span>
      </Label>
      {isSelected && isSelectedMessage && (
        <span className="w-full text-center mt-1 py-1 rounded-xl font-normal text-xs bg-color-warning/15 text-color-warning-text">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1 inline" />
          {isSelectedMessage}
        </span>
      )}
    </div>
  );
};
