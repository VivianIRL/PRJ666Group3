// GettingStarted.jsx — post-registration onboarding page
// Shown once after the user completes sign-up.
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import "../scss/GettingStarted.scss";

const ACTIONS = [
  {
    path: "/dashboard",
    label: "Set up your profile",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="22" r="12" />
        <path d="M8 56c0-13.3 10.7-24 24-24s24 10.7 24 24" />
      </svg>
    ),
  },
  {
    path: "/tasks",
    label: "View your timeline",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="12" width="48" height="44" rx="4" />
        <path d="M44 8v8M20 8v8M8 28h48" />
        <path d="M20 40h8M20 50h16" />
      </svg>
    ),
  },
  {
    path: "/tasks",
    label: "View and create tasks",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="24" />
        <path d="M32 20v12M32 44v2" />
      </svg>
    ),
  },
  {
    path: "/notifications-dashboard",
    label: "View your notifications",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 8a18 18 0 0 1 18 18c0 14-6 18-6 18H20s-6-4-6-18A18 18 0 0 1 32 8z" />
        <path d="M26 44a6 6 0 0 0 12 0" />
      </svg>
    ),
  },
  {
    path: "/notification-settings",
    label: "Change your settings",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="8" />
        <path d="M32 8v6M32 50v6M8 32h6M50 32h6M16.1 16.1l4.2 4.2M43.7 43.7l4.2 4.2M16.1 47.9l4.2-4.2M43.7 20.3l4.2-4.2" />
      </svg>
    ),
  },
];

export default function GettingStarted() {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();
  const name      = user?.name;

  return (
    <div className="gs-page">
      {/* Heading */}
      <div className="gs-heading">
        <h1>Let's get started{name ? `, ${name}` : ""}…</h1>
        <p className="gs-sub">Choose where you'd like to begin your settlement journey.</p>
      </div>

      {/* Action banner */}
      <div className="gs-banner">
        {ACTIONS.map((action, i) => (
          <button
            key={i}
            className="gs-card"
            onClick={() => navigate(action.path)}
          >
            <div className="gs-card__icon">{action.icon}</div>
            <span className="gs-card__label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Skip link */}
      <button className="gs-skip" onClick={() => navigate("/dashboard")}>
        Go to my dashboard →
      </button>
    </div>
  );
}
