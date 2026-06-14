import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const SECTIONS = [
  {
    icon: "🗺️",
    title: "Getting Started",
    desc: "New to SettleCAN? The Get Started page walks you through what the app does and what to tackle first.",
    link: "/register",
    linkLabel: "Get Started →",
  },
  {
    icon: "✅",
    title: "Settlement Checklist",
    desc: "Your personalised checklist tracks every step of your settlement — from getting your SIN to filing taxes. Items are tailored to your immigration status. You can add your own items too.",
    link: "/register",
    linkLabel: "Open Checklist →",
  },
  {
    icon: "📋",
    title: "My Tasks",
    desc: "Tasks are time-sensitive action items with due dates based on your arrival date. Completing a task here automatically checks the matching item in your Checklist.",
    link: "/register",
    linkLabel: "Open My Tasks →",
  },
  {
    icon: "🔔",
    title: "Notifications & Calendar",
    desc: "The Notifications page shows upcoming deadlines and important reminders. You can enable email notifications to receive reminders directly in your inbox.",
    link: "/register",
    linkLabel: "Open Notifications →",
  },
  {
    icon: "👥",
    title: "Community",
    desc: "Connect with other newcomers, ask questions, and share your experience in the Community section.",
    link: "/register",
    linkLabel: "Join Community →",
  },
  {
    icon: "📚",
    title: "Information Guides",
    desc: "In-depth guides on work permits, health care, language tests, and more. These pages pull from official Canadian government sources.",
    link: "/register",
    linkLabel: "Browse Guides →",
  },
];

const TIPS = [
  { icon: "💡", tip: "Set your arrival date accurately in your profile — task due dates are calculated from it." },
  { icon: "📱", tip: "SettleCAN works on mobile. Bookmark it to your home screen for quick access." },
  { icon: "🔄", tip: "Complete tasks in My Tasks to auto-check matching items in your Checklist — no need to do both manually." },
  { icon: "🌐", tip: "All links to official government resources open in a new tab so you don't lose your place." },
  { icon: "🔒", tip: "Your data is saved per account, so you can log back in from any device and pick up where you left off." },
];

export default function HelpCenter() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">🆘</div>
        <div>
          <div className="info-hero__eyebrow">Support</div>
          <h1 className="info-hero__title">Help Center</h1>
          <p className="info-hero__sub">
            Learn how to use every feature of SettleCAN to make the most of your settlement journey.
          </p>
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">📖 How to Use SettleCAN</h2>
        <div className="fp-grid fp-grid--2">
          {SECTIONS.map(s => (
            <div key={s.title} className="fp-card">
              <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{s.icon}</div>
              <h3 className="fp-card__title">{s.title}</h3>
              <p className="fp-card__body">{s.desc}</p>
              <Link to={s.link} className="fp-btn fp-btn--outline" style={{ alignSelf: "flex-start", marginTop: "auto", textDecoration: "none" }}>
                {s.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">💡 Quick Tips</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {TIPS.map((t, i) => (
            <div key={i} className="fp-card" style={{ flexDirection: "row", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{t.icon}</span>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#4a3a40", lineHeight: 1.6 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-section">
        <div className="fp-card fp-card--accent" style={{ flexDirection: "row", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 0.3rem", color: "#1a0d10" }}>Didn't find what you need?</h3>
            <p style={{ margin: 0, color: "#6b5a61", fontSize: "0.88rem" }}>
              Browse our FAQs or send us a message — we respond within 2 business days.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/faqs" className="fp-btn fp-btn--ghost" style={{ textDecoration: "none" }}>Browse FAQs</Link>
            <Link to="/contact" className="fp-btn fp-btn--primary" style={{ textDecoration: "none" }}>Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
