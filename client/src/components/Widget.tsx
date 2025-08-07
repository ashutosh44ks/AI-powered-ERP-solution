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
  IconRefresh,
} from "@tabler/icons-react";
import SkeletonWidget from "./SkeletonWidget";
import { Button } from "./ui/button";
import WidgetWrapper from "./WidgetWrapper";

interface WidgetProps extends WidgetType {
  setExpandedWidgetId: (id: string | null) => void;
  expandedWidgetId: string | null;
}

const Widget = ({
  id,
  prompt,
  // content,
  setExpandedWidgetId,
  expandedWidgetId,
}: WidgetProps) => {
  const {
    data: c1Response,
    loading: c1ResponseLoading,
    error: c1ResponseError,
    refetch: refetchC1Response,
    isRefetching: isC1ResponseRefetching,
  } = usePrompt({ prompt, id });

  // const c1Response = `<content>{ &quot;component&quot;: { &quot;component&quot;: &quot;Card&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;component&quot;: &quot;CardHeader&quot;, &quot;props&quot;: { &quot;title&quot;: &quot;Yes/No Distribution&quot;, &quot;subtitle&quot;: &quot;Equal 50-50 Split Analysis&quot; } }, { &quot;component&quot;: &quot;PieChart&quot;, &quot;props&quot;: { &quot;categoryKey&quot;: &quot;response&quot;, &quot;dataKey&quot;: &quot;value&quot;, &quot;data&quot;: [ { &quot;response&quot;: &quot;Yes&quot;, &quot;value&quot;: 50 }, { &quot;response&quot;: &quot;No&quot;, &quot;value&quot;: 50 } ] } }, { &quot;component&quot;: &quot;Accordion&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;value&quot;: &quot;analysis&quot;, &quot;trigger&quot;: { &quot;text&quot;: &quot;Detailed Analysis&quot; }, &quot;content&quot;: [ { &quot;component&quot;: &quot;TextContent&quot;, &quot;props&quot;: { &quot;textMarkdown&quot;: &quot;### Distribution Analysis\n\nThe data shows a perfect 50-50 split between Yes and No responses:\n\n- **Yes**: 50%\n- **No**: 50%\n\n### Key Observations\n- The distribution is perfectly balanced\n- There is no majority preference\n- Equal representation of both options\n\n### Recommendations\n1. Consider analyzing additional factors to understand decision drivers\n2. If this represents a decision outcome, additional criteria may be needed for tie-breaking\n3. Perfect splits might indicate a need for more granular response options&quot; } } ] } ] } } ] } } }</content>`;
  // const c1ResponseLoading = false; // Simulating loading state
  // const c1ResponseError = null; // Simulating no error
  // const refetchC1Response = () => {
  //   console.log("Refetching C1 response...");
  // };
  // const isC1ResponseRefetching = false; // Simulating no refetching state

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
      <WidgetWrapper
        id={id}
        isExpand={isExpand}
        controls={
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant="ghost"
              onClick={refetchC1Response}
              className="cursor-pointer rounded-l-none"
              size="icon"
            >
              <IconRefresh
                className={isC1ResponseRefetching ? "animate-spin" : ""}
              />
            </Button>
            <Button
              variant="ghost"
              onClick={handleExpand}
              className="cursor-pointer rounded-r-none"
              size="icon"
            >
              {isExpand ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
            </Button>
          </div>
        }
      >
        {/* NOTE - C1Component doesn't re-render upon c1Response change */}
        <div className="min-h-138">
          <C1Component
            c1Response={c1Response}
            isStreaming={c1ResponseLoading}
          />
        </div>
      </WidgetWrapper>
    );
  // We can work on this later to handle the loading state better.
  // Basically we can show last content while loading new content
  // the new content will NOT be streamed because 
  // streamed content is loaded top to bottom (including the card)
  // and we want instant replacement of old content with new content
  // if (c1ResponseLoading && content)
  //   return (
  //     <WidgetWrapper id={id} isExpand={isExpand} controls={null}>
  //       <div className="min-h-138">
  //         <C1Component c1Response={content} isStreaming={c1ResponseLoading} />
  //       </div>
  //     </WidgetWrapper>
  //   );
  return (
    <Card className="w-96 h-138">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Widget</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetchC1Response}
            className="cursor-pointer"
          >
            <IconRefresh
              className={isC1ResponseRefetching ? "animate-spin" : ""}
            />
          </Button>
        </CardTitle>
        <CardDescription className="overflow-hidden text-ellipsis whitespace-nowrap max-w-72">
          {prompt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {c1ResponseLoading ? (
          <SkeletonWidget />
        ) : c1ResponseError ? (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <IconAlertCircle className="size-4 shrink-0" />
            Error: {c1ResponseError}
          </p>
        ) : (
          <span>...</span>
        )}
      </CardContent>
    </Card>
  );
};

export default Widget;
