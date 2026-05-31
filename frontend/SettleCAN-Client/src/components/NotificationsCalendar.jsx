import { useState } from "react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function NotificationsCalendar({ events = [] }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth     = new Date(year, month + 1, 0).getDate();

  // leading empty slots + actual day numbers
  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Index events by day number for this month/year
  function eventsOnDay(day) {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="nd-calendar">
      {/* Month navigation */}
      <div className="cal-nav">
        <button className="cal-nav__btn" onClick={prevMonth} aria-label="Previous month">&#8249;</button>
        <span className="cal-nav__label">{MONTH_NAMES[month]} {year}</span>
        <button className="cal-nav__btn" onClick={nextMonth} aria-label="Next month">&#8250;</button>
      </div>

      {/* Day-of-week headers */}
      <div className="calendar-grid">
        {WEEK_DAYS.map(d => (
          <div key={d} className="day-header">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="day day--empty" />;

          const isToday = isCurrentMonth && day === today.getDate();
          const dayEvents = eventsOnDay(day);
          const topUrgency = dayEvents.find(e => e.urgency === "urgent")
            ? "urgent"
            : dayEvents.find(e => e.urgency === "warning")
            ? "warning"
            : dayEvents.length ? "normal" : null;

          return (
            <div
              key={day}
              className={[
                "day",
                isToday ? "day--today" : "",
                topUrgency ? `highlight-${topUrgency}` : "",
              ].filter(Boolean).join(" ")}
              title={dayEvents.map(e => e.label).join(", ") || undefined}
            >
              <span className="day__num">{day}</span>
              {dayEvents.length > 0 && (
                <span className="day__dots">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <span key={idx} className={`day__dot day__dot--${e.urgency}`} />
                  ))}
                </span>
              )}
              {dayEvents.length > 0 && (
                <span className="day__label">{dayEvents[0].label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--urgent"/>Urgent</span>
        <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--warning"/>Soon</span>
        <span className="cal-legend__item"><span className="cal-legend__dot cal-legend__dot--normal"/>Upcoming</span>
      </div>
    </div>
  );
}
