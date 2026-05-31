import { useState, useMemo, useContext } from "react";
import { NotificationsContext } from "./NotificationsContext";
import { AuthContext } from "./AuthContext";

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

export function NotificationsProvider({ children }) {
  const authCtx  = useContext(AuthContext);
  const userName = authCtx?.user?.name;

  // Tasks are set entirely by the user through NotificationSettings.
  // Start empty — nothing is hardcoded.
  const [tasks, setTasks] = useState([]);

  // Derived notifications — recomputed whenever tasks change
  const notifications = useMemo(() => {
    const today = new Date();
    return tasks.map((task) => {
      const due  = new Date(task.date);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      const urgency = computeUrgency(diff);
      return {
        id:          task.id,
        title:       diff <= 0
                       ? `${task.title} — Overdue`
                       : `${task.title} — ${diff} Day${diff !== 1 ? "s" : ""}`,
        description: task.description,
        urgency,
        cta:         urgency === "urgent" ? "Take Action"
                   : urgency === "warning" ? "Get Ready"
                   : "View Details",
        guideUrl:    deriveGuideUrl(task.title),   // ← step-by-step guide link
        date:        task.date,
      };
    });
  }, [tasks]);

  // Derived calendar events
  const calendarEvents = useMemo(() => {
    const today = new Date();
    return tasks.map((task) => {
      const diff = Math.ceil((new Date(task.date) - today) / (1000 * 60 * 60 * 24));
      return { date: task.date, label: task.title, urgency: computeUrgency(diff) };
    });
  }, [tasks]);

  // Quick links — use router paths so Link component works without page reload
  const quickLinks = [
    { label: "SIN — What you need to know",      url: "/info/sin"              },
    { label: "Work Permit Guide",                 url: "/info/work-permit"      },
    { label: "Health Coverage in Canada",         url: "/info/health"           },
    { label: "Language Tests (IELTS / CELPIP)",   url: "/info/language"         },
    { label: "Post-Graduation Work Permit",       url: "/guides/permit-renewal" },
    { label: "Open a Bank Account",               url: "/guides/bank-account"   },
  ];

  return (
    <NotificationsContext.Provider
      value={{ userName, tasks, setTasks, notifications, calendarEvents, quickLinks }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
