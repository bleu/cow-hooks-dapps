"use client";

import { Input } from "@bleu/cow-hooks-ui";
import { Button, Label } from "@bleu/ui";
import { useFormContext } from "react-hook-form";
import type { withdrawSchema } from "#/utils/schema";

export function WithdrawPctSlider({ withdrawPct }: { withdrawPct: number }) {
  const form = useFormContext<typeof withdrawSchema._type>();

  const { setValue } = form;

  return (
    <div className="flex flex-col p-1">
      <div className="flex flex-row gap-x-2 items-center justify-between">
        <Label className="block text-sm">Withdraw percentage</Label>
        <div className="gap-1 hidden xsm:flex">
          {[25, 50, 75, 100].map((pct) => (
            <Button
              type="button"
              key={`pct-${pct}`}
              variant="ghost"
              className="rounded-2xl text-xs py-1 bg-accent text-accent-foreground opacity-50 hover:opacity-100 h-fit"
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
          className="w-full range accent-primary bg-background px-0"
          min={0}
          max={100}
          step={1}
        />
        <div className="pl-2 text-right text-sm">{withdrawPct}%</div>
      </div>
    </div>
  );
}
