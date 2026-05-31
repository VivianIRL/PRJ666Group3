// TaskChecklist.jsx
// Expandable task cards with checklist sub-steps and a progress bar.
// Props:
//   tasks: array of {
//     user_task_id, title, description, category, status, due_date,
//     checklist: [{ checklist_id, item_description, is_required, checked }]
//   }
//   onCheckItem: (user_task_id, checklist_id, checked) => void
//   onTaskComplete: (user_task_id) => void  (optional)

import { useState } from "react";
import { Link } from "react-router-dom";
import "../scss/TaskChecklist.scss";

function ProgressBar({ value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="tcl-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="tcl-progress__bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TaskChecklist({ tasks = [], onCheckItem, onTaskComplete }) {
  const [openIds, setOpenIds] = useState(() => new Set(tasks.slice(0, 2).map(t => t.user_task_id)));

  function toggle(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (tasks.length === 0) {
    return (
      <div className="task-checklist task-checklist--empty">
        <p>No tasks yet. Add tasks in Settings to see your checklist.</p>
      </div>
    );
  }

  return (
    <div className="task-checklist">
      {tasks.map(task => {
        const checklist = task.checklist ?? [];
        const total     = checklist.length;
        const done      = checklist.filter(i => i.checked).length;
        const progress  = total > 0 ? done / total : 0;
        const isOpen    = openIds.has(task.user_task_id);
        const allDone   = total > 0 && done === total;

        return (
          <div key={task.user_task_id} className={`tcl-card ${task.status === "Completed" ? "tcl-card--complete" : ""}`}>

            {/* Header (always visible) */}
            <button
              className="tcl-card__header"
              onClick={() => toggle(task.user_task_id)}
              aria-expanded={isOpen}
            >
              <div className="tcl-card__left">
                <span className={`tcl-status-dot tcl-status-dot--${task.status === "Completed" ? "done" : task.status === "In Progress" ? "active" : "pending"}`} />
                <div>
                  <span className="tcl-cat">{task.category}</span>
                  <h4 className="tcl-title">{task.title}</h4>
                </div>
              </div>

              <div className="tcl-card__right">
                {total > 0 && (
                  <span className="tcl-count">{done}/{total}</span>
                )}
                <span className={`tcl-chevron ${isOpen ? "tcl-chevron--open" : ""}`}>▾</span>
              </div>
            </button>

            {/* Progress bar (always visible if there are items) */}
            {total > 0 && <ProgressBar value={progress} />}

            {/* Expanded body */}
            {isOpen && (
              <div className="tcl-body">
                <div className="tcl-body__top">
                  {task.description && (
                    <p className="tcl-desc">{task.description}</p>
                  )}
                  {/* View step-by-step guide for this task */}
                  {task.guideUrl && (
                    <Link to={task.guideUrl} className="tcl-guide-link">
                      📖 View step-by-step guide →
                    </Link>
                  )}
                </div>

                {checklist.length === 0 && (
                  <p className="tcl-empty-items">No sub-steps for this task.</p>
                )}

                <ul className="tcl-items">
                  {checklist.map(item => (
                    <li
                      key={item.checklist_id}
                      className={`tcl-item ${item.checked ? "tcl-item--checked" : ""}`}
                    >
                      <label className="tcl-item__label">
                        <input
                          type="checkbox"
                          checked={!!item.checked}
                          onChange={e => onCheckItem?.(task.user_task_id, item.checklist_id, e.target.checked)}
                          className="tcl-checkbox"
                        />
                        <span className="tcl-item__text">{item.item_description}</span>
                        {item.is_required && (
                          <span className="tcl-required" title="Required">*</span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>

                {allDone && task.status !== "Completed" && onTaskComplete && (
                  <button
                    className="tcl-complete-btn"
                    onClick={() => onTaskComplete(task.user_task_id)}
                  >
                    ✓ Mark Task Complete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
