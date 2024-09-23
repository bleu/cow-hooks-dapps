/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-var-requires

/** @type {import('next').NextConfig} */
const moduleExports = {
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ["@bleu/cow-hooks-ui"],
};

module.exports = moduleExports;
