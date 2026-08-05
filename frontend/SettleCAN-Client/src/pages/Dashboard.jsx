// Dashboard.jsx — personalized home screen
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import { fetchTaskTree } from "../service/taskService";
import "../scss/Dashboard.scss";

// Flattens the My Tasks hierarchy (root tasks + every subtask) into one list.
function flatten(nodes) {
  const out = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

// ── Status-specific priority tasks shown before the user has any real tasks ───
const STATUS_TASKS = {
  "International Student": [
    { text: "Get your Social Insurance Number (SIN)",      path: "/guides/sin",          cat: "Employment"  },
    { text: "Register for provincial health coverage",     path: "/guides/health-card",  cat: "Health"      },
    { text: "Open a Canadian bank account",                path: "/guides/bank-account", cat: "Banking"     },
    { text: "Check your study permit expiry date",         path: "/document-alerts",     cat: "Immigration" },
    { text: "Find a family doctor or walk-in clinic",      path: "/info/health",         cat: "Health"      },
  ],
  "Work Permit Holder": [
    { text: "Verify your work permit conditions",          path: "/work-eligibility",    cat: "Immigration" },
    { text: "Apply for or update your SIN",                path: "/guides/sin",          cat: "Employment"  },
    { text: "Register for provincial health coverage",     path: "/guides/health-card",  cat: "Health"      },
    { text: "Check permit expiry & renewal timeline",      path: "/guides/permit-renewal", cat: "Immigration" },
    { text: "Explore PR pathways (Express Entry, PNP)",    path: "/pr-pathway",          cat: "PR"          },
  ],
  "Permanent Resident": [
    { text: "Apply for your PR card",                      path: "/compliance",          cat: "Immigration" },
    { text: "Register for provincial health coverage",     path: "/guides/health-card",  cat: "Health"      },
    { text: "Update your SIN to permanent status",         path: "/guides/sin",          cat: "Employment"  },
    { text: "File taxes as a Canadian resident",           path: "/guides/tax-return",   cat: "Finance"     },
    { text: "Research citizenship eligibility timeline",   path: "/pr-pathway",          cat: "PR"          },
  ],
  "Refugee / Protected Person": [
    { text: "Register for provincial health coverage",     path: "/guides/health-card",  cat: "Health"      },
    { text: "Get your Social Insurance Number (SIN)",      path: "/guides/sin",          cat: "Employment"  },
    { text: "Find settlement support services",            path: "/features",            cat: "Resources"   },
    { text: "Secure safe, permanent housing",               path: "/housing",             cat: "Housing"     },
    { text: "Understand your path to PR / citizenship",    path: "/pr-pathway",          cat: "PR"          },
  ],
};
const DEFAULT_TASKS = [
  { text: "Get your Social Insurance Number (SIN)",        path: "/guides/sin",          cat: "Employment"  },
  { text: "Register for provincial health coverage",       path: "/guides/health-card",  cat: "Health"      },
  { text: "Open a Canadian bank account",                  path: "/guides/bank-account", cat: "Banking"     },
  { text: "Set up document expiry reminders",              path: "/document-alerts",     cat: "Documents"   },
  { text: "Explore resources for your situation",          path: "/features",            cat: "Resources"   },
];

// ── Quick links ────────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { to: "/tasks",           label: "📌 My Tasks"      },
  { to: "/document-alerts", label: "⏰ Doc Alerts"    },
  { to: "/community",       label: "💬 Community"     },
  { to: "/features",        label: "🌐 Resources"     },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr + "T00:00:00") - new Date()) / 86400000);
}

