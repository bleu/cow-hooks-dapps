import type { ReactNode } from "react";

export function Scrollbar({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-sans overflow-y-auto font-normal h-screen text-color-text p-[16px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full"
      style={{ scrollbarGutter: "stable" }}
    >
      {children}
    </div>
  );
}
