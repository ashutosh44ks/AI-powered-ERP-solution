import { useState, useEffect, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage for existing user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        console.log("Restored user from localStorage:", userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);
  const storeUserInfo = (userData: User) => {
    console.log("Storing user info:", userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  };
  const removeUserInfo = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const contextValue = { user, storeUserInfo, removeUserInfo };

  return (
    // This is the new, simplified provider syntax in React 19
    <AuthContext value={contextValue}>{children}</AuthContext>
  );
};
