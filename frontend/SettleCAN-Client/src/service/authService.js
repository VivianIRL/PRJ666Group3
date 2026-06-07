// In dev the Vite proxy rewrites /api → http://localhost:5000/api (no CORS issues).
// In production set VITE_API_URL to your deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// ── helpers ───────────────────────────────────────────────────────────────────
function authHeader(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── safe JSON parse (handles empty / non-JSON bodies) ─────────────────────────
async function safeJson(res) {
    const text = await res.text();
    if (!text) return {};
    try { return JSON.parse(text); }
    catch { return { message: text }; }
}

// ── safe fetch (handles connection-refused / network errors) ─────────────────
async function apiFetch(url, options) {
    try {
        return await fetch(url, options);
    } catch {
        throw new Error("Backend unavailable");
    }
}

// ── auth ──────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
    const res  = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data; // { user, token }
}

export async function registerUser(userData) {
    const res  = await apiFetch(`${API_BASE_URL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(userData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data; // { user, token }
}

export async function logoutUser(token) {
    const res  = await apiFetch(`${API_BASE_URL}/auth/logout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeader(token) },
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || "Logout failed");
    return data;
}

// ── profile ───────────────────────────────────────────────────────────────────
export async function getProfile(token) {
    const res  = await fetch(`${API_BASE_URL}/profile`, {
        headers: authHeader(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not fetch profile");
    return data;
}

export async function updateProfile(token, updates) {
    const res  = await fetch(`${API_BASE_URL}/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader(token) },
        body:    JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not update profile");
    return data;
}

// ── notifications ─────────────────────────────────────────────────────────────
export async function getNotifications(token) {
    const res  = await fetch(`${API_BASE_URL}/notifications`, {
        headers: authHeader(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not fetch notifications");
    return data;
}

// ── community ─────────────────────────────────────────────────────────────────
export async function getCommunityPosts(token) {
    const res  = await fetch(`${API_BASE_URL}/community/posts`, {
        headers: authHeader(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not fetch posts");
    return data;
}

export async function createCommunityPost(token, { question, tags }) {
    const res  = await fetch(`${API_BASE_URL}/community/posts`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeader(token) },
        body:    JSON.stringify({ question, tags }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not create post");
    return data;
}

