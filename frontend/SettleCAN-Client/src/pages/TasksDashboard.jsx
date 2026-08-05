// TasksDashboard.jsx — "My Tasks": a real, persisted task hierarchy.
// Every task can have subtasks (unlimited nesting), and every task/subtask
// has an optional due date. Setting a date IS the entire "create a
// reminder" step — the backend's daily sweep reads due_date directly and
// emails 7/3/1 days before; there's no separate notification toggle to set.
// Backed by the /api/v2/tasks hierarchy API — see
// docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md.
import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import { AuthContext } from "../state/AuthContext";
import {
  fetchTaskTree, createTaskNode, updateTaskNode, deleteTaskNode,
  createSubtask, generateOnboardingTasks,
} from "../service/taskService";
import TasksCalendarView from "../components/TasksCalendarView";
import SmartDateInput from "../components/SmartDateInput";
import { getTaskResource } from "../utils/taskResourceLinks";
import "../scss/TasksDashboard.scss";

// #f97316 = $in-progress in scss/_variables.scss — kept in sync manually
// since JS can't import a Sass variable; also used by TasksCalendarView.jsx
// so the calendar's day pills and detail cards match this exactly.
const IN_PROGRESS_COLOR = "#f97316";
const STATUS_CONFIG = {
  COMPLETED:   { bg: "#e6f9ef", text: "#15803d",       label: "Done",        hint: "Click to reset" },
  IN_PROGRESS: { bg: "#fff1e6", text: IN_PROGRESS_COLOR, label: "In progress", hint: "Click to complete" },
  NOT_STARTED: { bg: "#f5f0f2", text: "#7a6a70",       label: "Not started", hint: "Click to start" },
};
const NEXT_STATUS = { NOT_STARTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED", COMPLETED: "NOT_STARTED" };
const FILTERS = ["All", "Not started", "In Progress", "Completed"];
const FILTER_TO_STATUS = { "Not started": "NOT_STARTED", "In Progress": "IN_PROGRESS", "Completed": "COMPLETED" };

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}
function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}
function urgency(days) {
  if (days === null) return "";
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  return "";
}

