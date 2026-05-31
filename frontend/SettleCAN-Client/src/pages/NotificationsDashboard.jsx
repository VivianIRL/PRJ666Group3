import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/NotificationsDashboard.scss";

// ── Inline calendar (large grid matching prototype) ───────────────────────────
const WEEK_DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];

function BigCalendar({ events = [] }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];

  function eventsOnDay(day) {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="nd-big-cal">
      {/* Calendar header */}
      <div className="nd-big-cal__header">
        <div className="nd-big-cal__nav">
          <button onClick={prev}>‹</button>
          <span className="nd-big-cal__month">{MONTH_NAMES[month]} {year}</span>
          <button onClick={next}>›</button>
        </div>
        <span className="nd-big-cal__legend">Important Deadlines Highlighted</span>
      </div>

      {/* Day-of-week headers */}
      <div className="nd-big-cal__grid">
        {WEEK_DAYS.map(d => (
          <div key={d} className="nd-big-cal__dh">{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="nd-big-cal__cell nd-big-cal__cell--empty" />;

          const isToday   = isCurrentMonth && day === today.getDate();
          const dayEvents = eventsOnDay(day);
          const hasEvent  = dayEvents.length > 0;

          return (
            <div
              key={day}
              className={[
                "nd-big-cal__cell",
                isToday   ? "nd-big-cal__cell--today"  : "",
                hasEvent  ? "nd-big-cal__cell--event"  : "",
              ].filter(Boolean).join(" ")}
            >
              <span className="nd-big-cal__day-num">{day}</span>
              {dayEvents.map((ev, idx) => (
                <span key={idx} className="nd-big-cal__event-pill" title={ev.label}>
                  {ev.label.length > 14 ? ev.label.slice(0, 13) + "…" : ev.label}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function NotificationsDashboard() {
  const navigate     = useNavigate();
  const { user }     = useContext(AuthContext);
  const { notifications, quickLinks, calendarEvents } =
    useContext(NotificationsContext);

  const [showSync,  setShowSync]  = useState(false);
  const [syncEmail, setSyncEmail] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);

  const unread = notifications.length;

  return (
    <div className="nd2">

      {/* ── Top bar ── */}
      <div className="nd2__topbar">
        <div className="nd2__actions">
          <button className="nd2__action nd2__action--active">
            Email Notifications
            {unread > 0 && <span className="nd2__badge">{unread}</span>}
          </button>
          <button className="nd2__action" onClick={() => setShowSync(true)}>
            Sync Calendar
          </button>
          <button className="nd2__action" onClick={() => navigate("/notification-settings")}>
            Settings
          </button>
        </div>

        <div className="nd2__welcome">
          Welcome{user?.name ? `, ${user.name}` : ""} &mdash;
          <button className="nd2__logout" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>

      {/* ── Notification cards ── */}
      {notifications.length === 0 ? (
        <div className="nd2__empty">
          <p>No reminders yet.</p>
          <p>Go to <button className="nd2__link" onClick={() => navigate("/notification-settings")}>Settings</button> to add deadlines and reminders — they'll appear here as countdown cards.</p>
        </div>
      ) : (
        <div className="nd2__cards">
          {notifications.map(n => (
            <div key={n.id} className={`nd2__card nd2__card--${n.urgency}`}>
              <h3 className="nd2__card-title">{n.title}</h3>
              <p className="nd2__card-desc">{n.description}</p>
              {/* CTA navigates to the step-by-step guide for this task */}
              <Link to={n.guideUrl} className="nd2__card-btn">{n.cta}</Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Calendar + Quick Links ── */}
      <div className="nd2__bottom">
        <BigCalendar events={calendarEvents} />

        <aside className="nd2__links">
          <h4 className="nd2__links-title">Quick Links</h4>
          <ul className="nd2__links-list">
            {quickLinks.map((l, i) => (
              <li key={i}>
                <Link to={l.url} className="nd2__link-item">{l.label}</Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* ── Sync modal ── */}
      {showSync && (
        <div className="nd2__overlay" onClick={() => setShowSync(false)}>
          <div className="nd2__modal" onClick={e => e.stopPropagation()}>
            <h3>Sync Calendar Notifications</h3>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={syncEmail}
              onChange={e => setSyncEmail(e.target.value)}
            />
            <label className="nd2__modal-toggle">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={e => setSyncEnabled(e.target.checked)}
              />
              Enable email notifications
            </label>
            <div className="nd2__modal-actions">
              <button className="nd2__modal-save">Save</button>
              <button className="nd2__modal-cancel" onClick={() => setShowSync(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
