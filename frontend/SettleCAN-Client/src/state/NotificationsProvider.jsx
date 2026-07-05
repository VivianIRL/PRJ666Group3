import { useState, useEffect, useMemo, useContext } from "react";
import { NotificationsContext } from "./NotificationsContext";
import { AuthContext } from "./AuthContext";
import {
  fetchNotifications,
  markNotifRead,
  markAllNotifsRead,
} from "../service/taskService";

// Map a task title to a step-by-step guide URL (keyword matching).
// Falls back to the features hub if no specific guide exists.
function deriveGuideUrl(title = "") {
  const t = title.toLowerCase();
  if (t.includes("sin") || t.includes("social insurance")) return "/guides/sin";
  if (t.includes("bank") || t.includes("account"))
    return "/guides/bank-account";
  if (
    t.includes("health") ||
    t.includes("ohip") ||
    t.includes("msp") ||
    t.includes("health card")
  )
    return "/guides/health-card";
  if (
    t.includes("permit") ||
    t.includes("visa") ||
    t.includes("renewal") ||
    t.includes("study permit") ||
    t.includes("work permit")
  )
    return "/guides/permit-renewal";
  if (
    t.includes("tax") ||
    t.includes("t4") ||
    t.includes("cra") ||
    t.includes("income")
  )
    return "/guides/tax-return";
  if (t.includes("housing") || t.includes("rent") || t.includes("lease"))
    return "/housing";
  if (
    t.includes("pr") ||
    t.includes("permanent") ||
    t.includes("pgwp") ||
    t.includes("post-graduation")
  )
    return "/pr-pathway";
  if (
    t.includes("ielts") ||
    t.includes("celpip") ||
    t.includes("language") ||
    t.includes("english") ||
    t.includes("french")
  )
    return "/info/language";
  if (t.includes("compliance") || t.includes("condition")) return "/compliance";
  if (
    t.includes("document") ||
    t.includes("passport") ||
    t.includes("id") ||
    t.includes("certificate")
  )
    return "/document-alerts";
  if (t.includes("sin") || t.includes("social")) return "/guides/sin";
  return "/features";
}

function computeUrgency(daysLeft) {
  if (daysLeft <= 1) return "urgent";
  if (daysLeft <= 7) return "warning";
  return "normal";
}

export function NotificationsProvider({ children }) {
  const authCtx = useContext(AuthContext);
  const userName = authCtx?.user?.name;
  const isAuth = authCtx?.isAuthenticated;

  // Tasks are set by the user through NotificationSettings.
  const [tasks, setTasks] = useState([]);

  // ── Backend notifications ──────────────────────────────────────────────────
  // These come from the DB (admin-created or system reminders).
  const [apiNotifs, setApiNotifs] = useState([]);

  useEffect(() => {
    if (!isAuth) return;
    fetchNotifications()
      .then((data) => {
        if (Array.isArray(data)) setApiNotifs(data);
      })
      .catch(() => {
        /* offline — apiNotifs stays empty */
      });
  }, [isAuth]);

  async function markRead(id) {
    setApiNotifs((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)),
    );
    await markNotifRead(id).catch(() => {});
  }

  async function markAllRead() {
    setApiNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotifsRead().catch(() => {});
  }

  // Derived notifications — recomputed whenever tasks change
  const notifications = useMemo(() => {
    const today = new Date();
    return tasks.map((task) => {
      const due = new Date(task.date);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      const urgency = computeUrgency(diff);
      return {
        id: task.id,
        title:
          diff <= 0
            ? `${task.title} — Overdue`
            : `${task.title} — ${diff} Day${diff !== 1 ? "s" : ""}`,
        description: task.description,
        urgency,
        cta:
          urgency === "urgent"
            ? "Take Action"
            : urgency === "warning"
              ? "Get Ready"
              : "View Details",
        guideUrl: deriveGuideUrl(task.title), // ← step-by-step guide link
        date: task.date,
      };
    });
  }, [tasks]);

  // Derived calendar events
  const calendarEvents = useMemo(() => {
    const today = new Date();
    return tasks.map((task) => {
      const diff = Math.ceil(
        (new Date(task.date) - today) / (1000 * 60 * 60 * 24),
      );
      return {
        date: task.date,
        label: task.title,
        urgency: computeUrgency(diff),
      };
    });
  }, [tasks]);

  // Quick links — use router paths so Link component works without page reload
  const quickLinks = [
    { label: "SIN — What you need to know", url: "/info/sin" },
    { label: "Work Permit Guide", url: "/info/work-permit" },
    { label: "Health Coverage in Canada", url: "/info/health" },
    { label: "Language Tests (IELTS / CELPIP)", url: "/info/language" },
    { label: "Post-Graduation Work Permit", url: "/guides/permit-renewal" },
    { label: "Open a Bank Account", url: "/guides/bank-account" },
  ];

  // Unread count = user-defined reminder tasks + unread DB notifications
  const unreadApiCount = apiNotifs.filter((n) => !n.is_read).length;

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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
