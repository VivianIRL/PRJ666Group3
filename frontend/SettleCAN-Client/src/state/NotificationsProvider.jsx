import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { NotificationsContext } from "./NotificationsContext";
import { AuthContext } from "./AuthContext";
import { fetchNotifications, markNotifRead, markAllNotifsRead, fetchTaskTree, updateTaskNode } from "../service/taskService";
import { DEFAULT_DOCS, loadSavedDates } from "../data/documentAlerts";

// Map a task title to a step-by-step guide URL (keyword matching).
// Falls back to the features hub if no specific guide exists.
function deriveGuideUrl(title = "") {
  const t = title.toLowerCase();
  if (t.includes("sin") || t.includes("social insurance"))          return "/guides/sin";
  if (t.includes("bank") || t.includes("account"))                  return "/guides/bank-account";
  if (t.includes("health") || t.includes("ohip") || t.includes("msp") || t.includes("health card")) return "/guides/health-card";
  if (t.includes("permit") || t.includes("visa") || t.includes("renewal") || t.includes("study permit") || t.includes("work permit")) return "/guides/permit-renewal";
  if (t.includes("tax") || t.includes("t4") || t.includes("cra") || t.includes("income")) return "/guides/tax-return";
  if (t.includes("housing") || t.includes("rent") || t.includes("lease")) return "/housing";
  if (t.includes("pr") || t.includes("permanent"))                  return "/pr-pathway";
  if (t.includes("ielts") || t.includes("celpip") || t.includes("language")) return "/international-students";
  if (t.includes("compliance") || t.includes("condition"))          return "/compliance";
  return "/features";
}

function computeUrgency(daysLeft) {
  if (daysLeft <= 1) return "urgent";
  if (daysLeft <= 7) return "warning";
  return "normal";
}

// How close to its date something has to be before it earns a spot in the
// notification card list (the calendar still shows everything, unfiltered).
const TASK_NOTIFY_WINDOW_DAYS = 5;
const DOCUMENT_NOTIFY_WINDOW_DAYS = 90;

function flattenTaskTree(nodes) {
  const out = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flattenTaskTree(n.children));
  }
  return out;
}

