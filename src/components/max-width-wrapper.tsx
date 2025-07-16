import { cn } from "@/lib/utils";
import React from "react";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

const MaxWidthWrapper = ({ children, className }: MaxWidthWrapperProps) => {
  return (
    <div
      className={cn(
        "max-w-screen-xl mx-auto px-4 md:px-12 w-full min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
