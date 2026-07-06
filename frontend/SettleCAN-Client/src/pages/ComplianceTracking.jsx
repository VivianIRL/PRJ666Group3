// ComplianceTracking.jsx — track permit conditions, deadlines, and legal obligations
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../state/AuthContext";
import "../scss/FeaturePages.scss";

const COMPLIANCE_ITEMS = [
  {
    id: 1, category: "Study Permit", icon: "🎓",
    title: "Enroll full-time at your DLI",
    detail: "You must be enrolled full-time at a Designated Learning Institution (DLI) throughout your studies, except in your final semester if fewer courses are needed.",
    severity: "critical", checked: false,
  },
  {
    id: 2, category: "Study Permit", icon: "🎓",
    title: "Maintain active enrolment — no unauthorized breaks",
    detail: "Taking a semester off without an authorized leave violates your permit conditions. Contact your school's international office before withdrawing.",
    severity: "critical", checked: false,
  },
  {
    id: 3, category: "Study Permit", icon: "🎓",
    title: "Off-campus work: max 24 hrs/week during academic sessions",
    detail: "As of Nov 2024, the limit is 24 hrs/week during academic sessions (increased from 20). You may work unlimited hours during scheduled breaks (summer, winter, spring).",
    severity: "high", checked: false,
  },
  {
    id: 4, category: "Study Permit", icon: "🎓",
    title: "Remain at the institution named on your permit",
    detail: "If you transfer schools, your study permit must be updated unless both institutions are DLIs and the transfer is within the same level of study.",
    severity: "high", checked: false,
  },
  {
    id: 5, category: "Work Permit", icon: "💼",
    title: "Work only for the employer named on your permit",
    detail: "Employer-specific work permits restrict you to one employer. Working for another employer — even unpaid — is a violation. Apply for a change of employer before switching.",
    severity: "critical", checked: false,
  },
  {
    id: 6, category: "Work Permit", icon: "💼",
    title: "Stay in the occupation listed on your permit",
    detail: "Some work permits restrict the type of occupation (NOC code). Performing duties outside your authorized occupation may violate your conditions.",
    severity: "high", checked: false,
  },
  {
    id: 7, category: "Work Permit", icon: "💼",
    title: "Work only in the province/location listed",
    detail: "Some permits are location-restricted. Check your permit for geographic restrictions before accepting a remote or out-of-province opportunity.",
    severity: "medium", checked: false,
  },
  {
    id: 8, category: "Visitor / No Status", icon: "🚫",
    title: "Do NOT work if you have no work authorization",
    detail: "Working without authorization is a serious violation that can result in removal and a future inadmissibility finding. This includes online or remote work for Canadian employers.",
    severity: "critical", checked: false,
  },
  {
    id: 9, category: "General", icon: "📋",
    title: "Maintain valid status at all times",
    detail: "Ensure your permit does not expire. If you applied for renewal before your permit expired, you have 'implied status' and can continue under your previous conditions while waiting.",
    severity: "critical", checked: false,
  },
  {
    id: 10, category: "General", icon: "📋",
    title: "Report address changes to IRCC",
    detail: "You are required to notify IRCC within 180 days of changing your address. Failure to do so can cause missed correspondence and compliance issues.",
    severity: "medium", checked: false,
  },
  {
    id: 11, category: "General", icon: "📋",
    title: "Do not criminally offend — it affects future applications",
    detail: "Any criminal record in Canada or abroad may render you inadmissible for future immigration applications including PR and citizenship.",
    severity: "medium", checked: false,
  },
  {
    id: 12, category: "Co-op / Internship", icon: "🔬",
    title: "Co-op requires a co-op work permit",
    detail: "If your program includes mandatory co-op or internship, ensure you have an authorization on your study permit (or a separate co-op permit). The off-campus limit does NOT apply to authorized co-op.",
    severity: "high", checked: false,
  },
];

const SEVERITY_META = {
  critical: { label: "Critical", cls: "fp-tag--red" },
  high:     { label: "High",     cls: "fp-tag--orange" },
  medium:   { label: "Medium",   cls: "fp-tag--blue" },
};

const CATEGORIES = [
  { label: "All",                emoji: "📋" },
  { label: "Study Permit",       emoji: "🎓" },
  { label: "Work Permit",        emoji: "💼" },
  { label: "General",            emoji: "🗂️"  },
  { label: "Co-op / Internship", emoji: "🔬" },
  { label: "Visitor / No Status",emoji: "🚫" },
];

