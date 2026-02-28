import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

// ── Claves de localStorage compartidas ────────────────────────────────────────

export const AUTH_KEY = "isAuthenticated";
export const USERNAME_KEY = "username";

// ── Hook: guard de autenticación ──────────────────────────────────────────────

/**
 * Verifica que el usuario esté autenticado. Si no lo está, redirige a `/`.
 * Devuelve el nombre de usuario almacenado.
 */
export function useAuth(): string {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!localStorage.getItem(AUTH_KEY)) {
      navigate("/");
      return;
    }
    setUsername(localStorage.getItem(USERNAME_KEY) ?? "");
  }, [navigate]);

  return username;
}