export default function Dashboard() {
  const { user }   = useContext(AuthContext);
  const notifCtx   = useContext(NotificationsContext);
  const unread     = notifCtx?.notifications?.length ?? 0;
  const status     = user?.immigrationStatus ?? "";

  // ── Real tasks, from My Tasks' own API — this page never reads
  // localStorage; the settlement checklist page is gone, and Dashboard/My
  // Tasks now share one source of truth. ─────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTaskTree()
      .then((tree) => { if (!cancelled && Array.isArray(tree)) setTasks(flatten(tree)); })
      .catch(() => { /* Dashboard degrades gracefully — My Tasks itself surfaces load errors */ })
      .finally(() => { if (!cancelled) setTasksLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ── Compliance widget — the individual rules (not the group headers)
  // from the same task tree, filtered to task_category === "COMPLIANCE".
  // See ComplianceTracking.jsx, which shows the identical data full-page. ──
  const complianceRules = tasks.filter((t) => t.category === "COMPLIANCE" && t.parentId != null);
  const complianceDone = complianceRules.filter((t) => t.status === "COMPLETED").length;
  const compliancePct = complianceRules.length > 0 ? Math.round((complianceDone / complianceRules.length) * 100) : 0;
  const compliancePending = complianceRules
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "HIGH" ? -1 : 1));

  // ── Top 5 upcoming tasks by urgency (soonest due date first) ────────────
  const upcoming = tasks
    .filter((t) => t.dueDate && t.status !== "COMPLETED")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const usingDefaults = tasksLoaded && totalTasks === 0;
  const upNext = upcoming.length > 0
    ? upcoming.map((t) => ({
        text: t.title,
        path: `/tasks?highlight=${t.id}`,
        cat: t.parentId ? "Subtask" : "Task",
        days: daysUntil(t.dueDate),
      }))
    : (STATUS_TASKS[status] ?? DEFAULT_TASKS).slice(0, 5);

  // ── Days since arrival ───────────────────────────────────────────────────
  const daysSince = (() => {
    if (!user?.arrivalDate) return null;
    const d = new Date(user.arrivalDate);
    if (isNaN(d)) return null;
    const diff = Math.floor((Date.now() - d) / 86400000);
    return diff >= 0 ? diff : null;
  })();

  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="dashboard">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <p className="dash-date">{today}</p>
          <h1 className="dash-heading">{greeting()}{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="dash-sub">
            {status && <span className="dash-status-badge">{status}</span>}
            {user?.province && <span> · {user.province}</span>}
          </p>
        </div>
        {unread > 0 && (
          <Link to="/notifications-dashboard" className="dash-notif-chip">
            🔔 {unread} reminder{unread !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* ── Progress card ─────────────────────────────────────────────────── */}
      {/* The whole card is the entry point to My Tasks — no separate
          "View My Tasks →" link needed inside it. */}
      <Link to="/tasks" className="dash-progress-card">
        {!tasksLoaded ? (
          <>
            <div className="dash-skeleton-line" style={{ width: "40%" }} />
            <div className="dash-skeleton-line" style={{ width: "60%", height: "0.6rem" }} />
          </>
        ) : (
          <>
            <div className="dash-progress-card__top">
              <div>
                <p className="dash-progress-card__label">My Tasks</p>
                <p className="dash-progress-card__fraction">
                  {totalTasks === 0
                    ? "Not started yet"
                    : <><strong>{doneTasks}</strong> of {totalTasks} completed</>
                  }
                </p>
              </div>
              <span className="dash-progress-card__pct">{totalTasks ? `${pct}%` : "0%"}</span>
            </div>
            <div className="dash-prog-track">
              <div className="dash-prog-fill" style={{ width: `${pct}%` }} />
            </div>
            {pct === 100 && totalTasks > 0 && <p className="dash-progress-card__done">🎉 All tasks complete!</p>}
          </>
        )}
      </Link>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat__num">{tasksLoaded ? (doneTasks || 0) : "—"}</span>
          <span className="dash-stat__label">Tasks done</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{tasksLoaded ? (totalTasks > 0 ? totalTasks - doneTasks : 0) : "—"}</span>
          <span className="dash-stat__label">Remaining</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{daysSince !== null ? daysSince : "—"}</span>
          <span className="dash-stat__label">Days in Canada</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{unread || 0}</span>
          <span className="dash-stat__label">Reminders</span>
        </div>
      </div>

      {/* ── Up next ───────────────────────────────────────────────────────── */}
      {/* Each item below already links out — no separate "My Tasks →"
          header link needed. */}
      <div className="dash-section">
        <div className="dash-section__head">
          <h2 className="dash-section__title">
            {!tasksLoaded ? "Up next" : upcoming.length > 0 ? "Coming up" : usingDefaults ? `Recommended for ${status || "newcomers"}` : "Up next"}
          </h2>
        </div>
        {!tasksLoaded ? (
          <div className="dash-next-list">
            {[0, 1, 2].map((i) => <div key={i} className="dash-next-item dash-next-item--skeleton" />)}
          </div>
        ) : pct === 100 && totalTasks > 0 ? (
          <div className="dash-empty"><p>🎉 No upcoming deadlines — great work!</p></div>
        ) : (
          <div className="dash-next-list">
            {upNext.map((item, i) => (
              <Link key={i} to={item.path} className="dash-next-item">
                <span className="dash-next-item__num">{i + 1}</span>
                <span className="dash-next-item__text">{item.text}</span>
                <span className="dash-next-item__cat">
                  {item.days !== undefined
                    ? item.days < 0 ? "Overdue" : item.days === 0 ? "Due today" : `${item.days}d`
                    : item.cat}
                </span>
                <span className="dash-next-item__arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Compliance ────────────────────────────────────────────────────── */}
      {/* Each row below already links to /compliance — no separate
          "View all →" header link needed. */}
      {complianceRules.length > 0 && (
        <div className="dash-section">
          <div className="dash-section__head">
            <h2 className="dash-section__title">Compliance</h2>
          </div>
          <div className="dash-compliance-card">
            <div className="dash-compliance-card__top">
              <p className="dash-compliance-card__fraction">
                <strong>{complianceDone}</strong> of {complianceRules.length} reviewed
              </p>
              <span className="dash-compliance-card__pct">{compliancePct}%</span>
            </div>
            <div className="dash-prog-track">
              <div className="dash-prog-fill" style={{ width: `${compliancePct}%` }} />
            </div>
            {compliancePending.length === 0 ? (
              <p className="dash-compliance-card__done">🎉 All compliance items reviewed!</p>
            ) : (
              <div className="dash-compliance-card__scroll">
                {compliancePending.map((r) => (
                  <Link key={r.id} to="/compliance" className="dash-compliance-card__row">
                    <span className={`dash-compliance-card__dot ${r.priority === "HIGH" ? "dash-compliance-card__dot--high" : ""}`} />
                    <span className="dash-compliance-card__row-text">{r.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section__title">Quick links</h2>
        <div className="dash-quick">
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} className="dash-qa">{l.label}</Link>
          ))}
        </div>
      </div>

    </div>
  );
}
