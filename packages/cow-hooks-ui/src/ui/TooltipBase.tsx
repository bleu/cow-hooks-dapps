"use client";

import { Tooltip, TooltipTrigger, cn } from "@bleu.builders/ui";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";

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
  const tooltipRef = useRef<HTMLButtonElement | null>(null);
  const preventClose = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (preventClose.current) {
        preventClose.current = false;
        return;
      }

      const target = event.target as Node;
      if (tooltipRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    // Handle both mouse and touch events
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

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

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    preventClose.current = true;
    setIsOpen(true);
  };

  return (
    <Tooltip
      side={side}
      content={text}
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-color-paper-darker text-color-text touch-none rounded-xl"
    >
      <TooltipTrigger
        ref={tooltipRef}
        type="button"
        onMouseDownCapture={handleClick}
        onTouchStartCapture={handleClick}
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={cn(
          "cursor-pointer hover:text-primary",
          isOpen ? "text-primary" : "",
          className,
        )}
      >
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onMouseDownCapture={(e) => {
              e.stopPropagation();
              preventClose.current = true;
            }}
            onTouchStartCapture={(e) => {
              e.stopPropagation();
              preventClose.current = true;
            }}
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
