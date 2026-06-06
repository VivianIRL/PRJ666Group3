// GettingStarted.jsx — post-registration onboarding page
// Shows a clear numbered checklist so new users know exactly what to do first.
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import "../scss/GettingStarted.scss";

// Priority tasks tailored to immigration status
const PRIORITY_TASKS = {
  "International Student": [
    { label: "Get your Social Insurance Number (SIN)", path: "/guides/sin" },
    { label: "Register for provincial health card", path: "/guides/health-card" },
    { label: "Open a Canadian bank account", path: "/guides/bank-account" },
    { label: "Check your study permit expiry date", path: "/document-alerts" },
    { label: "Find a family doctor or walk-in clinic", path: "/info/health" },
  ],
  "Work Permit Holder": [
    { label: "Verify your work permit conditions", path: "/work-eligibility" },
    { label: "Apply for SIN if you don't have one", path: "/guides/sin" },
    { label: "Register for provincial health coverage", path: "/guides/health-card" },
    { label: "Check your permit expiry & renewal timeline", path: "/guides/permit-renewal" },
    { label: "Explore Express Entry / PR pathways", path: "/pr-pathway" },
  ],
  "Permanent Resident": [
    { label: "Apply for your PR card", path: "/compliance" },
    { label: "Register for provincial health coverage", path: "/guides/health-card" },
    { label: "Get your SIN updated to permanent status", path: "/guides/sin" },
    { label: "File your taxes as a Canadian resident", path: "/guides/tax-return" },
    { label: "Research citizenship eligibility timeline", path: "/pr-pathway" },
  ],
  default: [
    { label: "Get your Social Insurance Number (SIN)", path: "/guides/sin" },
    { label: "Register for provincial health coverage", path: "/guides/health-card" },
    { label: "Open a Canadian bank account", path: "/guides/bank-account" },
    { label: "Set up your settlement task list", path: "/tasks" },
    { label: "Explore community resources", path: "/community" },
  ],
};

const STEPS = [
  {
    num: "1",
    emoji: "🗺️",
    title: "Review your personalised tasks",
    desc: "We've pre-loaded the most important settlement tasks based on your immigration status. Check them off as you go.",
    cta: "Open My Tasks",
    path: "/tasks",
  },
  {
    num: "2",
    emoji: "📚",
    title: "Read step-by-step guides",
    desc: "SIN application, health card, bank account, permit renewals — plain-language guides for each.",
    cta: "Browse Guides",
    path: "/features",
  },
  {
    num: "3",
    emoji: "📄",
    title: "Track your documents",
    desc: "Set reminders for expiring permits and documents so nothing slips through the cracks.",
    cta: "Document Alerts",
    path: "/document-alerts",
  },
  {
    num: "4",
    emoji: "💬",
    title: "Connect with the community",
    desc: "Ask questions, share tips, and get answers from other newcomers who've been in your shoes.",
    cta: "Join Community",
    path: "/community",
  },
];

export default function GettingStarted() {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();
  const name      = user?.name;
  const status    = user?.immigrationStatus ?? "default";
  const tasks     = PRIORITY_TASKS[status] ?? PRIORITY_TASKS.default;

  return (
    <div className="gs-page">

      {/* ── Welcome header ──────────────────────────────────────────────────── */}
      <div className="gs-hero">
        <span className="gs-hero__flag" aria-hidden>🍁</span>
        <h1 className="gs-hero__title">
          Welcome{name ? `, ${name}` : ""}!
        </h1>
        <p className="gs-hero__sub">
          SettleCAN helps you navigate life in Canada — step by step.
        </p>
        {status && status !== "default" && (
          <span className="gs-status-badge">{status}</span>
        )}
      </div>

      {/* ── What SettleCAN does ──────────────────────────────────────────────── */}
      <div className="gs-explainer">
        <p className="gs-explainer__intro">
          Moving to a new country comes with a lot of paperwork, deadlines, and decisions.
          SettleCAN organises everything in one place so nothing falls through the cracks.
        </p>
        <div className="gs-explainer__pills">
          <span>📋 Personalised checklists</span>
          <span>⏰ Permit & document reminders</span>
          <span>📚 Step-by-step guides</span>
          <span>🍁 PR & immigration pathways</span>
          <span>💬 Community support</span>
        </div>
      </div>

      {/* ── Priority checklist ──────────────────────────────────────────────── */}
      <div className="gs-priority">
        <div className="gs-priority__head">
          <h2 className="gs-priority__title">Your top priorities right now</h2>
          <span className="gs-priority__note">Tap any item to learn more</span>
        </div>
        <ol className="gs-priority__list">
          {tasks.map((task, i) => (
            <li key={i} className="gs-priority__item">
              <span className="gs-priority__num">{i + 1}</span>
              <Link to={task.path} className="gs-priority__link">{task.label}</Link>
            </li>
          ))}
        </ol>
      </div>

      {/* ── 4-step guide cards ──────────────────────────────────────────────── */}
      <div className="gs-steps-section">
        <h2 className="gs-steps-section__title">How SettleCAN helps you</h2>
        <div className="gs-steps">
          {STEPS.map(step => (
            <div key={step.num} className="gs-step">
              <div className="gs-step__header">
                <span className="gs-step__num">Step {step.num}</span>
                <span className="gs-step__emoji" aria-hidden>{step.emoji}</span>
              </div>
              <h3 className="gs-step__title">{step.title}</h3>
              <p className="gs-step__desc">{step.desc}</p>
              <button className="gs-step__btn" onClick={() => navigate(step.path)}>
                {step.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skip ────────────────────────────────────────────────────────────── */}
      <button className="gs-skip" onClick={() => navigate("/dashboard")}>
        Skip — go to my dashboard
      </button>
    </div>
  );
}
