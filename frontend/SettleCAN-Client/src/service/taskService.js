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

// ── Task Hierarchy v2 (subtasks, dates -> automatic reminders) ─────────────────
// See docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md. Setting a task/subtask's due
// date is the entire "create a notification" action — the backend's daily
// sweep reads due_date directly, there's no separate step.
export const fetchTaskTree        = ()           => req("GET",    "/v2/tasks");
export const createTaskNode       = (body)       => req("POST",   "/v2/tasks",                     body);
export const updateTaskNode       = (id, body)   => req("PATCH",  `/v2/tasks/${id}`,               body);
export const deleteTaskNode       = (id)         => req("DELETE", `/v2/tasks/${id}`);
export const createSubtask        = (taskId, b)  => req("POST",   `/v2/tasks/${taskId}/children`,  b);
export const generateOnboardingTasks = (userId)  => req("POST",   `/v2/users/${userId}/generate-tasks`);
export const fetchTaskNotifications  = ()        => req("GET",    "/v2/notifications");
export const markTaskNotifRead    = (id)         => req("PATCH",  `/v2/notifications/${id}/read`);

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications   = ()           => req("GET",    "/notifications");
export const markNotifRead        = (id)         => req("PATCH",  `/notifications/${id}/read`);
export const markAllNotifsRead    = ()           => req("PATCH",  "/notifications/read-all");
export const createNotification   = (body)       => req("POST",   "/notifications",              body);
export const sendNotifEmail       = (body)       => req("POST",   "/notifications/send-email",   body);

// ── Community ─────────────────────────────────────────────────────────────────
export const fetchCommunityPosts  = ()           => req("GET",    "/community/posts");
export const createCommunityPost  = (body)       => req("POST",   "/community/posts",              body);
export const deleteCommunityPost  = (id)         => req("DELETE", `/community/posts/${id}`);
export const createCommunityReply = (postId, b)  => req("POST",   `/community/posts/${postId}/replies`, b);
export const deleteCommunityReply = (replyId)    => req("DELETE", `/community/replies/${replyId}`);
export const fetchFAQ             = ()           => req("GET",    "/community/faq");

// ── Content (CMS) ─────────────────────────────────────────────────────────────
export const fetchContent         = ()           => req("GET",    "/content");
export const fetchContentById     = (id)         => req("GET",    `/content/${id}`);
export const createContent        = (body)       => req("POST",   "/content",                      body);
export const updateContent        = (id, body)   => req("PATCH",  `/content/${id}`,                body);
export const deleteContent        = (id)         => req("DELETE", `/content/${id}`);

// ── Policy updates (live IRCC newsroom feed) ────────────────────────────────────
export const fetchPolicyUpdates   = ()           => req("GET",    "/policy-updates");

// ── Profile ───────────────────────────────────────────────────────────────────
export const fetchProfile         = ()           => req("GET",    "/profile");
export const updateProfile        = (body)       => req("PATCH",  "/profile",                      body);
