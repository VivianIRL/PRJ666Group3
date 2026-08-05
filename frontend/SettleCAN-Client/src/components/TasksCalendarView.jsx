// TasksCalendarView.jsx — the one shared calendar component in the app.
// Used both embedded in My Tasks and on the standalone /calendar page.
import { useState } from "react";
import "../scss/TasksCalendarView.scss";

const WEEK_DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// "In Progress" matches $in-progress in scss/_variables.scss and
// IN_PROGRESS_COLOR in TasksDashboard.jsx — one color for that status
// everywhere it appears (checkbox, badge, calendar pill, detail card).
const STATUS_COLOR = {
  "Completed":   "#27ae60",
  "In Progress": "#f97316",
  "Pending":     "var(--color-primary)",
  "Document":    "#2563eb",
};

// Documents don't have a task status — plot them as pseudo-tasks so the
// month/week grids can render tasks and document expiries together.
function documentsAsEvents(documents = []) {
  return documents
    .filter((d) => d.expiryDate)
    .map((d) => ({
      user_task_id: `doc-${d.id}`,
      title: d.name,
      category: d.category ?? "Document",
      status: "Document",
      due_date: d.expiryDate,
      kind: "document",
    }));
}

// ── Month/Year picker — jump directly to any month/year, or step one at a
// time with the flanking arrows. ────────────────────────────────────────────
function MonthYearPicker({ year, month, onChange, onPrev, onNext }) {
  const yearOptions = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i);
  return (
    <div className="tasks-cal__picker">
      <button className="tasks-cal__nav-btn" onClick={onPrev} aria-label="Previous month">‹</button>
      <select
        className="tasks-cal__picker-select"
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        aria-label="Jump to month"
      >
        {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select
        className="tasks-cal__picker-select"
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        aria-label="Jump to year"
      >
        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <button className="tasks-cal__nav-btn" onClick={onNext} aria-label="Next month">›</button>
    </div>
  );
}

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
        <button className="tasks-cal__nav-btn" onClick={prevWeek} aria-label="Previous week">&#8249;</button>
        <div className="tasks-cal__nav-center">
          <span className="tasks-cal__month">{startLabel} – {endLabel}</span>
          <button className="tasks-cal__today-link" onClick={goThisWeek}>Today</button>
        </div>
        <button className="tasks-cal__nav-btn" onClick={nextWeek} aria-label="Next week">&#8250;</button>
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
                    style={{ borderLeft: `3px solid ${STATUS_COLOR[t.status] ?? "var(--color-primary)"}` }}
                  >
                    <span className="tasks-cal__week-pill-cat">{t.category}</span>
                    <span className="tasks-cal__week-pill-title">{t.title}</span>
                    {onStatusChange && t.status !== "Completed" && t.kind !== "document" && (
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

  function jumpTo(newYear, newMonth) { setYear(newYear); setMonth(newMonth); setSelected(null); }
  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); } else { setMonth(month - 1); }
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); } else { setMonth(month + 1); }
    setSelected(null);
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); }

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
        <MonthYearPicker year={year} month={month} onChange={jumpTo} onPrev={prevMonth} onNext={nextMonth} />
        <button className="tasks-cal__today-link" onClick={goToday}>Today</button>
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
                    style={{ background: STATUS_COLOR[t.status] ?? "var(--color-primary)" }}
                    title={t.title}
                  >
                    {t.kind === "document" ? "📄 " : ""}{t.title}
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
                <span className="tasks-cal__detail-dot" style={{ background: STATUS_COLOR[t.status] ?? "var(--color-primary)" }} />
                <div>
                  <span className="tasks-cal__detail-cat">{t.category}</span>
                  <span className="tasks-cal__detail-name">{t.title}</span>
                </div>
              </div>
              {onStatusChange && t.status !== "Completed" && t.kind !== "document" && (
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
// `embedded` caps the component's width at 40% of its container (per the
// design spec) — used when this calendar sits alongside other content (e.g.
// the My Tasks sidebar). The standalone /calendar page omits it and takes
// the full width of its own, dedicated container instead.
export default function TasksCalendarView({ tasks = [], documents = [], onStatusChange, embedded = false }) {
  const [view, setView] = useState("month");
  const events = [...tasks, ...documentsAsEvents(documents)];

  const guardedOnStatusChange = onStatusChange
    ? (id, ...args) => { if (String(id).startsWith("doc-")) return; onStatusChange(id, ...args); }
    : undefined;

  return (
    <div className={`tasks-cal ${embedded ? "tasks-cal--embedded" : ""}`}>
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
        ? <MonthView tasks={events} onStatusChange={guardedOnStatusChange} />
        : <WeekView  tasks={events} onStatusChange={guardedOnStatusChange} />
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
