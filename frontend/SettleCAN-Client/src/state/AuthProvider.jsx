import { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";

// ── localStorage keys ─────────────────────────────────────────────────────────
const KEY_CURRENT = "settlecan_user";      // currently logged-in user
const KEY_PROFILES = "settlecan_profiles"; // registered profiles, keyed by email

function loadCurrentUser() {
  try { return JSON.parse(localStorage.getItem(KEY_CURRENT)) ?? null; }
  catch { return null; }
}

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(KEY_PROFILES)) ?? {}; }
  catch { return {}; }
}

function saveCurrentUser(user) {
  if (user) localStorage.setItem(KEY_CURRENT, JSON.stringify(user));
  else      localStorage.removeItem(KEY_CURRENT);
}

function saveProfile(email, profile) {
  const profiles = loadProfiles();
  profiles[email.toLowerCase()] = profile;
  localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
}

export function AuthProvider({ children }) {
  // Restore session from localStorage so a page refresh doesn't log the user out
  const [user, setUser] = useState(loadCurrentUser);

  function applyUser(userData) {
    setUser(userData);
    saveCurrentUser(userData);
  }

  /**
   * Called from Login.jsx.
   * Priority for the display name:
   *   1. Stored profile from a previous registration (best — real first name)
   *   2. `firstName` typed into the login form (good — user supplied it)
   *   3. Nothing — shows generic fallback "there"
   * TODO: replace with POST /api/auth/login when the backend is ready.
   */
  const login = useCallback((email, _password) => {
    const profiles = loadProfiles();
    const stored   = profiles[email.toLowerCase()];

    if (stored) {
      // Registered user — use the first name they entered during sign-up
      applyUser(stored);
    } else {
      // No registration found for this email yet. 
      // In a real app, this would be an error. For the prototype, we log them in with a blank name.
      applyUser({
        name:              "",
        fullName:          "",
        email,
        immigrationStatus: "International Student",
        province:          "",
        arrivalDate:       "",
        avatar:            null,
      });
    }
    return true;
  }, []);

  /**
   * Called from ImmigrationDetails.jsx (step 2 of sign-up) with the full profile.
   * Persists the profile so subsequent logins can retrieve the real first name.
   */
  const register = useCallback((profile) => {
    const userData = {
      name:              profile.firstName,                              // ← real first name from form
      fullName:          `${profile.firstName} ${profile.lastName}`.trim(),
      email:             profile.email,
      immigrationStatus: profile.immigrationStatus ?? "International Student",
      province:          profile.province  ?? "",
      arrivalDate:       profile.arrivalDate ?? "",
      avatar:            null,
    };

    // Persist so login() can find this profile by email later
    saveProfile(profile.email, userData);
    applyUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
