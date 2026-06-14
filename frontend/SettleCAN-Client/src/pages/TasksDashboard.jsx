// TasksDashboard.jsx — profile-aware tasks, 3-state toggle, clear status labels
import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { fetchTasks, updateTask } from "../service/taskService";
import "../scss/TasksDashboard.scss";

// ── localStorage keys ─────────────────────────────────────────────────────────
// TASKS_DONE_KEY is shared with Checklist.jsx — acts as the cross-component signal
const TASKS_DONE_KEY  = (uid) => `settlecan_tasks_done_${uid ?? 'guest'}`;
// TASKS_STATE_KEY persists full per-task status (including "In Progress")
const TASKS_STATE_KEY = (uid, status) => `settlecan_tasks_state_${uid ?? 'guest'}_${status ?? 'default'}`;

function loadTaskStateMap(uid, immigStatus) {
  try { return JSON.parse(localStorage.getItem(TASKS_STATE_KEY(uid, immigStatus))) ?? {}; }
  catch { return {}; }
}
function saveTaskStateMap(tasks, uid, immigStatus) {
  try {
    const map = {};
    tasks.forEach(t => { map[t.user_task_id] = t.status; });
    localStorage.setItem(TASKS_STATE_KEY(uid, immigStatus), JSON.stringify(map));
  } catch {}
}

// ── Status cycle ───────────────────────────────────────────────────────────────
const NEXT_STATUS = {
  "Pending":     "In Progress",
  "In Progress": "Completed",
  "Completed":   "Pending",
};

const STATUS_CONFIG = {
  "Completed":   { bg: "#e6f9ef", text: "#15803d", label: "Done",        hint: "Click to reset" },
  "In Progress": { bg: "#fff7e6", text: "#b45309", label: "In progress", hint: "Click to complete" },
  "Pending":     { bg: "#f5f0f2", text: "#7a6a70", label: "Not started", hint: "Click to start" },
};

