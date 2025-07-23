import { C1Component } from "@thesysai/genui-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import usePrompt from "../utils/usePrompt";
import type { Widget as WidgetType } from "../utils/constants";
import { IconAlertCircle } from "@tabler/icons-react";
import SkeletonWidget from "./SkeletonWidget";

const Widget = ({ id, prompt }: WidgetType) => {
  // const {
  //   data: c1Response,
  //   loading: c1ResponseLoading,
  //   error: c1ResponseError,
  // } = usePrompt({ prompt });

  const c1Response = `<content>{
  &quot;component&quot;: {
    &quot;component&quot;: &quot;Card&quot;,
    &quot;props&quot;: {
      &quot;children&quot;: [
        {
          &quot;component&quot;: &quot;CardHeader&quot;,
          &quot;props&quot;: {
            &quot;title&quot;: &quot;Property Stats Analysis - July 2025&quot;,
            &quot;subtitle&quot;: &quot;Weekly Property Performance Overview&quot;
          }
        },
        {
          &quot;component&quot;: &quot;Accordion&quot;,
          &quot;props&quot;: {
            &quot;children&quot;: [
              {
                &quot;value&quot;: &quot;summary&quot;,
                &quot;trigger&quot;: {
                  &quot;text&quot;: &quot;Summary Analysis&quot;,
                  &quot;icon&quot;: {
                    &quot;component&quot;: &quot;Icon&quot;,
                    &quot;props&quot;: {
                      &quot;name&quot;: &quot;clipboard-list&quot;
                    }
                  }
                },
                &quot;content&quot;: [
                  {
                    &quot;component&quot;: &quot;TextContent&quot;,
                    &quot;props&quot;: {
                      &quot;textMarkdown&quot;: &quot;**Key Findings:**\n\n- Total Properties Added: 6 properties\n- Total Duration: 128,498 units\n- Productive Time: 81,171 units (63.2%)\n- Idle Time: 12,757 units (9.9%)\n- Activities: Blowing, Mowing, Trimming\n- Average Time per Property: ~21,416 units&quot;
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          &quot;component&quot;: &quot;PieChart&quot;,
          &quot;props&quot;: {
            &quot;categoryKey&quot;: &quot;activity&quot;,
            &quot;dataKey&quot;: &quot;duration&quot;,
            &quot;data&quot;: [
              {
                &quot;activity&quot;: &quot;Production&quot;,
                &quot;duration&quot;: 81171
              },
              {
                &quot;activity&quot;: &quot;Idle&quot;,
                &quot;duration&quot;: 12757
              },
              {
                &quot;activity&quot;: &quot;Other&quot;,
                &quot;duration&quot;: 34570
              }
            ]
          }
        },
        {
          &quot;component&quot;: &quot;Accordion&quot;,
          &quot;props&quot;: {
            &quot;children&quot;: [
              {
                &quot;value&quot;: &quot;recommendations&quot;,
                &quot;trigger&quot;: {
                  &quot;text&quot;: &quot;Recommendations&quot;,
                  &quot;icon&quot;: {
                    &quot;component&quot;: &quot;Icon&quot;,
                    &quot;props&quot;: {
                      &quot;name&quot;: &quot;lightbulb&quot;
                    }
                  }
                },
                &quot;content&quot;: [
                  {
                    &quot;component&quot;: &quot;TextContent&quot;,
                    &quot;props&quot;: {
                      &quot;textMarkdown&quot;: &quot;**Improvement Opportunities:**\n\n1. **Reduce Idle Time**: Current idle time is ~10% of total duration. Consider optimizing scheduling to minimize equipment downtime.\n\n2. **Productivity Enhancement**: While production time is good at 63%, there&#39;s room for improvement in the remaining 27% unaccounted time.\n\n3. **Workload Distribution**: With 6 properties, consider evaluating if the workload is evenly distributed across the week to maximize efficiency.\n\n4. **Time Tracking**: Implement more detailed time tracking to account for the unclassified time (neither production nor idle).&quot;
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}</content>`;
  const c1ResponseLoading = false; // Simulating loading state
  const c1ResponseError = null; // Simulating no error
  return (
    <Card className="min-w-80">
      <CardHeader>
        <CardTitle>Widget {id}</CardTitle>
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
        <C1Component
          c1Response={c1Response}
          isStreaming={c1ResponseLoading}
          // updateMessage={(message) => actions.setC1Response(message)}
        />
      </CardContent>
    </Card>
  );
};

export default Widget;
