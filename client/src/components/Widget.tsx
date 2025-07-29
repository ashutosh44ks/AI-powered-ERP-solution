import { C1Component } from "@thesysai/genui-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import usePrompt from "../hooks/usePrompt";
import type { Widget as WidgetType } from "../lib/constants";
import {
  IconAlertCircle,
  IconArrowsMaximize,
  IconArrowsMinimize,
} from "@tabler/icons-react";
import SkeletonWidget from "./SkeletonWidget";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface WidgetProps extends WidgetType {
  setExpandedWidgetId: (id: string | null) => void;
  expandedWidgetId: string | null;
}

const Widget = ({
  id,
  prompt,
  setExpandedWidgetId,
  expandedWidgetId,
}: WidgetProps) => {
  const {
    data: c1Response,
    loading: c1ResponseLoading,
    error: c1ResponseError,
  } = usePrompt({ prompt });

  // const c1Response = `<content>{ &quot;component&quot;: { &quot;component&quot;: &quot;Card&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;component&quot;: &quot;CardHeader&quot;, &quot;props&quot;: { &quot;title&quot;: &quot;Yes/No Distribution&quot;, &quot;subtitle&quot;: &quot;Equal 50-50 Split Analysis&quot; } }, { &quot;component&quot;: &quot;PieChart&quot;, &quot;props&quot;: { &quot;categoryKey&quot;: &quot;response&quot;, &quot;dataKey&quot;: &quot;value&quot;, &quot;data&quot;: [ { &quot;response&quot;: &quot;Yes&quot;, &quot;value&quot;: 50 }, { &quot;response&quot;: &quot;No&quot;, &quot;value&quot;: 50 } ] } }, { &quot;component&quot;: &quot;Accordion&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;value&quot;: &quot;analysis&quot;, &quot;trigger&quot;: { &quot;text&quot;: &quot;Detailed Analysis&quot; }, &quot;content&quot;: [ { &quot;component&quot;: &quot;TextContent&quot;, &quot;props&quot;: { &quot;textMarkdown&quot;: &quot;### Distribution Analysis\n\nThe data shows a perfect 50-50 split between Yes and No responses:\n\n- **Yes**: 50%\n- **No**: 50%\n\n### Key Observations\n- The distribution is perfectly balanced\n- There is no majority preference\n- Equal representation of both options\n\n### Recommendations\n1. Consider analyzing additional factors to understand decision drivers\n2. If this represents a decision outcome, additional criteria may be needed for tie-breaking\n3. Perfect splits might indicate a need for more granular response options&quot; } } ] } ] } } ] } } }</content>`;
  // const c1ResponseLoading = false; // Simulating loading state
  // const c1ResponseError = null; // Simulating no error

  const handleExpand = () => {
    if (expandedWidgetId === id) {
      setExpandedWidgetId(null);
    } else {
      setExpandedWidgetId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const isExpand = expandedWidgetId === id;
  if (expandedWidgetId !== null && !isExpand) return null;
  if (c1Response)
    return (
      <div
        className={cn(
          "relative transition-all duration-500 delay-100 ease-in-out",
          isExpand ? "w-full show-markdown" : "w-96 hide-markdown"
        )}
        style={{
          maxWidth: "calc(100vw - var(--sidebar-width) - 2rem)",
        }}
        id={id}
      >
        <Button
          variant="ghost"
          onClick={handleExpand}
          className="cursor-pointer absolute top-2 right-2 z-10"
        >
          {isExpand ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
        </Button>
        {/* NOTE - C1Component doesn't re-render upon c1Response change */}
        <div className="min-h-138">
          <C1Component
            c1Response={c1Response}
            isStreaming={c1ResponseLoading}
          />
        </div>
      </div>
    );
  return (
    <Card className="w-96 h-138">
      <CardHeader>
        <CardTitle>Widget</CardTitle>
        <CardDescription className="overflow-hidden text-ellipsis whitespace-nowrap max-w-72">
          {prompt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {c1ResponseError && (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <IconAlertCircle className="size-4" />
            Error: {c1ResponseError}
          </p>
        )}
        {c1ResponseLoading && <SkeletonWidget />}
      </CardContent>
    </Card>
  );
};

export default Widget;
