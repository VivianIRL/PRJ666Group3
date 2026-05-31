// AppSidebar.jsx — persistent sidebar shown on all authenticated pages
// Mini calendar reads events from NotificationsContext; clicking navigates to /notifications-dashboard

import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/AppSidebar.scss";

// ── Mini Calendar ─────────────────────────────────────────────────────────────
const DAYS = ["S","M","T","W","T","F","S"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MiniCalendar({ events = [] }) {
  const navigate = useNavigate();
  const today    = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prev() { month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1); }
  function next() { month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1); }

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];

  function hasEvent(day) {
    return events.some(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="mc-wrap" onClick={() => navigate("/notifications-dashboard")} title="View Notifications Calendar">
      <div className="mc-nav">
        <button onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button onClick={e => { e.stopPropagation(); next(); }}>›</button>
      </div>
      <div className="mc-grid">
        {DAYS.map((d,i) => <div key={i} className="mc-dh">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="mc-cell mc-cell--empty" />;
          const isToday = isCurrentMonth && day === today.getDate();
          const dotted  = hasEvent(day);
          return (
            <div key={day} className={`mc-cell ${isToday ? "mc-cell--today" : ""} ${dotted ? "mc-cell--event" : ""}`}>
              {day}
              {dotted && <span className="mc-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { to: "/dashboard",           icon: "🏠", label: "Dashboard"     },
  { to: "/tasks",               icon: "✅", label: "My Tasks"      },
  { to: "/notifications-dashboard", icon: "🔔", label: "Notifications" },
  { to: "/features",            icon: "🌐", label: "Resources"     },
  { to: "/compliance",          icon: "📋", label: "Compliance"    },
  { to: "/document-alerts",     icon: "⏰", label: "Doc Alerts"    },
  { to: "/housing",             icon: "🏠", label: "Housing"       },
  { to: "/pr-pathway",          icon: "🍁", label: "PR Pathway"    },
];

export default function AppSidebar({ collapsed, onToggle }) {
  const { user } = useContext(AuthContext);
  const notifCtx         = useContext(NotificationsContext);
  const navigate         = useNavigate();
  const unread           = notifCtx?.notifications?.length ?? 0;

  function handleSignOut() { navigate("/logout"); }

  return (
    <aside className={`app-sidebar ${collapsed ? "app-sidebar--collapsed" : ""}`}>

      {/* Collapse toggle only — no logo */}
      <div className="asb-brand">
        <button className="asb-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* User greeting */}
      {!collapsed && user && (
        <div className="asb-user">
          <div className="asb-avatar">{user.name[0]}</div>
          <div>
            <div className="asb-user__name">{user.name}</div>
            <div className="asb-user__status">{user.immigrationStatus}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="asb-nav">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `asb-nav__item ${isActive ? "asb-nav__item--active" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="asb-nav__icon">{item.icon}</span>
            {!collapsed && <span className="asb-nav__label">{item.label}</span>}
            {!collapsed && item.to === "/notifications-dashboard" && unread > 0 && (
              <span className="asb-badge">{unread > 9 ? "9+" : unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mini calendar (hidden when collapsed) */}
      {!collapsed && (
        <div className="asb-calendar-wrap">
          <span className="asb-section-label">📅 Calendar</span>
          <MiniCalendar events={notifCtx?.calendarEvents ?? []} />
        </div>
      )}

      {/* Logout */}
      <div className="asb-bottom">
        {!collapsed && (
          <button className="asb-logout" onClick={handleSignOut}>
            ↩ Sign out
          </button>
        )}
        {collapsed && (
          <button className="asb-logout asb-logout--icon" onClick={handleSignOut} title="Sign out">↩</button>
        )}
      </div>
    </aside>
  );
}
