import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { getAccessToken } from "../service/tokenService";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/NotificationsDashboard.scss";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function BigCalendar({ events = [] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prev() {
    month === 0
      ? (setMonth(11), setYear((y) => y - 1))
      : setMonth((m) => m - 1);
  }
  function next() {
    month === 11
      ? (setMonth(0), setYear((y) => y + 1))
      : setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  function eventsOnDay(day) {
    return events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date + "T00:00:00");
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  return (
    <div className="nd-big-cal">
      <div className="nd-big-cal__header">
        <div className="nd-big-cal__nav">
          <button onClick={prev}>‹</button>
          <span className="nd-big-cal__month">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={next}>›</button>
        </div>
        <span className="nd-big-cal__legend">
          Important Deadlines Highlighted
        </span>
      </div>
      <div className="nd-big-cal__grid">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="nd-big-cal__dh">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day)
            return (
              <div
                key={`e-${i}`}
                className="nd-big-cal__cell nd-big-cal__cell--empty"
              />
            );
          const isToday = isCurrentMonth && day === today.getDate();
          const dayEvents = eventsOnDay(day);
          return (
            <div
              key={day}
              className={[
                "nd-big-cal__cell",
                isToday ? "nd-big-cal__cell--today" : "",
                dayEvents.length ? "nd-big-cal__cell--event" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="nd-big-cal__day-num">{day}</span>
              {dayEvents.map((ev, idx) => (
                <span
                  key={idx}
                  className="nd-big-cal__event-pill"
                  title={ev.label}
                >
                  {ev.label.length > 14
                    ? ev.label.slice(0, 13) + "…"
                    : ev.label}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationsDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    notifications,
    quickLinks,
    calendarEvents,
    apiNotifs,
    markRead,
    markAllRead,
  } = useContext(NotificationsContext);

  const [showSync, setShowSync] = useState(false);
  const [syncEmail, setSyncEmail] = useState(user?.email ?? "");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncSaving, setSyncSaving] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const unread =
    notifications.length + (apiNotifs?.filter((n) => !n.is_read).length ?? 0);

  async function handleSaveSync() {
    if (!syncEmail || !syncEnabled) return;
    setSyncSaving(true);
    setSyncMsg(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`${BASE}/notifications/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: syncEmail,
          title: "Email Notifications Enabled",
          description:
            "You have successfully enabled email notifications on SettleCAN. You will receive reminders for your upcoming deadlines.",
        }),
      });
      const data = await res.json();
      setSyncMsg(
        data.success
          ? { ok: true, text: "✅ Confirmation email sent!" }
          : { ok: false, text: data.message ?? "Failed to send email." },
      );
    } catch {
      setSyncMsg({ ok: false, text: "Could not reach server." });
    } finally {
      setSyncSaving(false);
    }
  }

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
          <button
            className="nd2__action"
            onClick={() => navigate("/notification-settings")}
          >
            Settings
          </button>
        </div>
        <div className="nd2__welcome">
          Welcome{user?.name ? `, ${user.name}` : ""} &mdash;
          <button
            className="nd2__logout"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* ── User reminder cards ── */}
      {notifications.length === 0 ? (
        <div className="nd2__empty">
          <p>No reminders yet.</p>
          <p>
            Go to{" "}
            <button
              className="nd2__link"
              onClick={() => navigate("/notification-settings")}
            >
              Settings
            </button>{" "}
            to add deadlines.
          </p>
        </div>
      ) : (
        <div className="nd2__cards">
          {notifications.map((n) => (
            <div key={n.id} className={`nd2__card nd2__card--${n.urgency}`}>
              <h3 className="nd2__card-title">{n.title}</h3>
              <p className="nd2__card-desc">{n.description}</p>
              <Link to={n.guideUrl} className="nd2__card-btn">
                {n.cta}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── System / admin notifications ── */}
      {apiNotifs?.length > 0 && (
        <div className="nd2__section">
          <div className="nd2__section-header">
            <h4 className="nd2__section-title">System Notifications</h4>
            {apiNotifs.some((n) => !n.is_read) && (
              <button className="nd2__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="nd2__cards">
            {apiNotifs.map((n) => (
              <div
                key={n.notification_id}
                className={`nd2__card nd2__card--normal ${n.is_read ? "nd2__card--read" : ""}`}
              >
                <h3 className="nd2__card-title">{n.message}</h3>
                <p
                  className="nd2__card-desc"
                  style={{ fontSize: "0.78rem", color: "#888" }}
                >
                  {new Date(n.created_at).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {!n.is_read && (
                  <button
                    className="nd2__card-btn"
                    onClick={() => markRead(n.notification_id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
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
                <Link to={l.url} className="nd2__link-item">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* ── Sync modal ── */}
      {showSync && (
        <div className="nd2__overlay" onClick={() => setShowSync(false)}>
          <div className="nd2__modal" onClick={(e) => e.stopPropagation()}>
            <h3>Sync Calendar Notifications</h3>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={syncEmail}
              onChange={(e) => setSyncEmail(e.target.value)}
            />
            <label className="nd2__modal-toggle">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
              />{" "}
              Enable email notifications
            </label>
            {syncMsg && (
              <p
                style={{
                  fontSize: "0.85rem",
                  marginTop: "0.4rem",
                  color: syncMsg.ok ? "#15803d" : "#b91c1c",
                }}
              >
                {syncMsg.text}
              </p>
            )}
            <div className="nd2__modal-actions">
              <button
                className="nd2__modal-save"
                onClick={handleSaveSync}
                disabled={syncSaving || !syncEnabled}
              >
                {syncSaving ? "Sending…" : "Save"}
              </button>
              <button
                className="nd2__modal-cancel"
                onClick={() => setShowSync(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
