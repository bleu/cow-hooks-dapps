import type { ReactNode } from "react";

export const ContentWrapper = ({
  children,
  ...props
}: {
  children?: ReactNode;
}) => (
  <div
    className="flex flex-col flex-grow pt-2 items-start justify-center text-center"
    {...props}
  >
    {children}
  </div>
);

export const Wrapper = ({ children, ...props }: { children?: ReactNode }) => (
  <div
    className="flex flex-col flex-wrap w-full flex-grow px-3 pb-[16px]"
    {...props}
  >
    {children}
  </div>
);
