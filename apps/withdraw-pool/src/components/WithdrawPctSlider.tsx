"use client";

import { Input } from "@bleu/cow-hooks-ui";
import { Button, Label } from "@bleu/ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { withdrawSchema } from "#/utils/schema";

export function WithdrawPctSlider() {
  const form = useFormContext<typeof withdrawSchema._type>();

  const { setValue, control } = form;

  const { withdrawPct } = useWatch({ control });
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-x-2 items-center mb-2">
        <Label className="block text-sm">Withdraw percentage</Label>
        <div className="flex gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <Button
              type="button"
              key={`pct-${pct}`}
              variant="ghost"
              onClick={() => setValue("withdrawPct", pct)}
            >
              {pct === 100 ? "Max" : `${pct}%`}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-between w-full items-center">
        <Input
          name="withdrawPct"
          type="range"
          className="w-full range accent-primary bg-background"
          min={0}
          max={100}
          step={1}
        />
        <div className="pl-2 text-right">{withdrawPct}%</div>
      </div>
    </div>
  );
}
