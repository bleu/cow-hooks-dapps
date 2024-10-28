/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-var-requires

/** @type {import('next').NextConfig} */
const moduleExports = {
  transpilePackages: ["@bleu/cow-hooks-ui"],
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = moduleExports;
