import { AppSidebar } from "@/components/app-sidebar";
import Widget from "@/components/Widget";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useWidgets from "@/hooks/useWidgets";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ThemeProvider as ThesysThemeProvider } from "@thesysai/genui-sdk";
import { useTheme } from "@/components/theme-provider";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  const { theme } = useTheme();
  const thesysTheme = theme === "system" ? "dark" : theme;

  useEffect(() => {
    if (!currentUserEmail) {
      navigate("/");
    }
  }, [currentUserEmail, navigate]);

  // actual work with widgets
  const { widgets, addWidget } = useWidgets(currentUserEmail);

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
        <SiteHeader
          handleAddWidget={(prompt) =>
            addWidget({ id: Date.now().toString(), prompt })
          }
        />
        <ThesysThemeProvider mode={thesysTheme}>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <main className="flex flex-wrap gap-4">
                    {widgets.map((widget) => (
                      <Widget
                        key={widget.id}
                        id={widget.id}
                        prompt={widget.prompt}
                        setExpandedWidgetId={setExpandedWidgetId}
                        expandedWidgetId={expandedWidgetId}
                      />
                    ))}
                  </main>
                </div>
              </div>
            </div>
          </div>
        </ThesysThemeProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
