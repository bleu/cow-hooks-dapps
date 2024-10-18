/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const commonConfig = require("../../packages/cow-hooks-ui/tailwind.config.base.js");

/** @type {import("tailwindcss").Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@bleu/ui/dist/**/*",
    "../../node_modules/@bleu/ui/dist/**/*",
    "../../packages/cow-hooks-ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/cow-hooks-ui/node_modules/tailwind-scrollbar/**/*",
  ],
  theme: commonConfig.theme,
  plugins: commonConfig.plugins,
};
