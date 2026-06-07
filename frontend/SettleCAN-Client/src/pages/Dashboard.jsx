// Dashboard.jsx — personalized home screen
import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/Dashboard.scss";

// ── Read checklist from localStorage (written by Checklist.jsx) ───────────────
function loadChecklist(uid) {
  try { return JSON.parse(localStorage.getItem(`settlecan_checklist_${uid ?? "guest"}`)) ?? null; }
  catch { return null; }
}

// ── Status-specific priority tasks shown when checklist is not yet started ────
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
    { text: "Secure safe, permanent housing",              path: "/housing",             cat: "Housing"     },
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
  { to: "/checklist",       label: "✅ Checklist"     },
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

export default function Dashboard() {
  const { user }   = useContext(AuthContext);
  const notifCtx   = useContext(NotificationsContext);
  const unread     = notifCtx?.notifications?.length ?? 0;
  const uid        = user?.id;
  const status     = user?.immigrationStatus ?? "";

  // ── Checklist progress from localStorage ────────────────────────────────
  const { totalItems, doneItems, checklistNext } = useMemo(() => {
    const cats = loadChecklist(uid);
    if (!cats) return { totalItems: 0, doneItems: 0, checklistNext: [] };
    const all  = cats.flatMap(c => c.items.map(i => ({ ...i, catLabel: c.label })));
    return {
      totalItems:    all.length,
      doneItems:     all.filter(i => i.done).length,
      checklistNext: all.filter(i => !i.done && i.required).slice(0, 4),
    };
  }, [uid]);

  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // ── "Up next" — checklist items if started, otherwise status-specific defaults
  const upNext = checklistNext.length > 0
    ? checklistNext.map(i => ({ text: i.text, path: "/checklist", cat: i.catLabel }))
    : (STATUS_TASKS[status] ?? DEFAULT_TASKS).slice(0, 4);

  const usingDefaults = checklistNext.length === 0 && totalItems === 0;

  // ── Days since arrival ───────────────────────────────────────────────────
  const daysSince = useMemo(() => {
    if (!user?.arrivalDate) return null;
    const d = new Date(user.arrivalDate);
    if (isNaN(d)) return null;
    const diff = Math.floor((Date.now() - d) / 86400000);
    return diff >= 0 ? diff : null;
  }, [user?.arrivalDate]);

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
      <div className="dash-progress-card">
        <div className="dash-progress-card__top">
          <div>
            <p className="dash-progress-card__label">Settlement checklist</p>
            <p className="dash-progress-card__fraction">
              {totalItems === 0
                ? "Not started yet"
                : <><strong>{doneItems}</strong> of {totalItems} items completed</>
              }
            </p>
          </div>
          <span className="dash-progress-card__pct">{totalItems ? `${pct}%` : "0%"}</span>
        </div>
        <div className="dash-prog-track">
          <div className="dash-prog-fill" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && <p className="dash-progress-card__done">🎉 Checklist complete!</p>}
        <Link to="/checklist" className="dash-progress-card__link">
          {totalItems === 0 ? "Start your checklist →" : "View full checklist →"}
        </Link>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat__num">{doneItems || 0}</span>
          <span className="dash-stat__label">Items done</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{totalItems > 0 ? totalItems - doneItems : 0}</span>
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
      <div className="dash-section">
        <div className="dash-section__head">
          <h2 className="dash-section__title">
            {usingDefaults ? `Recommended for ${status || "newcomers"}` : "Up next"}
          </h2>
          <Link to={usingDefaults ? "/checklist" : "/checklist"} className="dash-section__see-all">
            {usingDefaults ? "Start checklist →" : "Full checklist →"}
          </Link>
        </div>
        {pct === 100 && totalItems > 0 ? (
          <div className="dash-empty"><p>🎉 No required items remaining — great work!</p></div>
        ) : (
          <div className="dash-next-list">
            {upNext.map((item, i) => (
              <Link key={i} to={item.path} className="dash-next-item">
                <span className="dash-next-item__num">{i + 1}</span>
                <span className="dash-next-item__text">{item.text}</span>
                <span className="dash-next-item__cat">{item.cat}</span>
                <span className="dash-next-item__arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

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