export default function ComplianceTracking() {
  const { user } = useContext(AuthContext);
  const storageKey = user?.id ? `compliance_checked_${user.id}` : null;

  // Load checked IDs from localStorage on mount
  const [checkedIds, setCheckedIds] = useState(() => {
    if (!storageKey) return new Set();
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { /* localStorage unavailable */ }
    return new Set();
  });

  // Derive items array from checkedIds so state is a lean Set, not a duplicated array
  const items = COMPLIANCE_ITEMS.map(i => ({ ...i, checked: checkedIds.has(i.id) }));

  // Persist whenever checkedIds changes
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checkedIds]));
    } catch { /* localStorage unavailable */ }
  }, [checkedIds, storageKey]);

  // Set of active category labels; empty set = show all
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [openId, setOpenId]   = useState(null);

  const visible = activeFilters.size === 0
    ? items
    : items.filter(i => activeFilters.has(i.category));
  const checked = items.filter(i => i.checked).length;

  function toggle(id) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleFilter(label) {
    if (label === "All") { setActiveFilters(new Set()); return; }
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function isFilterActive(label) {
    return label === "All" ? activeFilters.size === 0 : activeFilters.has(label);
  }

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">📋 Stay Compliant</span>
        <h1 className="fp-header__title">Compliance Tracking</h1>
        <p className="fp-header__subtitle">
          Track your permit conditions, work-hour limits, enrollment requirements, and legal obligations.
          Violations can affect future immigration applications.
        </p>
      </div>

      <div className="fp-alert fp-alert--danger">
        <span className="fp-alert__icon">🚨</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Non-compliance is serious</strong>
          Violating permit conditions can result in your permit being cancelled, removal from Canada, or a finding of inadmissibility that affects future applications for PR or citizenship.
        </span>
      </div>

      {/* Progress */}
      <div className="fp-stats">
        <div className="fp-stat">
          <span className="fp-stat__num">{items.filter(i => i.checked).length}</span>
          <span className="fp-stat__label">Reviewed</span>
        </div>
        <div className="fp-stat">
          <span className="fp-stat__num">{items.filter(i => !i.checked).length}</span>
          <span className="fp-stat__label">To Review</span>
        </div>
        <div className="fp-stat">
          <span className="fp-stat__num">{items.filter(i => i.severity === "critical" && !i.checked).length}</span>
          <span className="fp-stat__label">Critical Pending</span>
        </div>
      </div>

      <div className="fp-progress" style={{ marginBottom: "1.5rem" }}>
        <div className="fp-progress__bar" style={{ width: `${(checked / items.length) * 100}%` }} />
      </div>

      {/* Category filters — multi-select; "All" clears selection */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {CATEGORIES.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => toggleFilter(label)}
            className={`fp-btn ${isFilterActive(label) ? "fp-btn--primary" : "fp-btn--ghost"}`}
            style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Compliance checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {visible.map(item => {
          const meta = SEVERITY_META[item.severity];
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              style={{
                background: item.checked ? "#f6fff9" : "#fff",
                borderRadius: "0.85rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflow: "hidden",
                border: item.severity === "critical" && !item.checked ? "1.5px solid #fca5a5" : "1.5px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem" }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item.id)}
                  style={{ width: 17, height: 17, accentColor: "#8E0002", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: item.checked ? "#9a8a90" : "#1a0d10", textDecoration: item.checked ? "line-through" : "none" }}>
                      {item.title}
                    </span>
                    <span className={`fp-tag ${meta.cls}`} style={{ fontSize: "0.65rem" }}>{meta.label}</span>
                    <span className="fp-tag fp-tag--gray" style={{ fontSize: "0.65rem" }}>{item.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  style={{ background: "none", border: "none", color: "#9a8a90", cursor: "pointer", fontSize: "0.75rem", flexShrink: 0 }}
                >
                  {isOpen ? "▲" : "▼"} Details
                </button>
              </div>
              {isOpen && (
                <div style={{ padding: "0 1rem 0.85rem 3.5rem", fontSize: "0.85rem", color: "#5a4a50", lineHeight: "1.6", borderTop: "1px solid #f5eff2" }}>
                  {item.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
