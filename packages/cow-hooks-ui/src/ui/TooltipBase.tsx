"use client";

import { useState } from "react";
import { Tooltip, TooltipTrigger, cn } from "@bleu.builders/ui";
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
  text?: Parameters<typeof Tooltip>[0]["content"];
  link?: string;
  variant?: "default" | "question" | "error";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsOpen(true);
    // Auto-hide tooltip after 1.5 seconds on mobile
    setTimeout(() => setIsOpen(false), 1500);
  };

  const handleClick = (e: React.MouseEvent) => {
    // For desktop clicks, toggle the tooltip
    setIsOpen(!isOpen);
    // Prevent click from bubbling up
    e.stopPropagation();
  };

  // Close tooltip when clicking outside
  const handleOutsideClick = () => {
    setIsOpen(false);
  };

  // Add event listener for outside clicks
  if (typeof window !== "undefined") {
    window.addEventListener("click", handleOutsideClick);
  }

  return (
    <Tooltip
      side={side}
      content={text}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-color-paper-darker text-color-text touch-none rounded-xl"
    >
      <TooltipTrigger
        onFocusCapture={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={handleTouch}
        onClick={handleClick}
        type="button"
        className={cn(
          "cursor-pointer hover:text-primary touch-manipulation",
          className
        )}
      >
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon />
          </a>
        ) : (
          <Icon />
        )}
      </TooltipTrigger>
    </Tooltip>
  );
};
