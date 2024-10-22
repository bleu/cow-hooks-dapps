import type { ReactNode } from "react";

export const Info = ({ content }: { content: string | ReactNode }) => {
  return (
    <div className="flex flex-row justify-between bg-color-info-bg text-color-info-text items-center rounded-xl px-5 py-2 mb-2 text-sm gap-5">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={96}
          height={96}
          viewBox="0 0 32 32"
          className="w-full h-full fill-muted-foreground/50"
        >
          <title>info-icon</title>
          {/* Copied from cowswap assets: https://github.com/cowprotocol/cowswap/blob/4b89ecbf661e6c30193586c704e23c78b2bfc22b/libs/assets/src/cow-swap/alert-circle.svg */}
          <path
            fill="rgb(13, 94, 217)"
            d="M16 0C7.168 0 0 7.168 0 16s7.168 16 16 16 16-7.168 16-16S24.832 0 16 0Zm1.6 24h-3.2v-9.6h3.2V24Zm0-12.8h-3.2V8h3.2v3.2Z"
          />
        </svg>
      </div>
      {content}
    </div>
  );
};