// Root tasks + every descendant, flattened — used to feed the calendar.
function flatten(nodes) {
  const out = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

function CheckButton({ status, interactive, onClick }) {
  const isDone = status === "COMPLETED";
  const inProgress = status === "IN_PROGRESS";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_STARTED;
  return (
    <button
      className={`td-check ${isDone ? "td-check--done" : inProgress ? "td-check--progress" : ""}`}
      onClick={interactive ? onClick : (e) => e.stopPropagation()}
      title={interactive ? cfg.hint : "This task's status follows its subtasks"}
      aria-label={cfg.hint}
      style={interactive ? undefined : { cursor: "default" }}
    >
      {isDone && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {inProgress && (
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M7 3v4l2.5 2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ── One subtask row (checkbox + title + inline date + delete) ─────────────────
function SubtaskRow({ subtask, onToggleStatus, onSetDate, onDelete, highlighted }) {
  const [editingDate, setEditingDate] = useState(false);
  const days = subtask.dueDate ? daysLeft(subtask.dueDate) : null;
  const urg = subtask.dueDate ? urgency(days) : "";
  const rowRef = useRef(null);

  useEffect(() => {
    if (highlighted) rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  return (
    <div ref={rowRef} className={`td-subtask ${urg ? `td-subtask--${urg}` : ""} ${highlighted ? "td-subtask--highlight" : ""}`}>
      <CheckButton status={subtask.status} interactive onClick={() => onToggleStatus(subtask)} />
      <span className={`td-subtask__title ${subtask.status === "COMPLETED" ? "td-subtask__title--done" : ""}`}>
        {subtask.title}
      </span>

      {editingDate ? (
        <span className="td-subtask__date-editor" onClick={(e) => e.stopPropagation()}>
          <SmartDateInput
            value={subtask.dueDate ?? ""}
            onChange={(v) => { if (v) { onSetDate(subtask, v); setEditingDate(false); } }}
          />
          <button className="td-subtask__date-cancel" onClick={() => setEditingDate(false)}>✕</button>
        </span>
      ) : subtask.dueDate ? (
        <button className={`td-subtask__due td-subtask__due--${urg || "ok"}`} onClick={() => setEditingDate(true)}>
          {urg === "overdue" ? "⚠ " : urg === "soon" ? "⏰ " : "📅 "}{fmtDate(subtask.dueDate)}
        </button>
      ) : (
        <button className="td-subtask__add-date" onClick={() => setEditingDate(true)}>+ date</button>
      )}

      <button className="td-subtask__delete" onClick={() => onDelete(subtask)} title="Remove subtask">×</button>
    </div>
  );
}

// ── One root task card (expands to its date subsection + subtasks) ────────────
function TaskCard({ task, onToggleStatus, onSetDate, onAddSubtask, onDeleteSubtask, onToggleSubtaskStatus, onSetSubtaskDate, highlightId }) {
  const children = task.children ?? [];
  const highlightedChildId = children.find((c) => highlightId && String(c.id) === String(highlightId))?.id;
  const isHighlighted = highlightId != null && String(task.id) === String(highlightId);

  const [expanded, setExpanded] = useState(isHighlighted || highlightedChildId != null);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const cardRef = useRef(null);

  const hasChildren = children.length > 0;
  const doneCount = children.filter((c) => c.status === "COMPLETED").length;
  const days = task.dueDate ? daysLeft(task.dueDate) : null;
  const urg = task.dueDate ? urgency(days) : "";
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.NOT_STARTED;
  const resource = getTaskResource(task);

  useEffect(() => {
    if (isHighlighted) {
      setExpanded(true);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (highlightedChildId != null) {
      setExpanded(true);
    }
  }, [isHighlighted, highlightedChildId]);

  async function submitSubtask() {
    if (!newSubtaskTitle.trim()) return;
    await onAddSubtask(task, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
    setAddingSubtask(false);
  }

  return (
    <div ref={cardRef} className={`td-card ${task.status === "COMPLETED" ? "td-card--done" : ""} ${urg ? `td-card--${urg}` : ""} ${isHighlighted ? "td-card--highlight" : ""}`}>
      <div className="td-card__main" onClick={() => setExpanded((e) => !e)}>
        <div className="td-card__left">
          <CheckButton status={task.status} interactive={!hasChildren} onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }} />
          <div>
            <p className={`td-card__title ${task.status === "COMPLETED" ? "td-card__title--done" : ""}`}>{task.title}</p>
            <p className="td-card__meta">
              {task.type === "CUSTOM" && <span className="td-card__cat">Custom</span>}
              {hasChildren && <span className="td-card__cat">{doneCount} of {children.length} subtasks</span>}
              {task.dueDate && (
                <span className={`td-card__due ${urg ? `td-card__due--${urg}` : ""}`}>
                  {urg === "overdue" ? "⚠ Overdue · " : urg === "soon" ? "⏰ Due soon · " : ""}
                  {fmtDate(task.dueDate)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="td-card__right">
          <span className="td-card__status" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
          <span className="td-card__chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="td-card__detail" onClick={(e) => e.stopPropagation()}>
          {task.description && <p className="td-card__desc">{task.description}</p>}

          {/* Date subsection — the entire "set up a reminder" flow */}
          <div className="td-card__date-row">
            {editingDate ? (
              <>
                <SmartDateInput
                  value={task.dueDate ?? ""}
                  onChange={(v) => { if (v) { onSetDate(task, v); setEditingDate(false); } }}
                />
                {task.dueDate && (
                  <button className="td-card__date-clear" onClick={() => { onSetDate(task, null); setEditingDate(false); }}>Clear date</button>
                )}
                <button className="td-card__date-cancel" onClick={() => setEditingDate(false)}>✕</button>
              </>
            ) : (
              <button className="td-card__date-set" onClick={() => setEditingDate(true)}>
                📅 {task.dueDate ? `Due ${fmtDate(task.dueDate)} — edit` : "Set a date (optional) — you'll be reminded automatically"}
              </button>
            )}
          </div>

          {/* Subtasks — this task's own checklist */}
          <div className="td-card__subtasks">
            {children.map((sub) => (
              <SubtaskRow
                key={sub.id}
                subtask={sub}
                onToggleStatus={onToggleSubtaskStatus}
                onSetDate={onSetSubtaskDate}
                onDelete={onDeleteSubtask}
                highlighted={highlightedChildId != null && String(sub.id) === String(highlightedChildId)}
              />
            ))}
            {addingSubtask ? (
              <div className="td-card__add-subtask">
                <input
                  autoFocus
                  type="text"
                  placeholder="Subtask name…"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitSubtask(); if (e.key === "Escape") setAddingSubtask(false); }}
                />
                <button className="td-card__add-subtask-save" onClick={submitSubtask}>Add</button>
                <button className="td-card__add-subtask-cancel" onClick={() => setAddingSubtask(false)}>Cancel</button>
              </div>
            ) : (
              <button className="td-card__add-subtask-btn" onClick={() => setAddingSubtask(true)}>+ Add subtask</button>
            )}
          </div>

          {resource && (
            <Link to={resource.path} className="td-card__resource-banner">
              <span className="td-card__resource-icon">📖</span>
              <span className="td-card__resource-text">
                <span className="td-card__resource-eyebrow">Related resource</span>
                <span className="td-card__resource-label">{resource.label}</span>
              </span>
              <span className="td-card__resource-arrow">→</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TasksDashboard() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState("Not started");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", due: "", subtasks: [] });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError(false);
    try {
      // Idempotent — a no-op after the first successful call for this user.
      await generateOnboardingTasks(user.id).catch(() => {});
      const data = await fetchTaskTree();
      setTree(Array.isArray(data) ? data : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  function replaceTree(updated) {
    if (Array.isArray(updated)) setTree(updated);
  }

  async function handleToggleStatus(task) {
    const next = NEXT_STATUS[task.status] ?? "NOT_STARTED";
    try {
      replaceTree(await updateTaskNode(task.id, { status: next }));
    } catch { showToast("Couldn't update the task — check your connection."); }
  }

  async function handleSetDate(task, dueDate) {
    try {
      replaceTree(await updateTaskNode(task.id, { dueDate }));
      if (dueDate) showToast("Date set — you'll get reminders 7, 3, and 1 day before.");
    } catch { showToast("Couldn't update the date — check your connection."); }
  }

  async function handleToggleSubtaskStatus(subtask) {
    // Subtasks are a binary checklist item — done or not — not a 3-way
    // cycle. The parent task's status is never set directly (its checkbox
    // is non-interactive whenever it has children — see TaskCard below);
    // it's derived server-side (recompute_ancestor_status, in
    // 002_task_hierarchy_system.sql) from its children's statuses: NOT_STARTED
    // while none are done, IN_PROGRESS as soon as any subtask is completed,
    // COMPLETED once every subtask is.
    const next = subtask.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    try {
      replaceTree(await updateTaskNode(subtask.id, { status: next }));
    } catch { showToast("Couldn't update the subtask — check your connection."); }
  }

  async function handleSetSubtaskDate(subtask, dueDate) {
    try {
      replaceTree(await updateTaskNode(subtask.id, { dueDate }));
      if (dueDate) showToast("Date set — you'll get reminders 7, 3, and 1 day before.");
    } catch { showToast("Couldn't update the date — check your connection."); }
  }

  async function handleDeleteSubtask(subtask) {
    try {
      await deleteTaskNode(subtask.id);
      await load();
    } catch { showToast("Couldn't remove the subtask."); }
  }

  async function handleAddSubtask(task, title) {
    try {
      await createSubtask(task.id, { title });
      await load();
    } catch { showToast("Couldn't add the subtask."); }
  }

  function openAdd() {
    setForm({ title: "", due: "", subtasks: [] });
    setErrors({});
    setShowAddModal(true);
  }

  function addSubtaskRow() {
    setForm((f) => ({ ...f, subtasks: [...f.subtasks, { title: "", due: "" }] }));
  }
  function updateSubtaskRow(index, field, value) {
    setForm((f) => ({
      ...f,
      subtasks: f.subtasks.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }
  function removeSubtaskRow(index) {
    setForm((f) => ({ ...f, subtasks: f.subtasks.filter((_, i) => i !== index) }));
  }

  function validateForm() {
    const e = {};
    if (!form.title.trim()) e.title = "Please enter a task name.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
    try {
      const task = await createTaskNode({ title: form.title.trim(), dueDate: form.due || null });
      const namedSubtasks = form.subtasks.filter((s) => s.title.trim());
      for (const s of namedSubtasks) {
        await createSubtask(task.id, { title: s.title.trim(), dueDate: s.due || null }).catch(() => {});
      }
      setShowAddModal(false);
      showToast(`"${form.title}" added${namedSubtasks.length ? ` with ${namedSubtasks.length} subtask${namedSubtasks.length === 1 ? "" : "s"}` : ""}!`);
      await load();
    } catch {
      showToast("Couldn't add the task — check your connection.");
    }
  }

  const flat = flatten(tree);
  const filterKey = FILTER_TO_STATUS[filter];
  const filteredRoots = (filter === "All" ? tree : tree.filter((t) => t.status === filterKey))
    .slice()
    // Earliest due date first, so the most overdue tasks sort to the top;
    // tasks with no due date carry no urgency signal, so they sink to the end.
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const counts = {
    all: tree.length,
    pending: tree.filter((t) => t.status === "NOT_STARTED").length,
    inProgress: tree.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tree.filter((t) => t.status === "COMPLETED").length,
  };
  const pct = tree.length ? Math.round((counts.completed / tree.length) * 100) : 0;

  if (loading) return <div className="td-loading">Loading your tasks…</div>;

  if (loadError) {
    return (
      <div className="td-page">
        <div className="td-empty">
          Couldn't load your tasks. Check your connection and try again.
          <div style={{ marginTop: "0.75rem" }}>
            <button className="td-add-btn" onClick={load}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="td-page">

      <div className="td-header">
        <div>
          <h1 className="td-title">My Tasks</h1>
          <p className="td-sub">
            {user?.immigrationStatus && <span className="td-status-badge">{user.immigrationStatus}</span>}
            {" "}{counts.completed} of {tree.length} completed
          </p>
        </div>
        <button className="td-add-btn" onClick={openAdd}>+ Add task</button>
      </div>

      <div className="td-progress">
        <div className="td-progress__track"><div className="td-progress__fill" style={{ width: `${pct}%` }} /></div>
        <span className="td-progress__pct">{pct}%</span>
      </div>

      <div className="td-body">
        <div className="td-left">
          <div className="td-filters">
            {FILTERS.map((f) => {
              const count = f === "All" ? counts.all : f === "Not started" ? counts.pending : f === "In Progress" ? counts.inProgress : counts.completed;
              return (
                <button key={f} className={`td-filter ${filter === f ? "td-filter--active" : ""}`} onClick={() => setFilter(f)}>
                  {f}<span className="td-filter__count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="td-list">
            {tree.length === 0 ? (
              <div className="td-empty td-empty--zero">
                <div className="td-empty__icon">🗂️</div>
                <div className="td-empty__title">No tasks yet</div>
                <div className="td-empty__body">
                  Your settlement tasks will show up here once they're generated for your profile,
                  or you can add your first one now.
                </div>
                <button className="td-add-btn" onClick={openAdd}>+ Add your first task</button>
              </div>
            ) : filteredRoots.length === 0 ? (
              <div className="td-empty">No {filter.toLowerCase()} tasks.</div>
            ) : (
              filteredRoots.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggleStatus={handleToggleStatus}
                  onSetDate={handleSetDate}
                  onAddSubtask={handleAddSubtask}
                  onDeleteSubtask={handleDeleteSubtask}
                  onToggleSubtaskStatus={handleToggleSubtaskStatus}
                  onSetSubtaskDate={handleSetSubtaskDate}
                  highlightId={highlightId}
                />
              ))
            )}
          </div>
        </div>

        <div className="td-right">
          <TasksCalendarView
            tasks={flat
              .filter((t) => t.dueDate)
              .map((t) => ({
                user_task_id: t.id,
                title: t.title,
                category: t.parentId ? "Subtask" : "Task",
                status: t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In Progress" : "Pending",
                due_date: t.dueDate,
              }))}
            embedded
          />
        </div>
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Add New Task</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Task Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Book appointment with advisor"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Due Date <span style={{ color: "#999", fontWeight: 400 }}>(optional — you'll be reminded automatically)</span></Form.Label>
            <Form.Control type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>
              Subtasks <span style={{ color: "#999", fontWeight: 400 }}>(optional — each can have its own date)</span>
            </Form.Label>
            <div className="td-subtask-rows">
              {form.subtasks.map((s, i) => (
                <div key={i} className="td-subtask-row">
                  <Form.Control
                    type="text"
                    placeholder="Subtask name"
                    value={s.title}
                    onChange={(e) => updateSubtaskRow(i, "title", e.target.value)}
                  />
                  <Form.Control
                    type="date"
                    value={s.due}
                    onChange={(e) => updateSubtaskRow(i, "due", e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="td-subtask-row__remove"
                    onClick={() => removeSubtaskRow(i)}
                    aria-label="Remove subtask"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline-secondary" size="sm" className="mt-2" onClick={addSubtaskRow}>
              + Add subtask
            </Button>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button style={{ background: "var(--color-primary)", border: "none" }} onClick={handleSave}>Save Task</Button>
        </Modal.Footer>
      </Modal>

      {toast && <div className="tm-toast" style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", background: "#1a0d10", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: "0.65rem", zIndex: 9999, fontWeight: 600 }}>{toast}</div>}

    </div>
  );
}
