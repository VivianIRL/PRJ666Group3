// TasksDashboard.jsx — clean filterable task list, no inner sidebar
import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { fetchTasks, updateTask } from "../service/taskService";
import "../scss/TasksDashboard.scss";

// ── Mock task templates with base_due_days relative to arrival ────────────────
// due_date is computed at runtime from user.arrivalDate + base_due_days
// so a user who just arrived never sees stale overdue dates.
const MOCK_TEMPLATES = [
  { user_task_id: 1, title: "Apply for Social Insurance Number (SIN)", category: "Employment",
    base_due_days: 7,   guideUrl: "/guides/sin",
    description: "Visit Service Canada or apply online. You need your passport and study/work permit." },
  { user_task_id: 2, title: "Open a Canadian Bank Account", category: "Banking",
    base_due_days: 14,  guideUrl: "/guides/bank-account",
    description: "TD and RBC have newcomer packages with no monthly fees for the first year." },
  { user_task_id: 3, title: "Register for Provincial Health Card", category: "Health",
    base_due_days: 30,  guideUrl: "/guides/health-card",
    description: "3-month waiting period applies in most provinces. Apply as soon as you arrive." },
  { user_task_id: 4, title: "Secure Permanent Housing", category: "Housing",
    base_due_days: 30,  guideUrl: "/housing",
    description: "Connect with settlement agencies or search Kijiji, Zillow, and Facebook Marketplace." },
  { user_task_id: 5, title: "Renew Study / Work Permit", category: "Immigration",
    base_due_days: 90,  guideUrl: "/guides/permit-renewal",
    description: "Apply at least 90 days before expiry through the IRCC online portal." },
  { user_task_id: 6, title: "File Annual Income Tax Return", category: "Finance",
    base_due_days: 365, guideUrl: "/guides/tax-return",
    description: "Even with no income, filing taxes establishes Canadian tax residency." },
];

// Build mock tasks with due dates relative to arrivalDate (or today if not set)
function buildMockTasks(arrivalDate) {
  const base = arrivalDate ? new Date(arrivalDate) : new Date();
  if (isNaN(base)) return buildMockTasks(null); // bad date → fall back to today
  return MOCK_TEMPLATES.map((t, i) => {
    const due = new Date(base);
    due.setDate(due.getDate() + t.base_due_days);
    return {
      ...t,
      // First task pre-completed as a demo; rest pending/in-progress
      status:   i === 0 ? "Completed" : i < 2 ? "In Progress" : "Pending",
      due_date: due.toISOString().split("T")[0],
    };
  });
}

// ── Normalise API task → UI shape ──────────────────────────────────────────────
function normalise(t) {
  const tmpl = t.task_templates ?? {};
  return {
    user_task_id: t.user_task_id,
    title:        tmpl.title    ?? t.title    ?? "Untitled",
    description:  tmpl.description ?? t.description ?? "",
    category:     tmpl.category ?? t.category ?? "General",
    status:       t.status      ?? "Pending",
    due_date:     t.due_date    ?? "",
    guideUrl:     t.guideUrl    ?? "/features",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function fmtDate(dateStr) {
  if (!dateStr) return "No due date";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function urgency(days) {
  if (days === null) return "";
  if (days < 0)  return "overdue";
  if (days <= 7) return "soon";
  return "";
}

const STATUS_COLORS = {
  "Completed":  { bg: "#e6f9ef", text: "#15803d" },
  "In Progress":{ bg: "#e8f0fe", text: "#1d4ed8" },
  "Pending":    { bg: "#f5f0f2", text: "#7a6a70" },
};

const FILTERS = ["All", "Pending", "In Progress", "Completed"];

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const days   = daysLeft(task.due_date);
  const urg    = urgency(days);
  const done   = task.status === "Completed";
  const colors = STATUS_COLORS[task.status] ?? STATUS_COLORS["Pending"];

  return (
    <div className={`td-card ${done ? "td-card--done" : ""} ${urg ? `td-card--${urg}` : ""}`}>
      <div className="td-card__main" onClick={() => setExpanded(e => !e)}>
        <div className="td-card__left">
          <button
            className={`td-check ${done ? "td-check--done" : ""}`}
            onClick={e => { e.stopPropagation(); if (!done) onComplete(task.user_task_id); }}
            aria-label={done ? "Completed" : "Mark complete"}
          >
            {done && <svg viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
          <div>
            <p className={`td-card__title ${done ? "td-card__title--done" : ""}`}>{task.title}</p>
            <p className="td-card__meta">
              <span className="td-card__cat">{task.category}</span>
              <span className={`td-card__due ${urg ? `td-card__due--${urg}` : ""}`}>
                {urg === "overdue" ? "⚠ Overdue · " : urg === "soon" ? "⏰ Due soon · " : ""}
                {fmtDate(task.due_date)}
              </span>
            </p>
          </div>
        </div>
        <div className="td-card__right">
          <span className="td-card__status" style={{ background: colors.bg, color: colors.text }}>
            {task.status}
          </span>
          <span className="td-card__chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="td-card__detail">
          {task.description && <p className="td-card__desc">{task.description}</p>}
          <Link to={task.guideUrl} className="td-card__guide">View step-by-step guide →</Link>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TasksDashboard() {
  const { user }          = useContext(AuthContext);
  const [tasks, setTasks] = useState(() => buildMockTasks(user?.arrivalDate));
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data.map(normalise));
      } else {
        // API returned nothing — rebuild mock tasks with the current user's arrival date
        setTasks(buildMockTasks(user?.arrivalDate));
      }
    } catch {
      setTasks(buildMockTasks(user?.arrivalDate));
    }
    finally { setLoading(false); }
  }, [user?.arrivalDate]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function handleComplete(id) {
    setTasks(prev => prev.map(t => t.user_task_id === id ? { ...t, status: "Completed" } : t));
    await updateTask(id, { status: "Completed" }).catch(() => {});
  }

  const filtered = filter === "All" ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all:        tasks.length,
    pending:    tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed:  tasks.filter(t => t.status === "Completed").length,
  };
  const pct = tasks.length ? Math.round((counts.completed / tasks.length) * 100) : 0;

  if (loading) return <div className="td-loading">Loading your tasks…</div>;

  return (
    <div className="td-page">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="td-header">
        <div>
          <h1 className="td-title">My Tasks</h1>
          <p className="td-sub">
            {user?.immigrationStatus && <span className="td-status-badge">{user.immigrationStatus}</span>}
            {" "}{counts.completed} of {tasks.length} completed
          </p>
        </div>
        <Link to="/task-manager" className="td-add-btn">+ Add task</Link>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="td-progress">
        <div className="td-progress__track">
          <div className="td-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="td-progress__pct">{pct}%</span>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="td-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`td-filter ${filter === f ? "td-filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="td-filter__count">
              {f === "All" ? counts.all
               : f === "Pending" ? counts.pending
               : f === "In Progress" ? counts.inProgress
               : counts.completed}
            </span>
          </button>
        ))}
      </div>

      {/* ── Task list ──────────────────────────────────────────────────────── */}
      <div className="td-list">
        {filtered.length === 0 ? (
          <div className="td-empty">No {filter.toLowerCase()} tasks.</div>
        ) : (
          filtered.map(t => (
            <TaskCard key={t.user_task_id} task={t} onComplete={handleComplete} />
          ))
        )}
      </div>

    </div>
  );
}
