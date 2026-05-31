// WorkEligibility.jsx
import { useState } from "react";
import "../scss/FeaturePages.scss";

const PERMIT_TYPES = [
  {
    type: "Open Work Permit",
    tag: "Most Flexible", tagCls: "fp-tag--green",
    icon: "🔓",
    desc: "Work for any employer anywhere in Canada in any occupation.",
    examples: ["Post-Graduation Work Permit (PGWP)", "Spousal/Partner Open Work Permit", "Bridging Open Work Permit (BOWP)", "International Mobility Program (IMP) open permits"],
    conditions: ["Valid for the duration specified on the permit", "Does not restrict employer, location, or occupation (unless noted)", "SIN starting with 9 — cannot be used after permit expiry"],
  },
  {
    type: "Employer-Specific Work Permit",
    tag: "Restricted", tagCls: "fp-tag--orange",
    icon: "🔒",
    desc: "Restricts you to one employer, job, and often one location.",
    examples: ["LMIA-based work permit", "Intra-company transferee permit", "Some IMP streams"],
    conditions: ["Cannot work for any other employer (even part-time)", "Must update permit before changing employers — apply for a new permit", "Work must match the NOC code and location on permit"],
  },
  {
    type: "Student Work Authorization",
    tag: "Students Only", tagCls: "fp-tag--blue",
    icon: "🎓",
    desc: "Built into your study permit if you meet eligibility conditions.",
    examples: ["Off-campus: 24 hrs/week during session", "On-campus: unlimited (at your DLI)", "Co-op/internship: requires co-op authorization"],
    conditions: ["Must remain enrolled full-time", "Off-campus limit applies only during academic sessions", "Co-op requires either authorization on study permit or separate co-op permit"],
  },
  {
    type: "No Work Authorization",
    tag: "Cannot Work", tagCls: "fp-tag--red",
    icon: "🚫",
    desc: "Some individuals are not authorized to work in Canada.",
    examples: ["Visitors / tourist visa holders", "Study permit holders without work authorization", "Refugee claimants awaiting certain determinations"],
    conditions: ["Working without authorization is a serious violation", "Can result in removal from Canada and bars to future applications", "Apply for proper authorization before starting any work"],
  },
];

const NOC_TEER = [
  { teer: "TEER 0", title: "Management occupations", example: "Senior manager, director, executive", note: "Counts toward CEC for PR after 1 year" },
  { teer: "TEER 1", title: "Degree-level skill", example: "Engineer, accountant, nurse, teacher", note: "Counts toward CEC for PR after 1 year" },
  { teer: "TEER 2", title: "College diploma / apprenticeship", example: "Electrician, chef, medical lab tech", note: "Counts toward CEC for PR after 1 year" },
  { teer: "TEER 3", title: "College / secondary + long OJT", example: "Retail supervisor, dental assistant", note: "Counts toward CEC for PR after 1 year" },
  { teer: "TEER 4", title: "Secondary school", example: "Retail salesperson, food counter attendant", note: "Does NOT count toward CEC" },
  { teer: "TEER 5", title: "Short OJT / no credentials", example: "Labourer, cleaner, taxi driver", note: "Does NOT count toward CEC" },
];

const SIN_GUIDE = [
  { sin: "SIN starting with 9", meaning: "Temporary resident — work permit or study permit holder", restriction: "SIN expires when your permit expires. Cannot be used after expiry. Renew SIN when you get new permit." },
  { sin: "SIN starting with other digits", meaning: "Canadian citizen or permanent resident", restriction: "Permanent SIN — no expiry." },
];

export default function WorkEligibility() {
  const [openType, setOpenType] = useState(null);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">💼 Employment</span>
        <h1 className="fp-header__title">Work Eligibility Guidance</h1>
        <p className="fp-header__subtitle">
          Understand your work authorization in Canada: permit types, work-hour limits,
          co-op rules, employer restrictions, and how your work counts toward permanent residency.
        </p>
      </div>

      <div className="fp-alert fp-alert--warning">
        <span className="fp-alert__icon">⚠️</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Know your authorization before you start</strong>
          Working without proper authorization — even part-time or remotely for a Canadian employer — is a violation of your status conditions and can affect future applications.
        </span>
      </div>

      {/* Permit types */}
      <div className="fp-section">
        <h2 className="fp-section__title">📄 Work Permit Types</h2>
        <div className="fp-grid fp-grid--2">
          {PERMIT_TYPES.map((pt, i) => (
            <div key={pt.type} className="fp-card" style={{ cursor: "pointer" }} onClick={() => setOpenType(openType === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.5rem" }}>{pt.icon}</span>
                <span className={`fp-tag ${pt.tagCls}`}>{pt.tag}</span>
              </div>
              <h3 className="fp-card__title">{pt.type}</h3>
              <p className="fp-card__body">{pt.desc}</p>

              {openType === i && (
                <div style={{ marginTop: "0.5rem", borderTop: "1px solid #f0eaec", paddingTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#8E0002", marginBottom: "0.3rem" }}>Examples</p>
                  <ul style={{ paddingLeft: "1.1rem", margin: "0 0 0.6rem", fontSize: "0.83rem", color: "#3a2a30" }}>
                    {pt.examples.map(e => <li key={e}>{e}</li>)}
                  </ul>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#8E0002", marginBottom: "0.3rem" }}>Conditions</p>
                  <ul style={{ paddingLeft: "1.1rem", margin: "0", fontSize: "0.83rem", color: "#5a4a50" }}>
                    {pt.conditions.map(c => <li key={c} style={{ marginBottom: "0.15rem" }}>{c}</li>)}
                  </ul>
                </div>
              )}
              <span style={{ fontSize: "0.75rem", color: "#8E0002", fontWeight: 600, marginTop: "auto" }}>{openType === i ? "▲ Less" : "▼ More details"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NOC TEER */}
      <div className="fp-section">
        <h2 className="fp-section__title">📊 NOC TEER — Occupation Skill Levels</h2>
        <p style={{ fontSize: "0.87rem", color: "#6b5a61", marginBottom: "1rem" }}>
          Canada classifies jobs using the National Occupational Classification (NOC) TEER system.
          TEER 0–3 occupations qualify for Express Entry's Canadian Experience Class after 1 year of work.
        </p>
        <table className="fp-table">
          <thead><tr><th>TEER Level</th><th>Description</th><th>Example Occupation</th><th>PR-Eligible?</th></tr></thead>
          <tbody>
            {NOC_TEER.map(row => (
              <tr key={row.teer}>
                <td><strong>{row.teer}</strong></td>
                <td>{row.title}</td>
                <td style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{row.example}</td>
                <td>
                  <span className={`fp-tag ${row.teer <= "TEER 3" ? "fp-tag--green" : "fp-tag--red"}`}>
                    {row.teer <= "TEER 3" ? "✓ Yes (CEC)" : "✗ No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIN Guide */}
      <div className="fp-section">
        <h2 className="fp-section__title">🔢 Social Insurance Number (SIN) Guide</h2>
        <div className="fp-grid fp-grid--2">
          {SIN_GUIDE.map(row => (
            <div key={row.sin} className={`fp-card ${row.sin.includes("9") ? "fp-card--warning" : "fp-card--success"}`}>
              <h3 className="fp-card__title">{row.sin}</h3>
              <p className="fp-card__body"><strong>Who it applies to:</strong> {row.meaning}</p>
              <p className="fp-card__body">{row.restriction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
