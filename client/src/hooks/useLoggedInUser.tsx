import { use } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";

export const useLoggedInUser = (): AuthContextType => {
  // The 'use' function is a new React 19 feature that can read context
  // and handle promises. It replaces the 'useContext' hook.
  const context = use(AuthContext);

  // This check ensures the hook is always used within a provider.
  if (!context) {
    throw new Error("useLoggedInUser must be used within an AuthProvider");
  }

  return context;
};
