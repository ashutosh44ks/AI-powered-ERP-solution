import type { CustomMessage } from "@/hooks/DataModelContext";
import { useLoggedInUser } from "@/hooks/useLoggedInUser";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatItemProps {
  msg: CustomMessage;
}

const ChatItem = ({ msg }: ChatItemProps) => {
  const { user } = useLoggedInUser();
  const currentUserEmail = user?.email;
  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  };
  return (
    <div
      className={cn(
        "flex gap-2",
        msg.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src="/avatars/shadcn.jpg" alt={currentUserEmail || ""} />
        <AvatarFallback
          className={cn(
            "rounded-full border",
            msg.role === "user" ? "grayscale" : "bg-sky-600"
          )}
        >
          {msg.role === "user" ? getInitials(currentUserEmail || "") : "AI"}
        </AvatarFallback>
      </Avatar>
      <div
        className={`w-2/5 px-4 py-3 rounded-lg ${
          msg.role === "user"
            ? "bg-blue-100 ml-auto text-right dark:bg-blue-900"
            : "bg-gray-200 mr-auto text-left dark:bg-gray-800"
        }`}
      >
        <h6 className="font-semibold mb-1">
          {msg.role === "user" ? "You" : "AI Assistant"}
        </h6>
        <p className="text-sm">{msg.content}</p>
      </div>
    </div>
  );
};

export default ChatItem;
