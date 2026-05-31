import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";

export default function Logout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clearing auth state in an effect to prevent race conditions with AuthLayout
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  return null;
}