// FeaturesHub.jsx — landing page for all SettleCAN features
import { Link } from "react-router-dom";
import "../scss/FeaturePages.scss";
import "../scss/FeaturesHub.scss";

const FEATURES = [
  {
    icon: "✅",
    eyebrow: "Task Management",
    title: "Step-by-Step Task Completion",
    desc: "Guided checklists for SIN, bank account, health card, housing and more — with progress tracking.",
    path: "/tasks",
    tag: "Interactive",
    tagColor: "green",
  },
  {
    icon: "🏛️",
    eyebrow: "Official Sources",
    title: "IRCC Information Integration",
    desc: "Real-time links to official IRCC portals, processing times, and government resources.",
    path: "/ircc",
    tag: "Official Data",
    tagColor: "blue",
  },
  {
    icon: "📋",
    eyebrow: "Stay Compliant",
    title: "Compliance Tracking",
    desc: "Track permit conditions, work-hour limits, enrollment requirements, and legal obligations.",
    path: "/compliance",
    tag: "Important",
    tagColor: "orange",
  },
  {
    icon: "🔔",
    eyebrow: "Document Expiry",
    title: "Alerts for Expiring Documents",
    desc: "Get countdown alerts for study permit, PGWP, PR card, health card, and passport expiry.",
    path: "/document-alerts",
    tag: "Time-Sensitive",
    tagColor: "red",
  },
  {
    icon: "🎓",
    eyebrow: "Students",
    title: "International Student Guidance",
    desc: "Work rules, PGWP eligibility, co-op requirements, DLI compliance, and health coverage info.",
    path: "/international-students",
    tag: "Students",
    tagColor: "blue",
  },
  {
    icon: "🛬",
    eyebrow: "New Arrivals",
    title: "Post-Arrival Support",
    desc: "Your first-week and first-month checklist: SIN, bank, health card, transit, orientation.",
    path: "/post-arrival",
    tag: "Start Here",
    tagColor: "green",
  },
  {
    icon: "📝",
    eyebrow: "Personalization",
    title: "Personalized Checklists",
    desc: "Tailored settlement checklists based on your immigration status, province, and arrival date.",
    path: "/checklists",
    tag: "Personalized",
    tagColor: "gray",
  },
  {
    icon: "🏠",
    eyebrow: "Housing",
    title: "Housing Support",
    desc: "Rental guides, tenant rights by province, average costs, and trusted housing resources.",
    path: "/housing",
    tag: "Resources",
    tagColor: "gray",
  },
  {
    icon: "💼",
    eyebrow: "Employment",
    title: "Work Eligibility Guidance",
    desc: "Understand your work authorization: off-campus limits, open permits, co-op rules, and SIN-9.",
    path: "/work-eligibility",
    tag: "Employment",
    tagColor: "blue",
  },
  {
    icon: "🍁",
    eyebrow: "Permanent Residency",
    title: "PR Pathway Guidance",
    desc: "Compare Express Entry, PNP, Atlantic Immigration, and family sponsorship pathways to PR.",
    path: "/pr-pathway",
    tag: "PR",
    tagColor: "red",
  },
  {
    icon: "📰",
    eyebrow: "Policy",
    title: "Updated With Policy Changes",
    desc: "Stay current on IRCC announcements, cap changes, fee updates, and new immigration streams.",
    path: "/policy-updates",
    tag: "Live Updates",
    tagColor: "orange",
  },
  {
    icon: "⚙️",
    eyebrow: "Options",
    title: "Change User Options",
    desc: "Update current user configuration and website settings.",
    path: "/options",
    tag: "Personalized",
    tagColor: "gray",
  },
];

export default function FeaturesHub() {
  return (
    <div className="fp-page features-hub">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🍁 SettleCAN</span>
        <h1 className="fp-header__title">Settlement Resources</h1>
        <p className="fp-header__subtitle">
          Everything you need to settle in Canada — from your first day to permanent residency.
          All guides are based on official IRCC and government sources.
        </p>
      </div>

      <div className="fh-grid">
        {FEATURES.map(f => (
          <Link key={f.path} to={f.path} className="fh-card">
            <div className="fh-card__top">
              <span className="fh-card__icon">{f.icon}</span>
              <span className={`fp-tag fp-tag--${f.tagColor}`}>{f.tag}</span>
            </div>
            <span className="fh-card__eyebrow">{f.eyebrow}</span>
            <h3 className="fh-card__title">{f.title}</h3>
            <p className="fh-card__desc">{f.desc}</p>
            <span className="fh-card__cta">Explore →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
