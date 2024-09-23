import React from "react";
import type { ReactNode } from "react";

// import ICON_CHECKMARK from "@cowprotocol/assets/cow-swap/checkmark.svg";
// import ICON_ARROW_DOWN from "@cowprotocol/assets/images/carret-down.svg";
// import { UI } from "@cowprotocol/ui";

// import SVG from "react-inlinesvg";
// import styled from "styled-components/macro";

export const ContractInput = ({
  children,
  ...props
}: {
  children?: ReactNode;
}) => (
  <div
    className="flex items-center justify-between cursor-pointer rounded-xl border border-text-opacity-10 p-3 transition-colors duration-200 ease-in-out hover:bg-primary-lighter hover:text-paper-darkest"
    {...props}
  >
    {children}
  </div>
);

export const ClaimableAmountContainer = ({
  children,
  ...props
}: {
  children?: ReactNode;
}) => (
  <div
    className="flex justify-between items-center bg-background p-3 my-4 rounded-xl"
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
    className="flex flex-col flex-grow items-center justify-center text-center"
    {...props}
  >
    {children}
  </div>
);

export const Input = ({ ...props }) => (
  <input
    className="w-full my-2.5 mt-0 p-2.5 rounded-xl outline-none text-base font-bold border border-border bg-paper-darker text-inherit focus:border-primary"
    {...props}
  />
);

export const Link = ({ children, ...props }: { children?: ReactNode }) => (
  <button
    className="border-none p-0 underline cursor-pointer bg-transparent text-white my-2.5"
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
  <div className="flex flex-col flex-wrap w-full pb-4 flex-grow" {...props}>
    {children}
  </div>
);

export const LabelContainer = ({ label, ...props }: { label: string }) => (
  <div className="w-fit my-2.5" {...props}>
    <label className="font-semibold text-sm">{label}</label>
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
      bg-primary text-button-text text-lg font-semibold border-none shadow-none rounded-2xl
      relative min-h-[58px] transition-colors duration-200 ease-in-out m-0 flex flex-row flex-wrap items-center justify-center
      focus:text-text1 focus:shadow-none focus:transform-none focus:bg-primary-lighter
      hover:text-text1 hover:shadow-none hover:transform-none hover:bg-primary-lighter
      active:text-text1 active:shadow-none active:transform-none active:bg-primary-lighter
      disabled:border-transparent disabled:outline-none disabled:cursor-auto disabled:shadow-none
      ${
        disabled
          ? "disabled:bg-bg2 disabled:text-white disabled:opacity-70"
          : "disabled:bg-background disabled:text-info disabled:opacity-100"
      }
    `}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
