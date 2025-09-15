import { useState, type ReactNode } from "react";
import { DataModelContext, type CustomMessage } from "./DataModelContext";

interface DataModelProviderProps {
  children: ReactNode;
}
export const DataModelProvider = ({ children }: DataModelProviderProps) => {
  const [messages, setMessages] = useState<CustomMessage[]>([]);

  const updateMessagesStack = (newMessages: CustomMessage[]) => {
    setMessages(newMessages);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const contextValue = { messages, updateMessagesStack, clearMessages };

  return (
    // This is the new, simplified provider syntax in React 19
    <DataModelContext value={contextValue}>{children}</DataModelContext>
  );
};
