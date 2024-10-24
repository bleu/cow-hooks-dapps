import { PeriodWithScaleInput } from "@bleu/cow-hooks-ui";

import { periodScaleOptions } from "#/utils/schema";

export const PeriodInput = () => {
  return (
    <PeriodWithScaleInput
      periodScaleOptions={periodScaleOptions}
      namePeriodValue="period"
      namePeriodScale="periodScale"
      type="number"
      min="1"
      step="1"
      max="1000000000000"
      label="Vesting Period"
      validation={{ valueAsNumber: true, required: true }}
      onKeyDown={(e) =>
        ["e", "E", "+", "-", ".", ","].includes(e.key) && e.preventDefault()
      }
    />
  );
};
