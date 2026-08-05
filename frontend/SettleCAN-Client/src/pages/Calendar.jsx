// Calendar.jsx — the single, full-page calendar. Reachable from the nav bar
// (see AppSidebar.jsx). Reuses TasksCalendarView, the same component
// embedded (and capped to 40% width) inside My Tasks, so there is exactly
// one calendar implementation in the app.
import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../state/AuthContext";
import { fetchTaskTree, updateTaskNode } from "../service/taskService";
import { DEFAULT_DOCS, loadSavedDates } from "../data/documentAlerts";
import TasksCalendarView from "../components/TasksCalendarView";
import "../scss/TasksDashboard.scss";

function flatten(nodes) {
  const out = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

export default function CalendarPage() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const tree = await fetchTaskTree();
      setTasks(Array.isArray(tree) ? flatten(tree) : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const saved = loadSavedDates(user?.id);
    setDocuments(
      DEFAULT_DOCS.map((d) => ({ ...d, expiryDate: saved[d.id] ?? d.expiryDate })).filter((d) => d.expiryDate)
    );
  }, [user?.id]);

  async function handleStatusChange(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "COMPLETED" } : t)));
    try {
      const updatedTree = await updateTaskNode(id, { status: "COMPLETED" });
      if (Array.isArray(updatedTree)) setTasks(flatten(updatedTree));
    } catch { /* keep optimistic */ }
  }

  if (loading) return <div className="td-loading">Loading your schedule…</div>;

  if (loadError) {
    return (
      <div className="td-page">
        <div className="td-empty">
          Couldn't load your schedule. Check your connection and try again.
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
          <h1 className="td-title">Calendar</h1>
          <p className="td-sub">All your task deadlines and document expiry dates in one place.</p>
        </div>
      </div>

      <TasksCalendarView
        tasks={tasks
          .filter((t) => t.dueDate)
          .map((t) => ({
            user_task_id: t.id,
            title: t.title,
            category: t.parentId ? "Subtask" : "Task",
            status: t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In Progress" : "Pending",
            due_date: t.dueDate,
          }))}
        documents={documents}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
