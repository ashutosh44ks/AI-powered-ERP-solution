import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { SIDEBAR_STRUCTURE } from "@/lib/constants";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import type { Icon, IconProps } from "@tabler/icons-react";
import { AddWidgetDialog } from "./add-widget";

export function SiteHeader() {
  const location = useLocation();
  const [routeItem, setRouteItem] = useState<{
    title: string;
    id: string;
    url: string;
    icon: React.ForwardRefExoticComponent<
      IconProps & React.RefAttributes<Icon>
    >;
  } | null>(null);
  useEffect(() => {
    const routeItem = SIDEBAR_STRUCTURE.navMain.find(
      (item) => item.url === location.pathname
    );
    if (!routeItem) return;
    setRouteItem(routeItem);
  }, [location.pathname]);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{routeItem?.title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {routeItem?.id === "dashboard" && <AddWidgetDialog />}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <ModeToggle />
          </Button>
        </div>
      </div>
    </header>
  );
}
