import { PeriodWithScaleInput } from "@bleu/cow-hooks-ui";

import { periodScaleOptions } from "#/utils/schema";

export const PeriodInput = () => {
  return (
    <PeriodWithScaleInput
      periodScaleOptions={periodScaleOptions}
      namePeriodValue="period"
      namePeriodScale="periodScale"
      type="number"
      label="Lock-up Period"
      validation={{ valueAsNumber: true, required: true }}
      onKeyDown={(e) =>
        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
      }
    />
  );
};
