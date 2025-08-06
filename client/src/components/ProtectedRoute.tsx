import { useLoggedInUser } from "@/hooks/useLoggedInUser";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { user } = useLoggedInUser();
  if (!user) {
    console.warn("No user found, redirecting to login");
    // If no user is logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  // If user is logged in, render the child components
  return <Outlet />;
};

export default ProtectedRoute;
