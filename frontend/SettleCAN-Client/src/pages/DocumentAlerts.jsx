// DocumentAlerts.jsx — expiry countdowns for permits, health card, passport, etc.
import { useState } from "react";
import "../scss/FeaturePages.scss";
import "../scss/DocumentAlerts.scss";

const DEFAULT_DOCS = [
  { id: 1, name: "Study Permit",       icon: "🎓", expiryDate: "", reminderDays: 90,  category: "Immigration", required: true,  note: "Apply to renew at least 90 days before expiry. Implied status applies while renewal is pending." },
  { id: 2, name: "Post-Grad Work Permit (PGWP)", icon: "💼", expiryDate: "", reminderDays: 90,  category: "Immigration", required: false, note: "PGWP cannot be renewed. Begin Express Entry or PNP process well before expiry." },
  { id: 3, name: "Work Permit",         icon: "💼", expiryDate: "", reminderDays: 90,  category: "Immigration", required: false, note: "Apply for renewal before expiry. Confirm employer details match your permit." },
  { id: 4, name: "Passport",            icon: "📘", expiryDate: "", reminderDays: 180, category: "Identity",    required: true,  note: "Many countries require 6 months validity beyond travel dates. Renew early to avoid delays." },
  { id: 5, name: "PR Card",             icon: "🍁", expiryDate: "", reminderDays: 270, category: "PR",          required: false, note: "PR card is valid for 5 years. You must be physically in Canada to renew. Apply 9+ months before expiry." },
  { id: 6, name: "Provincial Health Card", icon: "🏥", expiryDate: "", reminderDays: 60, category: "Health",   required: true,  note: "Renewal requirements vary by province. OHIP (Ontario) cards expire every 5 years." },
  { id: 7, name: "Co-op Work Permit",   icon: "🔬", expiryDate: "", reminderDays: 60,  category: "Immigration", required: false, note: "Must correspond to the co-op/internship dates in your Letter of Acceptance." },
  { id: 8, name: "Visitor Record",      icon: "✈️", expiryDate: "", reminderDays: 30,  category: "Immigration", required: false, note: "If your visitor record is expiring and you need to stay, apply for an extension immediately." },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function urgencyOf(days, reminder) {
  if (days === null) return null;
  if (days <= 0)        return "expired";
  if (days <= 30)       return "critical";
  if (days <= reminder) return "soon";
  return "ok";
}

const URGENCY_STYLES = {
  expired:  { bg: "#fff0f0", border: "#c0392b", tagCls: "fp-tag--red",    label: "Expired"  },
  critical: { bg: "#fff3f3", border: "#e67e22", tagCls: "fp-tag--red",    label: "Critical" },
  soon:     { bg: "#fffbf5", border: "#e67e22", tagCls: "fp-tag--orange", label: "Soon"     },
  ok:       { bg: "#f6fff9", border: "transparent", tagCls: "fp-tag--green", label: "OK"  },
};

export default function DocumentAlerts() {
  const [docs, setDocs]       = useState(DEFAULT_DOCS);
  const [editId, setEditId]   = useState(null);
  const [dateInput, setDateInput] = useState("");

  function saveDate(id) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, expiryDate: dateInput } : d));
    setEditId(null);
    setDateInput("");
  }

  function startEdit(doc) {
    setEditId(doc.id);
    setDateInput(doc.expiryDate);
  }

  const withDate = docs.filter(d => d.expiryDate);
  const expiring = withDate.filter(d => {
    const days = daysUntil(d.expiryDate);
    return days !== null && days <= d.reminderDays;
  });

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🔔 Document Expiry</span>
        <h1 className="fp-header__title">Alerts for Expiring Documents</h1>
        <p className="fp-header__subtitle">
          Enter your document expiry dates to track countdowns and receive alerts well
          before your study permit, PGWP, PR card, health card, or passport expires.
        </p>
      </div>

      {/* Summary alerts */}
      {expiring.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {expiring.map(d => {
            const days = daysUntil(d.expiryDate);
            return (
              <div key={d.id} className={`fp-alert fp-alert--${days <= 0 ? "danger" : days <= 30 ? "danger" : "warning"}`}>
                <span className="fp-alert__icon">{d.icon}</span>
                <span className="fp-alert__text">
                  <strong className="fp-alert__title">
                    {days <= 0 ? `${d.name} has expired!` : `${d.name} expires in ${days} day${days !== 1 ? "s" : ""}`}
                  </strong>
                  {d.note}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="fp-stats">
        <div className="fp-stat">
          <span className="fp-stat__num">{withDate.length}</span>
          <span className="fp-stat__label">Tracked</span>
        </div>
        <div className="fp-stat">
          <span className="fp-stat__num" style={{ color: "#c0392b" }}>
            {withDate.filter(d => { const dy = daysUntil(d.expiryDate); return dy !== null && dy <= 0; }).length}
          </span>
          <span className="fp-stat__label">Expired</span>
        </div>
        <div className="fp-stat">
          <span className="fp-stat__num" style={{ color: "#e67e22" }}>
            {withDate.filter(d => { const dy = daysUntil(d.expiryDate); return dy !== null && dy > 0 && dy <= 30; }).length}
          </span>
          <span className="fp-stat__label">Expiring in 30 days</span>
        </div>
        <div className="fp-stat">
          <span className="fp-stat__num" style={{ color: "#15803d" }}>
            {withDate.filter(d => { const dy = daysUntil(d.expiryDate); return dy !== null && dy > 30; }).length}
          </span>
          <span className="fp-stat__label">Active</span>
        </div>
      </div>

      {/* Document cards */}
      <div className="fp-grid fp-grid--2" style={{ gap: "0.85rem" }}>
        {docs.map(doc => {
          const days    = daysUntil(doc.expiryDate);
          const urgency = urgencyOf(days, doc.reminderDays);
          const style   = urgency ? URGENCY_STYLES[urgency] : null;
          const isEditing = editId === doc.id;

          return (
            <div
              key={doc.id}
              className="da-card"
              style={{
                background: style?.bg ?? "#fff",
                borderLeft: `4px solid ${style?.border ?? "#e5e7eb"}`,
              }}
            >
              <div className="da-card__header">
                <span className="da-card__icon">{doc.icon}</span>
                <div className="da-card__info">
                  <span className="da-card__cat">{doc.category}</span>
                  <span className="da-card__name">{doc.name}</span>
                </div>
                {urgency && (
                  <span className={`fp-tag ${style.tagCls}`}>{style.label}</span>
                )}
              </div>

              {/* Countdown */}
              {doc.expiryDate && days !== null && (
                <div className="da-card__countdown">
                  {days <= 0
                    ? <span className="da-card__days da-card__days--expired">Expired {Math.abs(days)} days ago</span>
                    : <span className="da-card__days">{days} days remaining</span>
                  }
                  <span className="da-card__expiry-label">Expires: {new Date(doc.expiryDate).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</span>

                  {/* Countdown bar */}
                  {days > 0 && (
                    <div className="fp-progress" style={{ height: 5 }}>
                      <div
                        className="fp-progress__bar"
                        style={{
                          width: `${Math.min(100, ((doc.reminderDays - days) / doc.reminderDays) * 100)}%`,
                          background: days <= 30 ? "#c0392b" : days <= doc.reminderDays ? "#e67e22" : "#27ae60",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Edit date */}
              {isEditing ? (
                <div className="da-card__edit">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    style={{ border: "1px solid #d3c4c9", borderRadius: "0.5rem", padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                  />
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button className="fp-btn fp-btn--primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem" }} onClick={() => saveDate(doc.id)}>Save</button>
                    <button className="fp-btn fp-btn--ghost" style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem" }} onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  className="fp-btn fp-btn--outline"
                  style={{ alignSelf: "flex-start", padding: "0.28rem 0.7rem", fontSize: "0.75rem" }}
                  onClick={() => startEdit(doc)}
                >
                  {doc.expiryDate ? "Edit Date" : "Add Expiry Date"}
                </button>
              )}

              <p style={{ fontSize: "0.78rem", color: "#7a6a70", margin: 0, lineHeight: 1.45 }}>{doc.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
