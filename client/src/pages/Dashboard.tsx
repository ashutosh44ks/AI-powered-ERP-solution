import Widget from "@/components/Widget";
import { useState } from "react";
import { ThemeProvider as ThesysThemeProvider } from "@thesysai/genui-sdk";
import { useTheme } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import widgetService from "@/services/widgets";
import type { APIResponse, Widget as WidgetType } from "@/lib/constants";

export default function Dashboard() {
  const { data } = useQuery<APIResponse<WidgetType[]>>({
    queryKey: ["widgets"],
    queryFn: widgetService.getAllWidgets,
  });
  const widgets = data?.data || [];

  const { theme } = useTheme();
  const thesysTheme = theme === "system" ? "dark" : theme;

  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);

  return (
    <ThesysThemeProvider mode={thesysTheme}>
      <div className="flex flex-1 flex-wrap gap-4">
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            {...widget}
            setExpandedWidgetId={setExpandedWidgetId}
            expandedWidgetId={expandedWidgetId}
          />
        ))}
      </div>
    </ThesysThemeProvider>
  );
}
