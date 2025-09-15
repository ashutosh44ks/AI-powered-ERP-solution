import { use } from "react";
import { DataModelContext, type DataModelContextType } from "./DataModelContext";

export const useDataModelConversation = (): DataModelContextType => {
  // The 'use' function is a new React 19 feature that can read context
  // and handle promises. It replaces the 'useContext' hook.
  const context = use(DataModelContext);

  // This check ensures the hook is always used within a provider.
  if (!context) {
    throw new Error("useDataModelConversation must be used within a DataModelProvider");
  }

  return context;
};
