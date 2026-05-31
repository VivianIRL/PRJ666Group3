// AuthLayout.jsx — wraps every authenticated page with the persistent AppSidebar
import { useState, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import AppSidebar from "../components/AppSidebar";
import "../scss/AuthLayout.scss";

export default function AuthLayout() {
  const { isAuthenticated } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  // Unauthenticated → go to landing page (handles both manual URL access and sign-out)
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className={`auth-layout ${collapsed ? "auth-layout--collapsed" : ""}`}>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="auth-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
