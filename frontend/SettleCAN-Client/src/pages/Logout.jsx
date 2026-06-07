import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";

export default function Logout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // logout() is async (calls backend) — navigate after it settles
    logout().finally(() => navigate("/", { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}