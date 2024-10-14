import { cn } from "@bleu/ui";
import * as React from "react";

enum SpinnerSize {
  sm = 6,
  md = 12,
  lg = 20,
}

export function Spinner({ size = "md" }: { size?: keyof typeof SpinnerSize }) {
  const SpinnerSizeNumber = SpinnerSize[size];
  return (
    <div className="flex w-full flex-col items-center rounded-3xl">
      <div
        className={cn(
          "border-6 animate-spin rounded-full border-2 border-transparent border-l-primary ",
          {
            "h-4 w-4": SpinnerSizeNumber === SpinnerSize.sm,
            "h-12 w-12": SpinnerSizeNumber === SpinnerSize.md,
            "h-20 w-20": SpinnerSizeNumber === SpinnerSize.lg,
          },
        )}
      />
    </div>
  );
}
