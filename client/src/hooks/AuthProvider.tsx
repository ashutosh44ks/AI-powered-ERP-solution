import { useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const storeUserInfo = (userData: User) => {
    console.log("Storing user info:", userData);
    localStorage.setItem("currentUserEmail", userData.email);
    setUser(userData);
  };
  const removeUserInfo = () => {
    localStorage.removeItem("currentUserEmail");
    setUser(null);
  };

  const contextValue = { user, storeUserInfo, removeUserInfo };

  return (
    // This is the new, simplified provider syntax in React 19
    <AuthContext value={contextValue}>{children}</AuthContext>
  );
};
