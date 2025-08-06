import { useLoggedInUser } from "@/hooks/useLoggedInUser";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { user } = useLoggedInUser();
  const localStorageUser = localStorage.getItem("currentUser");
  const parsedUser = localStorageUser ? JSON.parse(localStorageUser) : null;
  if (!user && !parsedUser) {
    console.warn("No user found, redirecting to login");
    // If no user is logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  // If user is logged in, render the child components
  return <Outlet />;
};

export default ProtectedRoute;
