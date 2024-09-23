/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@bleu/ui/dist/**/*",
    "../../packages/cow-hooks-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
