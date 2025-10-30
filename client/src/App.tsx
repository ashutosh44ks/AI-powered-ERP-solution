import { createBrowserRouter, RouterProvider } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import "@crayonai/react-ui/styles/index.css";
import { AuthProvider } from "./hooks/AuthProvider";
import { Toaster } from 'sonner';
import DataModel from "./pages/DataModel";
import TabularInteraction from "./pages/TabularInteraction";
import { DataModelProvider } from "./hooks/DataModelProvider";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/data-models",
        element: <DataModel />,
      },
      {
        path: "/data-models/:tableName",
        element: <TabularInteraction />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools /> */}
        <AuthProvider>
          <DataModelProvider>
            <RouterProvider router={router} />
          </DataModelProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
