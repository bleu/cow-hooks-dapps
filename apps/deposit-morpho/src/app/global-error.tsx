"use client";

import { GlobalError } from "@bleu/cow-hooks-ui";

export default function GlobalErrorPage({ error }: { error: Error }) {
  /* eslint-disable-next-line no-console */
  console.error(error);

  return <GlobalError />;
}
