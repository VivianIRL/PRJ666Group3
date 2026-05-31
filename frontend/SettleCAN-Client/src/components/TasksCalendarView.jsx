// TasksCalendarView.jsx — full monthly calendar for the Tasks sidebar "Calendar" view
// Shows task due_dates as events, with status colour-coding.

import { useState } from "react";
import "../scss/TasksCalendarView.scss";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_COLOR = {
  "Completed":   "#27ae60",
  "In Progress": "#2563eb",
  "Pending":     "#8E0002",
};

export default function TasksCalendarView({ tasks = [], onStatusChange }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // { day, tasks[] }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function tasksOnDay(day) {
    return tasks.filter(t => {
      const d = new Date(t.due_date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function handleDayClick(day) {
    const dayTasks = tasksOnDay(day);
    if (dayTasks.length === 0) { setSelected(null); return; }
    setSelected({ day, tasks: dayTasks });
  }

  return (
    <div className="tasks-cal">
      {/* Nav */}
      <div className="tasks-cal__nav">
        <button className="tasks-cal__nav-btn" onClick={prevMonth}>&#8249;</button>
        <div className="tasks-cal__nav-center">
          <span className="tasks-cal__month">{MONTH_NAMES[month]} {year}</span>
          <button className="tasks-cal__today-btn" onClick={goToday}>Today</button>
        </div>
        <button className="tasks-cal__nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>

      {/* Grid */}
      <div className="tasks-cal__grid">
        {/* Day-of-week headers */}
        {WEEK_DAYS.map(d => (
          <div key={d} className="tasks-cal__dheader">{d}</div>
        ))}

        {/* Cells */}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="tasks-cal__cell tasks-cal__cell--empty" />;

          const isToday    = isCurrentMonth && day === today.getDate();
          const dayTasks   = tasksOnDay(day);
          const isSelected = selected?.day === day;

          return (
            <div
              key={day}
              className={[
                "tasks-cal__cell",
                isToday    ? "tasks-cal__cell--today"    : "",
                isSelected ? "tasks-cal__cell--selected" : "",
                dayTasks.length ? "tasks-cal__cell--has-events" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleDayClick(day)}
            >
              <span className="tasks-cal__day-num">{day}</span>

              {/* Up to 2 event pills visible */}
              <div className="tasks-cal__events">
                {dayTasks.slice(0, 2).map(t => (
                  <span
                    key={t.user_task_id}
                    className="tasks-cal__event-pill"
                    style={{ background: STATUS_COLOR[t.status] ?? "#8E0002" }}
                    title={t.title}
                  >
                    {t.title}
                  </span>
                ))}
                {dayTasks.length > 2 && (
                  <span className="tasks-cal__event-more">+{dayTasks.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail panel */}
      {selected && (
        <div className="tasks-cal__detail">
          <div className="tasks-cal__detail-header">
            <span className="tasks-cal__detail-title">
              {MONTH_NAMES[month]} {selected.day}, {year}
            </span>
            <button className="tasks-cal__detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          {selected.tasks.map(t => (
            <div key={t.user_task_id} className="tasks-cal__detail-task">
              <div className="tasks-cal__detail-task-left">
                <span
                  className="tasks-cal__detail-dot"
                  style={{ background: STATUS_COLOR[t.status] ?? "#8E0002" }}
                />
                <div>
                  <span className="tasks-cal__detail-cat">{t.category}</span>
                  <span className="tasks-cal__detail-name">{t.title}</span>
                </div>
              </div>
              {onStatusChange && t.status !== "Completed" && (
                <button
                  className="tasks-cal__detail-done"
                  onClick={() => { onStatusChange(t.user_task_id, "Completed"); setSelected(null); }}
                >
                  ✓ Done
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="tasks-cal__legend">
        {Object.entries(STATUS_COLOR).map(([label, color]) => (
          <span key={label} className="tasks-cal__legend-item">
            <span className="tasks-cal__legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
