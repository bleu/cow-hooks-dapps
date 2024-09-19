// @ts-check
// biome-ignore lint:
const escape = require("shell-quote").quote;

const isWin = process.platform === "win32";

/**
 * Concatenate and escape a list of filenames that can be passed as args to prettier cli
 *
 * Prettier has an issue with special characters in filenames,
 * such as the ones uses for nextjs dynamic routes (ie: [id].tsx...)
 *
 * @link https://github.com/okonet/lint-staged/issues/676
 *
 * @param {string[]} filenames
 * @returns {string} Return concatenated and escaped filenames
 */
const concatFilesForPrettier = (filenames) =>
  filenames
    .map((filename) => `"${isWin ? filename : escape([filename])}"`)
    .join(" ");

const concatFilesForStylelint = concatFilesForPrettier;

module.exports = {
  concatFilesForPrettier,
  concatFilesForStylelint,
};
