// TaskTimeline.jsx
// Vertical timeline of user_tasks sorted by due_date.
// Props:
//   tasks: array of { user_task_id, title, description, category, status, due_date, custom_note }
//   onStatusChange: (user_task_id, newStatus) => void  (optional)

import { Link } from "react-router-dom";
import "../scss/TaskTimeline.scss";

const STATUS_META = {
  Pending:     { label: "Pending",     cls: "tl-status--pending"     },
  "In Progress": { label: "In Progress", cls: "tl-status--inprogress" },
  Completed:   { label: "Completed",  cls: "tl-status--completed"   },
};

const CATEGORY_ICONS = {
  "Banking":      "🏦",
  "Health":       "🏥",
  "Housing":      "🏠",
  "Immigration":  "📋",
  "Education":    "🎓",
  "Employment":   "💼",
  "Legal":        "⚖️",
  "Tax":          "🧾",
};

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function TaskTimeline({ tasks = [], onStatusChange }) {
  const sorted = [...tasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (sorted.length === 0) {
    return (
      <div className="task-timeline task-timeline--empty">
        <p>No tasks yet. Add tasks in Settings to see your timeline.</p>
      </div>
    );
  }

  return (
    <div className="task-timeline">
      <div className="tl-line" />

      {sorted.map((task, idx) => {
        const meta  = STATUS_META[task.status] ?? STATUS_META.Pending;
        const days  = daysUntil(task.due_date);
        const icon  = CATEGORY_ICONS[task.category] ?? "📌";
        const isLast = idx === sorted.length - 1;

        let urgencyClass = "";
        if (task.status !== "Completed") {
          if (days !== null && days <= 0)  urgencyClass = "tl-node--overdue";
          else if (days !== null && days <= 7) urgencyClass = "tl-node--soon";
        }

        return (
          <div key={task.user_task_id} className={`tl-node ${urgencyClass} ${isLast ? "tl-node--last" : ""}`}>
            {/* dot */}
            <div className={`tl-dot tl-dot--${task.status === "Completed" ? "done" : task.status === "In Progress" ? "active" : "pending"}`} />

            {/* card */}
            <div className="tl-card">
              <div className="tl-card__header">
                <span className="tl-icon">{icon}</span>
                <div className="tl-card__titles">
                  <span className="tl-category">{task.category}</span>
                  <h4 className="tl-title">{task.title}</h4>
                </div>
                <span className={`tl-status ${meta.cls}`}>{meta.label}</span>
              </div>

              {task.description && (
                <p className="tl-desc">{task.description}</p>
              )}

              <div className="tl-card__footer">
                <span className="tl-date">
                  📅 {formatDate(task.due_date)}
                  {days !== null && task.status !== "Completed" && (
                    <em className={days <= 0 ? "tl-overdue" : days <= 7 ? "tl-soon" : ""}>
                      {days <= 0
                        ? ` — ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                        : ` — ${days} day${days !== 1 ? "s" : ""} left`}
                    </em>
                  )}
                </span>

                {(task.guideUrl || (onStatusChange && task.status !== "Completed")) && (
                <div className="tl-actions">
                  {task.guideUrl && (
                    <Link to={task.guideUrl} className="tl-btn tl-btn--guide">
                      📖 Guide
                    </Link>
                  )}
                  {onStatusChange && task.status !== "Completed" && (
                    <>
                      {task.status === "Pending" && (
                        <button
                          className="tl-btn tl-btn--start"
                          onClick={() => onStatusChange(task.user_task_id, "In Progress")}
                        >
                          Start
                        </button>
                      )}
                      <button
                        className="tl-btn tl-btn--done"
                        onClick={() => onStatusChange(task.user_task_id, "Completed")}
                      >
                        Mark Done
                      </button>
                    </>
                  )}
                </div>
                )}
              </div>

              {task.custom_note && (
                <div className="tl-note">📝 {task.custom_note}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
