"use client";

import { Input } from "@bleu/cow-hooks-ui";
import { Button, Label, cn } from "@bleu/ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { withdrawSchema } from "#/utils/schema";

export function WithdrawPctSlider() {
  const form = useFormContext<typeof withdrawSchema._type>();

  const { setValue, control } = form;

  const withdrawPct = useWatch({ control, name: "withdrawPct" });

  return (
    <div className="flex flex-col p-1 items-center gap-2">
      <Label className="block text-sm">Withdraw percentage</Label>
      <div className="gap-2 hidden xsm:flex">
        {[25, 50, 75, 100].map((pct) => (
          <Button
            type="button"
            key={`pct-${pct}`}
            variant="ghost"
            className={cn(
              "rounded-2xl text-xs py-1 bg-accent text-accent-foreground opacity-50 hover:opacity-100 h-fit",
              withdrawPct.toString() === pct.toString() ? "opacity-100" : "",
            )}
            onClick={() => setValue("withdrawPct", pct)}
          >
            {pct === 100 ? "Max" : `${pct}%`}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 justify-between w-full items-center px-1">
        <Input
          name="withdrawPct"
          type="range"
          className="w-full range accent-primary bg-background p-0"
          min={0}
          max={100}
          step={1}
        />
        <div className="pl-2 text-right text-sm">{withdrawPct}%</div>
      </div>
    </div>
  );
}
