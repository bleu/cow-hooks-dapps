import React from "react";
import type { ReactNode } from "react";

// import ICON_CHECKMARK from "@cowprotocol/assets/cow-swap/checkmark.svg";
// import ICON_ARROW_DOWN from "@cowprotocol/assets/images/carret-down.svg";
// import { UI } from "@cowprotocol/ui";

// import SVG from "react-inlinesvg";
// import styled from "styled-components/macro";

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

export const ContentWrapper = ({
  children,
  ...props
}: {
  children?: ReactNode;
}) => (
  <div
    className="flex flex-col flex-grow pt-2 items-center justify-center text-center"
    {...props}
  >
    {children}
  </div>
);

export const Input = ({ ...props }) => (
  <input
    className="w-full mt-0 p-2.5 rounded-xl outline-none text-color-text-paper border border-color-border bg-color-paper-darker focus:border-primary"
    {...props}
  />
);

export const Link = ({ children, ...props }: { children?: ReactNode }) => (
  <button
    className="border-none p-0 underline cursor-pointer bg-transparent text-color-white my-2.5"
    {...props}
  >
    {children}
  </button>
);

export const Row = ({ children, ...props }: { children?: ReactNode }) => (
  <div className="flex flex-col w-full" {...props}>
    {children}
  </div>
);

export const Wrapper = ({ children, ...props }: { children?: ReactNode }) => (
  <div className="flex flex-col flex-wrap w-full flex-grow" {...props}>
    {children}
  </div>
);

export const LabelContainer = ({ label, ...props }: { label: string }) => (
  <div className="w-fit my-2.5" {...props}>
    <label className="text-sm">{label}</label>
  </div>
);

export const ButtonPrimary = ({
  children,
  disabled = false,
  ...props
}: {
  children?: ReactNode;
  disabled?: boolean;
}) => (
  <button
    className={`
      bg-color-primary text-color-button-text text-lg font-semibold border-none shadow-none rounded-2xl
      relative min-h-[58px] transition-colors duration-200 ease-in-out mt-2 flex flex-row flex-wrap items-center justify-center
       focus:shadow-none focus:transform-none focus:bg-color-primary-lighter
       hover:shadow-none hover:transform-none hover:bg-color-primary-lighter
       active:shadow-none active:transform-none active:bg-color-primary-lighter
      disabled:border-transparent disabled:outline-none disabled:cursor-auto disabled:shadow-none
      ${
        disabled
          ? "disabled:bg-color-bg2 disabled:text-color-white disabled:opacity-70"
          : "disabled:bg-color-background disabled:text-color-info disabled:opacity-100"
      }
    `}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