export function NotificationsProvider({ children }) {
  const authCtx  = useContext(AuthContext);
  const userName = authCtx?.user?.name;
  const userId   = authCtx?.user?.id;
  const isAuth   = authCtx?.isAuthenticated;

  // User-defined reminders, set through NotificationSettings — kept
  // separate from the real, persisted tasks below so that page's own
  // add/list behaviour is untouched.
  const [tasks, setTasks] = useState([]);

  // Real tasks from My Tasks' own API (subtasks included) — the same
  // source of truth /tasks reads/writes, so the notification calendar
  // reflects what the user actually sees there.
  const [apiTasks, setApiTasks] = useState([]);

  const loadApiTasks = useCallback(() => {
    if (!isAuth) return;
    fetchTaskTree()
      .then((tree) => {
        if (!Array.isArray(tree)) return;
        const dated = flattenTaskTree(tree)
          .filter((t) => t.dueDate && t.status !== "COMPLETED")
          .map((t) => ({ id: `task-${t.id}`, taskId: t.id, title: t.title, description: t.description ?? "", date: t.dueDate, status: t.status, isTask: true }));
        setApiTasks(dated);
      })
      .catch(() => { /* offline — apiTasks stays as-is */ });
  }, [isAuth]);

  useEffect(() => { loadApiTasks(); }, [loadApiTasks]);

  // Re-sync whenever the tab regains focus (e.g. after setting a date on
  // My Tasks) so the calendar/notification cards stay current.
  useEffect(() => {
    window.addEventListener("focus", loadApiTasks);
    return () => window.removeEventListener("focus", loadApiTasks);
  }, [loadApiTasks]);

  // Document expiry dates — read from the same localStorage DocumentAlerts.jsx
  // writes to, so "when a document expires, the notification calendar shows
  // it" without a second, drifting copy of the document list.
  const [docEvents, setDocEvents] = useState([]);

  const loadDocEvents = useCallback(() => {
    const saved = loadSavedDates(userId);
    const dated = DEFAULT_DOCS
      .map((d) => ({ ...d, expiryDate: saved[d.id] ?? d.expiryDate }))
      .filter((d) => d.expiryDate)
      .map((d) => ({ id: `doc-${d.id}`, title: `${d.name} expires`, description: d.note, date: d.expiryDate, isDocument: true }));
    setDocEvents(dated);
  }, [userId]);

  useEffect(() => { loadDocEvents(); }, [loadDocEvents]);
  useEffect(() => {
    window.addEventListener("focus", loadDocEvents);
    return () => window.removeEventListener("focus", loadDocEvents);
  }, [loadDocEvents]);

  // Combined list feeding notifications + the calendar: manual reminders,
  // real tasks, and document expiries.
  const allEvents = useMemo(() => [...tasks, ...apiTasks, ...docEvents], [tasks, apiTasks, docEvents]);

  // ── Backend notifications ──────────────────────────────────────────────────
  // These come from the DB (admin-created or system reminders).
  const [apiNotifs, setApiNotifs] = useState([]);

  useEffect(() => {
    if (!isAuth) return;
    fetchNotifications()
      .then(data => { if (Array.isArray(data)) setApiNotifs(data); })
      .catch(() => { /* offline — apiNotifs stays empty */ });
  }, [isAuth]);

  async function markRead(id) {
    setApiNotifs(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    await markNotifRead(id).catch(() => {});
  }

  async function markAllRead() {
    setApiNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllNotifsRead().catch(() => {});
  }

  // "Take Action" on an urgent task notification completes the task
  // directly, rather than sending the user off to a guide page — refresh
  // apiTasks afterward so the now-completed task drops off the list.
  async function completeTask(taskId) {
    await updateTaskNode(taskId, { status: "COMPLETED" }).catch(() => {});
    loadApiTasks();
  }

  // Derived notifications — recomputed whenever the combined event list
  // changes. A task/subtask only earns a card once it's within
  // TASK_NOTIFY_WINDOW_DAYS of its due date; a document within
  // DOCUMENT_NOTIFY_WINDOW_DAYS of expiring. The calendar (below) shows
  // everything regardless — this filter is specific to the notification cards.
  const notifications = useMemo(() => {
    const today = new Date();
    return allEvents
      .filter((item) => {
        const diff = Math.ceil((new Date(item.date) - today) / (1000 * 60 * 60 * 24));
        if (item.isTask) return diff <= TASK_NOTIFY_WINDOW_DAYS;
        if (item.isDocument) return diff <= DOCUMENT_NOTIFY_WINDOW_DAYS;
        return true; // manual reminders (NotificationSettings) are always shown, as before
      })
      .map((item) => {
        const due  = new Date(item.date);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        const urgency = computeUrgency(diff);
        return {
          id:          item.id,
          taskId:      item.taskId,
          title:       diff <= 0
                         ? `${item.title} — Overdue`
                         : `${item.title} — ${diff} Day${diff !== 1 ? "s" : ""}`,
          description: item.description,
          urgency,
          cta:         item.isDocument ? "Update Document" : urgency === "urgent" ? "Take Action" : urgency === "warning" ? "Get Ready" : "View Details",
          guideUrl:    item.isDocument ? "/document-alerts" : deriveGuideUrl(item.title),
          date:        item.date,
        };
      });
  }, [allEvents]);

  // Derived calendar events (tasks + document expiries together)
  const calendarEvents = useMemo(() => {
    const today = new Date();
    return allEvents.map((item) => {
      const diff = Math.ceil((new Date(item.date) - today) / (1000 * 60 * 60 * 24));
      return { date: item.date, label: item.title, urgency: computeUrgency(diff), isDocument: !!item.isDocument };
    });
  }, [allEvents]);

  // Quick links — use router paths so Link component works without page reload
  const quickLinks = [
    { label: "SIN — What you need to know",      url: "/info/sin"              },
    { label: "Work Permit Guide",                 url: "/info/work-permit"      },
    { label: "Health Coverage in Canada",         url: "/info/health"           },
    { label: "Language Tests (IELTS / CELPIP)",   url: "/info/language"         },
    { label: "Post-Graduation Work Permit",       url: "/guides/permit-renewal" },
    { label: "Open a Bank Account",               url: "/guides/bank-account"   },
  ];

  // Unread count = user-defined reminder tasks + unread DB notifications
  const unreadApiCount = apiNotifs.filter(n => !n.is_read).length;

  return (
    <NotificationsContext.Provider
      value={{
        userName,
        tasks,
        setTasks,
        notifications,
        calendarEvents,
        quickLinks,
        // Backend notifications
        apiNotifs,
        unreadApiCount,
        markRead,
        markAllRead,
        completeTask,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
