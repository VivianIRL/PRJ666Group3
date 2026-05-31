// Dashboard.jsx — main authenticated landing page
// Matches the "Welcome back" prototype design
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/Dashboard.scss";

// ── Task category data (mirrors mock tasks) ───────────────────────────────────
const TASK_CATEGORIES = [
  {
    icon: "📋",
    label: "Documentation & Forms",
    path: "/tasks",
    total: 5,
    done: 2,
    color: "#fdeaed",
    accent: "#8E0002",
    items: ["Study permit renewal", "SIN application", "Health card registration"],
  },
  {
    icon: "🏦",
    label: "Banking & Finance",
    path: "/tasks",
    total: 3,
    done: 1,
    color: "#e8f0fe",
    accent: "#2563eb",
    items: ["Open bank account", "Set up direct deposit", "Tax filing (T4)"],
  },
  {
    icon: "🏥",
    label: "Healthcare",
    path: "/tasks",
    total: 2,
    done: 0,
    color: "#e6f9ef",
    accent: "#15803d",
    items: ["Register for provincial health card", "Find a family doctor"],
  },
  {
    icon: "🏠",
    label: "Housing",
    path: "/housing",
    total: 4,
    done: 1,
    color: "#fff3e0",
    accent: "#c2410c",
    items: ["Secure permanent housing", "Set up utilities", "Tenant insurance"],
  },
  {
    icon: "💼",
    label: "Employment",
    path: "/work-eligibility",
    total: 3,
    done: 1,
    color: "#f3e8ff",
    accent: "#7c3aed",
    items: ["SIN application", "Verify work authorization", "Update resume (Canadian format)"],
  },
  {
    icon: "🍁",
    label: "Immigration & PR",
    path: "/pr-pathway",
    total: 4,
    done: 0,
    color: "#fdf4ff",
    accent: "#9d174d",
    items: ["Research PR pathways", "Improve CRS score", "PGWP application"],
  },
];

const NEWS = [
  {
    date: "May 2025",
    tag: "Policy Update",
    tagColor: "#fdeaed",
    tagText: "#8E0002",
    title: "IRCC Increases Off-Campus Work Limit to 24 hrs/week",
    body: "International students can now work up to 24 hours per week off-campus during academic sessions, increased from 20 hours.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/10/canada-announces-changes-to-off-campus-work-hours-for-international-students.html",
  },
  {
    date: "Apr 2025",
    tag: "Express Entry",
    tagColor: "#e8f0fe",
    tagText: "#1d4ed8",
    title: "Express Entry Draw: 3,700 Invitations Issued",
    body: "IRCC issued 3,700 Invitations to Apply (ITAs) in the latest all-program Express Entry draw with a CRS cutoff of 491.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html",
  },
  {
    date: "Mar 2025",
    tag: "Study Permit",
    tagColor: "#e6f9ef",
    tagText: "#15803d",
    title: "Student Direct Stream Processing Time Update",
    body: "IRCC reports improved processing times for SDS applications, now averaging 7–10 weeks for eligible countries.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/student-direct-stream.html",
  },
];

function CategoryCard({ cat }) {
  const pct = Math.round((cat.done / cat.total) * 100);

  return (
    <Link to={cat.path} className="dash-cat-card" style={{ background: cat.color }}>
      <div className="dash-cat-card__header">
        <span className="dash-cat-card__icon">{cat.icon}</span>
        <span className="dash-cat-card__progress-text" style={{ color: cat.accent }}>
          {cat.done}/{cat.total}
        </span>
      </div>

      <h3 className="dash-cat-card__title">{cat.label}</h3>

      {/* Progress bar */}
      <div className="dash-cat-card__bar-bg">
        <div className="dash-cat-card__bar-fill" style={{ width: `${pct}%`, background: cat.accent }} />
      </div>

      <ul className="dash-cat-card__items">
        {cat.items.slice(0, 2).map(item => (
          <li key={item}>{item}</li>
        ))}
        {cat.items.length > 2 && <li style={{ color: cat.accent }}>+{cat.items.length - 2} more…</li>}
      </ul>
    </Link>
  );
}

export default function Dashboard() {
  const { user }     = useContext(AuthContext);
  const notifCtx     = useContext(NotificationsContext);
  const unread       = notifCtx?.notifications?.length ?? 0;

  const totalTasks   = TASK_CATEGORIES.reduce((s, c) => s + c.total, 0);
  const doneTasks    = TASK_CATEGORIES.reduce((s, c) => s + c.done, 0);
  const totalDocs    = 8; // from DocumentAlerts mock
  const uploadedDocs = 2;

  return (
    <div className="dashboard">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-heading">Welcome back{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="dash-sub">Here's your settlement progress at a glance.</p>
        </div>
        {unread > 0 && (
          <Link to="/notifications-dashboard" className="dash-notif-chip">
            🔔 {unread} reminder{unread !== 1 ? "s" : ""} pending
          </Link>
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat__num">{uploadedDocs}</span>
          <span className="dash-stat__label">Documents uploaded</span>
          <div className="dash-stat__bar">
            <div className="dash-stat__fill" style={{ width: `${(uploadedDocs/totalDocs)*100}%`, background: "#8E0002" }} />
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{totalTasks}</span>
          <span className="dash-stat__label">Total tasks</span>
          <div className="dash-stat__bar">
            <div className="dash-stat__fill" style={{ width: `${(doneTasks/totalTasks)*100}%`, background: "#2563eb" }} />
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{doneTasks}</span>
          <span className="dash-stat__label">Tasks completed</span>
          <div className="dash-stat__bar">
            <div className="dash-stat__fill" style={{ width: `${(doneTasks/totalTasks)*100}%`, background: "#15803d" }} />
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat__num">{unread}</span>
          <span className="dash-stat__label">Notifications</span>
          <div className="dash-stat__bar">
            <div className="dash-stat__fill" style={{ width: `${Math.min(100, unread * 20)}%`, background: "#e67e22" }} />
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <div className="dash-quick">
        <Link to="/tasks"              className="dash-qa dash-qa--primary">📌 My Tasks</Link>
        <Link to="/document-alerts"    className="dash-qa">⏰ Document Alerts</Link>
        <Link to="/compliance"         className="dash-qa">📋 Compliance</Link>
        <Link to="/notifications-dashboard" className="dash-qa">🔔 Notifications</Link>
        <Link to="/features"           className="dash-qa">🌐 All Resources</Link>
      </div>

      {/* ── Category cards ─────────────────────────────────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section__title">Your Settlement Journey</h2>
        <div className="dash-cat-grid">
          {TASK_CATEGORIES.map(cat => (
            <CategoryCard key={cat.label} cat={cat} />
          ))}
        </div>
      </div>

      {/* ── Latest news ────────────────────────────────────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section__title">Latest Immigration News</h2>
        <div className="dash-news">
          {NEWS.map(n => (
            <a key={n.title} href={n.url} target="_blank" rel="noreferrer" className="dash-news-card">
              <div className="dash-news-card__meta">
                <span className="dash-news-card__tag" style={{ background: n.tagColor, color: n.tagText }}>{n.tag}</span>
                <span className="dash-news-card__date">{n.date}</span>
              </div>
              <h4 className="dash-news-card__title">{n.title}</h4>
              <p className="dash-news-card__body">{n.body}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
