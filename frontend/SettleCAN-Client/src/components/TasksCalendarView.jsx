// TasksCalendarView.jsx — month + week calendar views for task due dates
import { useState } from "react";
import "../scss/TasksCalendarView.scss";

const WEEK_DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_COLOR = {
  "Completed":   "#27ae60",
  "In Progress": "#2563eb",
  "Pending":     "#8E0002",
};

// ── Week view ─────────────────────────────────────────────────────────────────
function WeekView({ tasks = [], onStatusChange }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  });

  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  }
  function goThisWeek() {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = days[6];

  function tasksOnDay(date) {
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + "T00:00:00");
      return d.toDateString() === date.toDateString();
    });
  }

  const startLabel = `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}`;
  const endLabel   = `${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  const isThisWeek = today >= weekStart && today <= new Date(weekEnd.getTime() + 86399999);
  const hasAny     = days.some(d => tasksOnDay(d).length > 0);

  return (
    <div className="tasks-cal__week">
      <div className="tasks-cal__nav">
        <button className="tasks-cal__nav-btn" onClick={prevWeek}>&#8249;</button>
        <div className="tasks-cal__nav-center">
          <span className="tasks-cal__month">{startLabel} – {endLabel}</span>
          <button className="tasks-cal__today-btn" onClick={goThisWeek}>This week</button>
        </div>
        <button className="tasks-cal__nav-btn" onClick={nextWeek}>&#8250;</button>
      </div>

      <div className="tasks-cal__week-grid">
        {days.map((day, i) => {
          const isToday  = day.toDateString() === today.toDateString();
          const dayTasks = tasksOnDay(day);
          return (
            <div
              key={i}
              className={`tasks-cal__week-col${isToday ? " tasks-cal__week-col--today" : ""}`}
            >
              <div className="tasks-cal__week-header">
                <span className="tasks-cal__week-dow">{WEEK_DAYS[i]}</span>
                <span className={`tasks-cal__week-date${isToday ? " tasks-cal__week-date--today" : ""}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="tasks-cal__week-tasks">
                {dayTasks.length === 0 ? (
                  <span className="tasks-cal__week-empty">—</span>
                ) : dayTasks.map(t => (
                  <div
                    key={t.user_task_id}
                    className="tasks-cal__week-pill"
                    style={{ borderLeft: `3px solid ${STATUS_COLOR[t.status] ?? "#8E0002"}` }}
                  >
                    <span className="tasks-cal__week-pill-cat">{t.category}</span>
                    <span className="tasks-cal__week-pill-title">{t.title}</span>
                    {onStatusChange && t.status !== "Completed" && (
                      <button
                        className="tasks-cal__week-done"
                        onClick={() => onStatusChange(t.user_task_id, "Completed")}
                        title="Mark done"
                      >✓</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!hasAny && (
        <p className="tasks-cal__week-no-tasks">
          {isThisWeek ? "No tasks due this week." : "No tasks due that week."}
        </p>
      )}
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────────────────────
function MonthView({ tasks = [], onStatusChange }) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  function prevMonth() { month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1); }
  function nextMonth() { month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1); }
  function goToday()   { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function tasksOnDay(day) {
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function handleDayClick(day) {
    const dt = tasksOnDay(day);
    setSelected(dt.length ? { day, tasks: dt } : null);
  }

  return (
    <>
      <div className="tasks-cal__nav">
        <button className="tasks-cal__nav-btn" onClick={prevMonth}>&#8249;</button>
        <div className="tasks-cal__nav-center">
          <span className="tasks-cal__month">{MONTH_NAMES[month]} {year}</span>
          <button className="tasks-cal__today-btn" onClick={goToday}>Today</button>
        </div>
        <button className="tasks-cal__nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>

      <div className="tasks-cal__grid">
        {WEEK_DAYS.map(d => <div key={d} className="tasks-cal__dheader">{d}</div>)}
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
                {dayTasks.length > 2 && <span className="tasks-cal__event-more">+{dayTasks.length - 2} more</span>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="tasks-cal__detail">
          <div className="tasks-cal__detail-header">
            <span className="tasks-cal__detail-title">{MONTH_NAMES[month]} {selected.day}, {year}</span>
            <button className="tasks-cal__detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          {selected.tasks.map(t => (
            <div key={t.user_task_id} className="tasks-cal__detail-task">
              <div className="tasks-cal__detail-task-left">
                <span className="tasks-cal__detail-dot" style={{ background: STATUS_COLOR[t.status] ?? "#8E0002" }} />
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
    </>
  );
}

// ── Root with Month / Week toggle ─────────────────────────────────────────────
export default function TasksCalendarView({ tasks = [], onStatusChange }) {
  const [view, setView] = useState("month");

  return (
    <div className="tasks-cal">
      <div className="tasks-cal__view-toggle">
        <button
          className={`tasks-cal__view-btn${view === "month" ? " tasks-cal__view-btn--active" : ""}`}
          onClick={() => setView("month")}
        >
          Month
        </button>
        <button
          className={`tasks-cal__view-btn${view === "week" ? " tasks-cal__view-btn--active" : ""}`}
          onClick={() => setView("week")}
        >
          Week
        </button>
      </div>

      {view === "month"
        ? <MonthView tasks={tasks} onStatusChange={onStatusChange} />
        : <WeekView  tasks={tasks} onStatusChange={onStatusChange} />
      }

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
