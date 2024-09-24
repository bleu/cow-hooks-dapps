"use client";

import { Tooltip, TooltipTrigger } from "@bleu/ui";
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
}: {
  // get type from the InfoTooltip component
  text?: Parameters<typeof Tooltip>[0]["content"];
  link?: string;
  variant?: "default" | "question" | "error";
  side?: "top" | "right" | "bottom" | "left";
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
      >
        {link ? (
          <a href={link} target="_blank">
            <Icon />
          </a>
        ) : (
          <Icon />
        )}
      </TooltipTrigger>
    </Tooltip>
  );
};
