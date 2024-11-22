"use client";

import { cn, Tooltip, TooltipTrigger } from "@bleu.builders/ui";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

export const InfoTooltip = ({
  text,
  link,
  variant = "default",
  side = "top",
  className,
}: {
  // get type from the InfoTooltip component
  text?: Parameters<typeof Tooltip>[0]["content"];
  link?: string;
  variant?: "default" | "question" | "error";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) => {
  if (!text) return null;

  function Icon() {
    switch (variant) {
      case "question":
        return <QuestionMarkCircledIcon />;
      case "error":
        return <ExclamationTriangleIcon />;
      default:
        return <InfoCircledIcon />;
    }
  }

  return (
    <Tooltip side={side} content={text}>
      <TooltipTrigger
        onFocusCapture={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        disabled
        className={cn("cursor-pointer", className)}
      >
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            <Icon />
          </a>
        ) : (
          <Icon />
        )}
      </TooltipTrigger>
    </Tooltip>
  );
};
