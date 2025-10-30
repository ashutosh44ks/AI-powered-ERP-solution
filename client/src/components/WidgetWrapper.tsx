import { cn } from "@/lib/utils";
import React from "react";

interface WidgetWrapperProps {
  children: React.ReactNode;
  id: string;
  isExpand: boolean;
  controls: React.ReactNode;
}
const WidgetWrapper = ({
  children,
  id,
  isExpand,
  controls,
}: WidgetWrapperProps) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-500 delay-100 ease-in-out group",
        isExpand ? "w-full show-markdown" : "w-96 hide-markdown"
      )}
      style={{
        maxWidth: "calc(100vw - var(--sidebar-width) - 4rem)",
      }}
      id={id}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {controls}
      </div>
      {children}
    </div>
  );
};

export default WidgetWrapper;
