import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import dataModels from "@/services/dataModels";

export function NavMain({
  items,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (url: string) => location.pathname === url;

  const { data } = useQuery({
    queryKey: ["dbTables"],
    queryFn: dataModels.getDBTables,
    staleTime: Infinity,
  });
  const dbTables = data?.data || [];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActiveItem = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActiveItem}
                  onClick={() => navigate(item.url)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          {dbTables.map((table) => (
            <SidebarMenuItem key={table.value}>
              <SidebarMenuButton
                tooltip={table.label}
                isActive={isActive(`/data-models/${table.value}`)}
                onClick={() => navigate(`/data-models/${table.value}`)}
              >
                <span className="ml-6">
                  {table.label}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
