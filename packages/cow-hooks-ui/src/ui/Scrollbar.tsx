import { cn } from "@bleu.builders/ui";
import type { ReactNode } from "react";

export function Scrollbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-sans overflow-y-auto font-normal h-screen text-color-text p-[16px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full",
        className,
      )}
      style={{ scrollbarGutter: "stable" }}
    >
      {children}
    </div>
  );
}
