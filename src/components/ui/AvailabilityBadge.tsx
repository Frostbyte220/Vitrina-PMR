import React from "react";
import { getAvailabilityInfo } from "@/lib/availability";

interface AvailabilityBadgeProps {
  availability?: string | null;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export function AvailabilityBadge({
  availability,
  size = "sm",
  showDot = true,
  className = "",
}: AvailabilityBadgeProps) {
  const info = getAvailabilityInfo(availability);

  const sizeStyles = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-[11px] px-2 py-0.5 gap-1.5 font-medium",
    md: "text-xs px-2.5 py-1 gap-1.5 font-semibold",
  }[size];

  const dotSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs select-none ${info.badgeClass} ${sizeStyles} ${className}`}
      title={info.description}
    >
      {showDot && (
        <span
          className={`shrink-0 rounded-full ${info.dotClass} ${dotSizes} animate-pulse`}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{info.label}</span>
    </span>
  );
}
