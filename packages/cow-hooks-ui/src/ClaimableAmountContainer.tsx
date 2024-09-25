import type { ReactNode } from "react";

export const ClaimableAmountContainer = ({
  children,
  ...props
}: {
  children?: ReactNode;
}) => (
  <div
    className="flex justify-between items-center bg-color-background p-3 my-4 rounded-xl"
    {...props}
  >
    {children}
  </div>
);
