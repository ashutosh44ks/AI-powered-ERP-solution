import { Outlet } from "react-router";

const ProtectedRoute = () => {
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  if (!currentUserEmail) {
    // If no user is logged in, redirect to login page
    window.location.href = "/";
    return null;
  }
  // If user is logged in, render the child components
  return <Outlet />;
};

export default ProtectedRoute;