// ── Task templates per immigration status ──────────────────────────────────────
// IDs 1–6: shared settlement tasks (SIN, bank, health, housing, permit, tax)
// IDs 7–12: visitor-specific tasks
const TEMPLATES = {
  "International Student": [
    { user_task_id: 1, title: "Apply for Social Insurance Number (SIN)", category: "Employment",
      base_due_days: 7,   guideUrl: "/guides/sin",
      description: "Visit Service Canada or apply online. You need your passport and study permit." },
    { user_task_id: 2, title: "Open a Canadian Bank Account", category: "Banking",
      base_due_days: 14,  guideUrl: "/guides/bank-account",
      description: "TD and RBC have newcomer packages with no monthly fees for the first year." },
    { user_task_id: 3, title: "Register for Provincial Health Card", category: "Health",
      base_due_days: 30,  guideUrl: "/guides/health-card",
      description: "3-month waiting period applies in most provinces — apply as soon as you arrive." },
    { user_task_id: 4, title: "Secure Permanent Housing", category: "Housing",
      base_due_days: 30,  guideUrl: "/housing",
      description: "Connect with settlement agencies or search Kijiji, Zillow, and Facebook Marketplace." },
    { user_task_id: 5, title: "Check Study Permit Expiry & Renewal", category: "Immigration",
      base_due_days: 90,  guideUrl: "/guides/permit-renewal",
      description: "Apply to renew at least 90 days before expiry through the IRCC online portal." },
    { user_task_id: 6, title: "File Annual Income Tax Return", category: "Finance",
      fixed_due: "04-30", guideUrl: "/guides/tax-return",
      description: "Even with no income, filing taxes establishes Canadian tax residency and unlocks benefits." },
  ],
  "Work Permit Holder": [
    { user_task_id: 1, title: "Apply for Social Insurance Number (SIN)", category: "Employment",
      base_due_days: 7,   guideUrl: "/guides/sin",
      description: "Required to work legally in Canada. Visit Service Canada or apply online." },
    { user_task_id: 3, title: "Register for Provincial Health Card", category: "Health",
      base_due_days: 14,  guideUrl: "/guides/health-card",
      description: "3-month waiting period in most provinces — apply on arrival." },
    { user_task_id: 2, title: "Open a Canadian Bank Account", category: "Banking",
      base_due_days: 14,  guideUrl: "/guides/bank-account",
      description: "Needed for payroll. TD, RBC, and Scotiabank offer newcomer packages." },
    { user_task_id: 4, title: "Secure Permanent Housing", category: "Housing",
      base_due_days: 30,  guideUrl: "/housing",
      description: "Budget for first and last month's rent. Get tenant insurance." },
    { user_task_id: 5, title: "Renew Work Permit Before Expiry", category: "Immigration",
      base_due_days: 90,  guideUrl: "/guides/permit-renewal",
      description: "Apply at least 90 days before expiry. Maintained status rules apply." },
    { user_task_id: 6, title: "File Annual Income Tax Return", category: "Finance",
      fixed_due: "04-30", guideUrl: "/guides/tax-return",
      description: "File by April 30. Even partial-year residents must file." },
  ],
  "Permanent Resident": [
    { user_task_id: 3, title: "Register for Provincial Health Card", category: "Health",
      base_due_days: 7,   guideUrl: "/guides/health-card",
      description: "Apply immediately on landing — the 3-month wait starts from your application date." },
    { user_task_id: 1, title: "Apply for / Update Your SIN", category: "Employment",
      base_due_days: 14,  guideUrl: "/guides/sin",
      description: "If you had a temporary SIN (starting with 9), update it to a permanent SIN now." },
    { user_task_id: 2, title: "Open a Canadian Bank Account", category: "Banking",
      base_due_days: 14,  guideUrl: "/guides/bank-account",
      description: "Start building your credit history with a secured card." },
    { user_task_id: 4, title: "Secure Permanent Housing", category: "Housing",
      base_due_days: 30,  guideUrl: "/housing",
      description: "You have the same tenancy rights as Canadian citizens." },
    { user_task_id: 6, title: "File Annual Income Tax Return", category: "Finance",
      fixed_due: "04-30", guideUrl: "/guides/tax-return",
      description: "Establishes Canadian tax residency and unlocks the Canada Child Benefit and GST credits." },
  ],
  "Refugee / Protected Person": [
    { user_task_id: 1, title: "Apply for Social Insurance Number (SIN)", category: "Employment",
      base_due_days: 7,   guideUrl: "/guides/sin",
      description: "You can apply for a SIN once you have your Protected Person determination." },
    { user_task_id: 3, title: "Register for IFHP Health Coverage", category: "Health",
      base_due_days: 7,   guideUrl: "/guides/health-card",
      description: "The Interim Federal Health Program covers you while you wait for provincial health." },
    { user_task_id: 2, title: "Open a Canadian Bank Account", category: "Banking",
      base_due_days: 14,  guideUrl: "/guides/bank-account",
      description: "Required for RAP payments and future employment." },
    { user_task_id: 4, title: "Secure Stable Housing", category: "Housing",
      base_due_days: 14,  guideUrl: "/housing",
      description: "Contact your RAP provider or local settlement agency for housing support." },
    { user_task_id: 6, title: "File Annual Income Tax Return", category: "Finance",
      fixed_due: "04-30", guideUrl: "/guides/tax-return",
      description: "Filing taxes unlocks the Canada Child Benefit and other income-tested benefits." },
  ],
  "Visitor / Tourist": [
    { user_task_id: 7,  title: "Confirm Your Authorized Stay Duration", category: "Immigration",
      base_due_days: 1,  guideUrl: "/checklist",
      description: "Check your entry stamp or eTA for your exact 'authorized to remain until' date. Note it somewhere safe — do not overstay." },
    { user_task_id: 8,  title: "Purchase Visitor Health Insurance", category: "Health",
      base_due_days: 1,  guideUrl: "/checklist",
      description: "Provincial health insurance does not cover visitors. Buy private coverage before you arrive or on your first day." },
    { user_task_id: 9,  title: "Get a Local SIM or Activate Roaming", category: "Essentials",
      base_due_days: 3,  hideDue: true, guideUrl: "/checklist",
      description: "Canadian prepaid SIMs (Fido, Public Mobile, Lucky) are often cheaper than roaming. Available at most convenience stores." },
    { user_task_id: 10, title: "Download a Transit App for Your City", category: "Essentials",
      base_due_days: 3,  hideDue: true, guideUrl: "/checklist",
      description: "TTC (Toronto), STM (Montréal), TransLink (Vancouver). The Transit app works across most Canadian cities." },
    { user_task_id: 11, title: "Apply to Extend Your Stay If Needed", category: "Immigration",
      base_due_days: 150, guideUrl: "/checklist",
      description: "Apply via IRCC at least 30 days before your authorized stay ends (around the 5-month mark). Overstaying affects all future Canadian applications." },
    { user_task_id: 12, title: "Explore Permit Options for Longer Stays", category: "Immigration",
      base_due_days: 60, hideDue: true, guideUrl: "/immigration-guide",
      description: "If you want to study or work in Canada, you need a separate permit. Research options early — processing takes time." },
  ],
};

