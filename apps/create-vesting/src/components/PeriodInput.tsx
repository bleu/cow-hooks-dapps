import { PeriodWithScaleInput } from "@bleu/cow-hooks-ui";

import { periodScaleOptions } from "#/utils/schema";

export const PeriodInput = () => {
  return (
    <PeriodWithScaleInput
      periodScaleOptions={periodScaleOptions}
      namePeriodValue="period"
      namePeriodScale="periodScale"
      type="number"
      min="0.000000001"
      step="0.000000001"
      max="1000000000000"
      label="Lock-up Period"
      validation={{ valueAsNumber: true, required: true }}
      onKeyDown={(e) =>
        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
      }
    />
  );
};
