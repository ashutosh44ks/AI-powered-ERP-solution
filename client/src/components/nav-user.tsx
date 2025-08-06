import { IconLogout } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router";
import { useLoggedInUser } from "@/hooks/useLoggedInUser";

export function NavUser() {
  const navigate = useNavigate();
  const { user, removeUserInfo } = useLoggedInUser();
  const currentUserEmail = user?.email;
  const logout = () => {
    removeUserInfo();
    navigate("/");
  };
  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    return parts.map(part => part.charAt(0).toUpperCase()).join("");
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src="/avatars/shadcn.jpg" alt={currentUserEmail || ""} />
            <AvatarFallback className="rounded-lg">
              {getInitials(currentUserEmail || "")}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{currentUserEmail?.split("@")[0]}</span>
            <span className="text-muted-foreground truncate text-xs">
              {currentUserEmail}
            </span>
          </div>
          <IconLogout className="ml-auto size-4" aria-label="Logout" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
