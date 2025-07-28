import { C1Component } from "@thesysai/genui-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import usePrompt from "../hooks/usePrompt";
import type {
  C1ResponseComponent,
  Widget as WidgetType,
} from "../lib/constants";
import { IconAlertCircle } from "@tabler/icons-react";
import SkeletonWidget from "./SkeletonWidget";
import { c1ResponseToJson, JsonToC1Response } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";

const Widget = ({ id, prompt }: WidgetType) => {
  // const {
  //   data: c1Response,
  //   loading: c1ResponseLoading,
  //   error: c1ResponseError,
  // } = usePrompt({ prompt });

  const c1Response = `<content>{ &quot;component&quot;: { &quot;component&quot;: &quot;Card&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;component&quot;: &quot;CardHeader&quot;, &quot;props&quot;: { &quot;title&quot;: &quot;Yes/No Distribution&quot;, &quot;subtitle&quot;: &quot;Equal 50-50 Split Analysis&quot; } }, { &quot;component&quot;: &quot;PieChart&quot;, &quot;props&quot;: { &quot;categoryKey&quot;: &quot;response&quot;, &quot;dataKey&quot;: &quot;value&quot;, &quot;data&quot;: [ { &quot;response&quot;: &quot;Yes&quot;, &quot;value&quot;: 50 }, { &quot;response&quot;: &quot;No&quot;, &quot;value&quot;: 50 } ] } }, { &quot;component&quot;: &quot;Accordion&quot;, &quot;props&quot;: { &quot;children&quot;: [ { &quot;value&quot;: &quot;analysis&quot;, &quot;trigger&quot;: { &quot;text&quot;: &quot;Detailed Analysis&quot; }, &quot;content&quot;: [ { &quot;component&quot;: &quot;TextContent&quot;, &quot;props&quot;: { &quot;textMarkdown&quot;: &quot;### Distribution Analysis\n\nThe data shows a perfect 50-50 split between Yes and No responses:\n\n- **Yes**: 50%\n- **No**: 50%\n\n### Key Observations\n- The distribution is perfectly balanced\n- There is no majority preference\n- Equal representation of both options\n\n### Recommendations\n1. Consider analyzing additional factors to understand decision drivers\n2. If this represents a decision outcome, additional criteria may be needed for tie-breaking\n3. Perfect splits might indicate a need for more granular response options&quot; } } ] } ] } } ] } } }</content>`;
  const c1ResponseLoading = false; // Simulating loading state
  const c1ResponseError = null; // Simulating no error

  const [isExpand, setIsExpand] = useState(false);
  const minimizeC1Response = (c1Response: string): string => {
    const decodedResponse = c1ResponseToJson(c1Response);
    // Here you can manipulate the decoded response if needed
    if (decodedResponse.component.component === "Card") {
      // usual response with Card component
      const newChildren = decodedResponse.component.props.children.filter(
        (child: C1ResponseComponent) =>
          child.component.includes("Chart") ||
          child.component.includes("CardHeader")
      );
      decodedResponse.component.props.children = newChildren;
    }
    // After manipulation, convert it back to the original format
    return JsonToC1Response(decodedResponse);
  };
  const handleExpand = () => {
    setIsExpand(!isExpand);
  };

  if (c1Response)
    return (
      <div className="w-96 relative">
        <Button
          variant="ghost"
          onClick={handleExpand}
          className="cursor-pointer absolute top-2 right-2 z-10"
        >
          {isExpand ? "Minimize" : "Expand"}
        </Button>
        {/* C1Component doesn't re-render upon c1Response change */}
        <div className="min-h-138">
          {isExpand && (
            <C1Component
              c1Response={c1Response}
              isStreaming={c1ResponseLoading}
            />
          )}
          {!isExpand && (
            <C1Component
              c1Response={minimizeC1Response(c1Response)}
              isStreaming={c1ResponseLoading}
            />
          )}
        </div>
      </div>
    );
  return (
    <Card className="w-96">
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
