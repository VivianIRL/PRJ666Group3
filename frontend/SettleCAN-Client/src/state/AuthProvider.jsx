import { useState, useCallback } from "react";
import { AuthContext }   from "./AuthContext";
import { loginUser, registerUser, logoutUser } from "../service/authService";
import { setAccessToken, getAccessToken, removeAccessToken } from "../service/tokenService";

// ── Persist session across page refreshes ─────────────────────────────────────
const KEY_USER = "settlecan_user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(KEY_USER)) ?? null; }
  catch { return null; }
}
function saveUser(u) {
  if (u) localStorage.setItem(KEY_USER, JSON.stringify(u));
  else   localStorage.removeItem(KEY_USER);
}

// Normalise the backend response shape into the UI shape the app uses
function toUiUser(apiUser) {
  return {
    id:                apiUser.id               ?? "",
    email:             apiUser.email            ?? "",
    name:              apiUser.firstName        ?? "",
    fullName:          `${apiUser.firstName ?? ""} ${apiUser.lastName ?? ""}`.trim(),
    immigrationStatus: apiUser.immigrationStatus ?? "International Student",
    province:          apiUser.province         ?? "",
    arrivalDate:       apiUser.arrivalDate      ?? "",
    country:           apiUser.country          ?? "",
    avatar:            null,
  };
}

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(loadUser);
  const [loading,   setLoading]   = useState(false);
  const [authError, setAuthError] = useState(null);

  function applyUser(uiUser) {
    setUser(uiUser);
    saveUser(uiUser);
  }

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user: apiUser, token } = await loginUser(email, password);
      if (token) setAccessToken(token);
      applyUser(toUiUser(apiUser));
      return true;
    } catch (err) {
      const isNetworkError = err.message === "Backend unavailable";

      // True network error (backend not running) → try local session fallback
      if (isNetworkError) {
        const saved = loadUser();
        if (saved && saved.email?.toLowerCase() === email.toLowerCase()) {
          applyUser(saved);
          return true;
        }
        setAuthError("Could not reach the server. Please make sure the backend is running.");
        return false;
      }

      // Backend IS reachable but returned an error (wrong password, email not confirmed, etc.)
      // Show the real Supabase message so the user knows what to fix.
      setAuthError(err.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── register ──────────────────────────────────────────────────────────────
  // Called from ImmigrationDetails.jsx with the merged step-1 + step-2 profile.
  const register = useCallback(async (profile) => {
    setLoading(true);
    setAuthError(null);

    // Build the local user shape we always need (used as fallback too)
    const localUser = toUiUser({
      email:             profile.email,
      firstName:         profile.firstName,
      lastName:          profile.lastName,
      immigrationStatus: profile.immigrationStatus,
      province:          profile.province,
      country:           profile.country,
      arrivalDate:       profile.arrivalDate  ?? "",
      permitExpiry:      profile.permitExpiry ?? "",
    });

    try {
      const { user: apiUser, token } = await registerUser({
        email:             profile.email,
        password:          profile.password,
        firstName:         profile.firstName,
        lastName:          profile.lastName,
        dob:               profile.dob,
        immigrationStatus: profile.immigrationStatus,
        province:          profile.province,
        country:           profile.country,
        arrivalDate:       profile.arrivalDate,
        permitExpiry:      profile.permitExpiry,
        languageTest:      profile.languageTest,
      });

      if (token) setAccessToken(token);
      // Use API user if available; otherwise use the local shape
      applyUser(apiUser ? toUiUser(apiUser) : localUser);
      return true;
    } catch {
      // Backend unreachable (no .env / Supabase not set up yet) —
      // save locally so the rest of the app works in the meantime.
      applyUser(localUser);
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = getAccessToken();
    await logoutUser(token).catch(() => {});
    removeAccessToken();
    setUser(null);
    saveUser(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      authError,
      clearAuthError,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
