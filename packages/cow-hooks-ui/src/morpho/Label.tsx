import type { PropsWithChildren } from "react";

export const Label = ({ children }: PropsWithChildren) => {
  return <span className="text-xs font-medium opacity-60">{children}</span>;
};