function getTemplates(status) {
  return TEMPLATES[status] ?? TEMPLATES["International Student"];
}

// Returns the next upcoming occurrence of a MM-DD calendar date (e.g. "04-30" → April 30)
function nextCalendarDate(mmdd) {
  const today = new Date();
  const year  = today.getFullYear();
  const candidate = new Date(`${year}-${mmdd}T00:00:00`);
  // If this year's date has already passed, use next year's
  return candidate < today ? new Date(`${year + 1}-${mmdd}T00:00:00`) : candidate;
}

// Build tasks from templates, then restore saved state from localStorage
function buildMockTasks(arrivalDate, immigStatus, uid) {
  const base = arrivalDate ? new Date(arrivalDate + "T00:00:00") : new Date();
  if (isNaN(base)) return buildMockTasks(null, immigStatus, uid);
  const fresh = getTemplates(immigStatus).map(t => {
    let dueStr = null;
    if (!t.hideDue) {
      if (t.fixed_due) {
        // Fixed annual calendar date (e.g. April 30 for tax returns)
        dueStr = nextCalendarDate(t.fixed_due).toISOString().split("T")[0];
      } else if (t.base_due_days != null) {
        const due = new Date(base);
        due.setDate(due.getDate() + t.base_due_days);
        dueStr = due.toISOString().split("T")[0];
      }
    }
    return {
      ...t,
      status:   "Pending",
      due_date: dueStr,
    };
  });
  // Restore previously saved statuses (includes "In Progress")
  const savedMap = loadTaskStateMap(uid, immigStatus);
  // Also honour any completions signalled from the Checklist
  let doneDone;
  try { doneDone = new Set(JSON.parse(localStorage.getItem(TASKS_DONE_KEY(uid))) ?? []); }
  catch { doneDone = new Set(); }

  return fresh.map(t => {
    if (doneDone.has(t.user_task_id)) return { ...t, status: "Completed" };
    return { ...t, status: savedMap[t.user_task_id] ?? "Pending" };
  });
}

