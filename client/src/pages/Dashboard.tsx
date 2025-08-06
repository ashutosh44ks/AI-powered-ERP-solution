import { AppSidebar } from "@/components/app-sidebar";
import Widget from "@/components/Widget";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <ThesysThemeProvider mode={thesysTheme}>
          <div className="flex flex-1 flex-wrap gap-4 py-4 md:py-6 px-4 lg:px-6">
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
      </SidebarInset>
    </SidebarProvider>
  );
}
