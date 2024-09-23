"use client";
import { ThemeProvider } from "./ThemeContext";
import { ClaimVestingApp } from "./ClaimVestingApp";

export default function Page() {
  return (
    <ThemeProvider>
      <ClaimVestingApp />
    </ThemeProvider>
  );
}