// ── Normalise API task → UI shape ──────────────────────────────────────────────
function normalise(t) {
  const tmpl = t.task_templates ?? {};
  return {
    user_task_id: t.user_task_id,
    title:        tmpl.title       ?? t.title       ?? "Untitled",
    description:  tmpl.description ?? t.description ?? "",
    category:     tmpl.category    ?? t.category    ?? "General",
    status:       t.status         ?? "Pending",
    due_date:     t.due_date       ?? "",
    guideUrl:     t.guideUrl       ?? "/features",
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

const FILTERS = ["All", "Not started", "In Progress", "Completed"];

// ── Check button ──────────────────────────────────────────────────────────────
function CheckButton({ status, onClick }) {
  const isDone     = status === "Completed";
  const inProgress = status === "In Progress";
  const cfg        = STATUS_CONFIG[status] ?? STATUS_CONFIG["Pending"];

  return (
    <button
      className={`td-check ${isDone ? "td-check--done" : inProgress ? "td-check--progress" : ""}`}
      onClick={onClick}
      title={cfg.hint}
      aria-label={cfg.hint}
    >
      {isDone && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {inProgress && (
        <svg viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" fill="#b45309" opacity="0.15"/>
          <path d="M7 3v4l2.5 2.5" stroke="#b45309" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const days = task.due_date ? daysLeft(task.due_date) : null;
  const urg  = task.due_date ? urgency(days) : "";
  const cfg  = STATUS_CONFIG[task.status] ?? STATUS_CONFIG["Pending"];

  return (
    <div className={`td-card ${task.status === "Completed" ? "td-card--done" : ""} ${urg ? `td-card--${urg}` : ""}`}>
      <div className="td-card__main" onClick={() => setExpanded(e => !e)}>
        <div className="td-card__left">
          <CheckButton
            status={task.status}
            onClick={e => { e.stopPropagation(); onToggle(task.user_task_id); }}
          />
          <div>
            <p className={`td-card__title ${task.status === "Completed" ? "td-card__title--done" : ""}`}>
              {task.title}
            </p>
            <p className="td-card__meta">
              <span className="td-card__cat">{task.category}</span>
              {task.due_date && (
                <span className={`td-card__due ${urg ? `td-card__due--${urg}` : ""}`}>
                  {urg === "overdue" ? "⚠ Overdue · " : urg === "soon" ? "⏰ Due soon · " : ""}
                  {fmtDate(task.due_date)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="td-card__right">
          <span className="td-card__status" style={{ background: cfg.bg, color: cfg.text }}>
            {cfg.label}
          </span>
          <span className="td-card__chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="td-card__detail">
          {task.description && <p className="td-card__desc">{task.description}</p>}
          <p className="td-card__cycle-hint">
            {task.status === "Pending"     && "Click the circle to mark as In Progress."}
            {task.status === "In Progress" && "Click the circle again to mark as Complete."}
            {task.status === "Completed"   && "Click the circle to uncheck and reset to Pending."}
          </p>
          <Link to={task.guideUrl} className="td-card__guide">View step-by-step guide →</Link>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TasksDashboard() {
  const { user } = useContext(AuthContext);
  const uid      = user?.id ?? 'guest';
  const status   = user?.immigrationStatus;

  const [tasks, setTasks]     = useState(() => buildMockTasks(user?.arrivalDate, status, uid));
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data.map(normalise));
      } else {
        setTasks(buildMockTasks(user?.arrivalDate, status, uid));
      }
    } catch {
      setTasks(buildMockTasks(user?.arrivalDate, status, uid));
    } finally { setLoading(false); }
  }, [user?.arrivalDate, status, uid]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Re-sync from Checklist when this page regains focus
  useEffect(() => {
    function onFocus() {
      setTasks(prev => {
        let doneDone;
        try { doneDone = new Set(JSON.parse(localStorage.getItem(TASKS_DONE_KEY(uid))) ?? []); }
        catch { doneDone = new Set(); }
        if (doneDone.size === 0) return prev;
        return prev.map(t =>
          doneDone.has(t.user_task_id) && t.status !== "Completed"
            ? { ...t, status: "Completed" }
            : t
        );
      });
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [uid]);

  async function handleToggle(id) {
    const current = tasks.find(t => t.user_task_id === id);
    const next    = NEXT_STATUS[current?.status ?? "Pending"] ?? "Pending";

    const updated = tasks.map(t => t.user_task_id === id ? { ...t, status: next } : t);
    setTasks(updated);

    // Persist full task state so page reloads restore statuses
    saveTaskStateMap(updated, uid, status);

    // Update the shared done-key so Checklist stays in sync
    try {
      const done = JSON.parse(localStorage.getItem(TASKS_DONE_KEY(uid))) ?? [];
      const newDone = next === "Completed"
        ? [...new Set([...done, id])]
        : done.filter(d => d !== id);
      localStorage.setItem(TASKS_DONE_KEY(uid), JSON.stringify(newDone));
    } catch {}

    await updateTask(id, { status: next }).catch(() => {});
  }

  const filterKey = filter === "Not started" ? "Pending" : filter;
  const filtered  = filter === "All" ? tasks : tasks.filter(t => t.status === filterKey);

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
            {status && <span className="td-status-badge">{status}</span>}
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
        {FILTERS.map(f => {
          const count = f === "All" ? counts.all
            : f === "Not started" ? counts.pending
            : f === "In Progress" ? counts.inProgress
            : counts.completed;
          return (
            <button
              key={f}
              className={`td-filter ${filter === f ? "td-filter--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="td-filter__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Task list ──────────────────────────────────────────────────────── */}
      <div className="td-list">
        {filtered.length === 0 ? (
          <div className="td-empty">No {filter.toLowerCase()} tasks.</div>
        ) : (
          filtered.map(t => (
            <TaskCard key={t.user_task_id} task={t} onToggle={handleToggle} />
          ))
        )}
      </div>

    </div>
  );
}
