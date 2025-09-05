import { createContext } from "react";

export interface User {
  user_id: number;
  name: string;
  email: string;
  created_at: Date;
}

export type AuthContextType = {
  user: User | null;
  storeUserInfo: (userData: User) => void;
  removeUserInfo: () => void;
};
const defaultAuthContext: AuthContextType = {
  user: null,
  storeUserInfo: () => {},
  removeUserInfo: () => {},
};

// Create the context with an initial value of undefined.
// The custom hook will handle the null check.
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
