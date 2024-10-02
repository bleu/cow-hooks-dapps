// @ts-check

/**
 * This files overrides the base lint-staged.config.js present in the root directory.
 * It allows to run eslint based the package specific requirements.
 * {@link https://github.com/okonet/lint-staged#how-to-use-lint-staged-in-a-multi-package-monorepo}
 * {@link https://github.com/belgattitude/nextjs-monorepo-example/blob/main/docs/about-lint-staged.md}
 */

const { concatFilesForPrettier } = require("../../lint-staged.common.js");

/**
 * @type {Record<string, (filenames: string[]) => string | string[] | Promise<string | string[]>>}
 */
const rules = {
  "**/*.{css,scss,ts,js,tsx,jsx,mjs}": (filenames) => {
    return [`pnpm biome check --write ${concatFilesForPrettier(filenames)}`];
  },
  "**/*.{json,md,mdx,html,yml,yaml}": (filenames) => {
    return [`prettier --write ${concatFilesForPrettier(filenames)}`];
  },
};

module.exports = rules;
