import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken } from "./tokenService";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

function headers() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Silently refresh the Supabase access token using the stored refresh token.
let _refreshing = null;
async function doRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token stored");
  // Deduplicate concurrent refresh attempts
  if (!_refreshing) {
    _refreshing = fetch(`${BASE}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.token) throw new Error("Refresh returned no token");
        setAccessToken(data.token);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
      })
      .finally(() => { _refreshing = null; });
  }
  return _refreshing;
}

async function req(method, path, body) {
  const buildOpts = () => ({
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let res;
  try {
    res = await fetch(`${BASE}${path}`, buildOpts());
  } catch {
    throw new Error(`Backend unavailable (${method} ${path})`);
  }

  // On 401 try a single silent token refresh then retry once
  if (res.status === 401) {
    try {
      await doRefresh();
      res = await fetch(`${BASE}${path}`, buildOpts());
    } catch { /* refresh failed — let 401 fall through */ }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `${method} ${path} failed`);
  return data;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const fetchTasks           = ()           => req("GET",    "/tasks");
export const createTask           = (body)       => req("POST",   "/tasks",                        body);
export const updateTask           = (id, body)   => req("PATCH",  `/tasks/${id}`,                  body);
export const deleteTask           = (id)         => req("DELETE", `/tasks/${id}`);
export const fetchTaskTemplates   = ()           => req("GET",    "/tasks/templates");
export const assignTemplate       = (tmplId, b)  => req("POST",   `/tasks/templates/${tmplId}/assign`, b);

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications   = ()           => req("GET",    "/notifications");
export const markNotifRead        = (id)         => req("PATCH",  `/notifications/${id}/read`);
export const markAllNotifsRead    = ()           => req("PATCH",  "/notifications/read-all");
export const createNotification   = (body)       => req("POST",   "/notifications",              body);
export const sendNotifEmail       = (body)       => req("POST",   "/notifications/send-email",   body);

// ── Community ─────────────────────────────────────────────────────────────────
export const fetchCommunityPosts  = ()           => req("GET",    "/community/posts");
export const createCommunityPost  = (body)       => req("POST",   "/community/posts",              body);
export const fetchFAQ             = ()           => req("GET",    "/community/faq");

// ── Content (CMS) ─────────────────────────────────────────────────────────────
export const fetchContent         = ()           => req("GET",    "/content");
export const fetchContentById     = (id)         => req("GET",    `/content/${id}`);
export const createContent        = (body)       => req("POST",   "/content",                      body);
export const updateContent        = (id, body)   => req("PATCH",  `/content/${id}`,                body);
export const deleteContent        = (id)         => req("DELETE", `/content/${id}`);

// ── Profile ───────────────────────────────────────────────────────────────────
export const fetchProfile         = ()           => req("GET",    "/profile");
export const updateProfile        = (body)       => req("PATCH",  "/profile",                      body);
