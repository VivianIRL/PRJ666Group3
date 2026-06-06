import { getAccessToken } from "./tokenService";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

function headers() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req(method, path, body) {
  // fetch itself can throw a TypeError when the server is not reachable.
  // Wrapping it here means every caller gets a consistent Error instead of
  // an unhandled rejection, and all the page-level .catch(() => {}) blocks work.
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Backend unavailable (${method} ${path})`);
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
