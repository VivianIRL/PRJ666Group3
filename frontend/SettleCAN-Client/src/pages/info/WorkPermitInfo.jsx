// WorkPermitInfo.jsx — comprehensive information about work permits in Canada
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";
import LastUpdatedBadge from "../../components/LastUpdatedBadge";

const PERMIT_TYPES = [
  {
    type: "Open Work Permit",
    tag: "Most Flexible",
    tagCls: "fp-tag--green",
    icon: "🔓",
    desc: "Allows you to work for almost any employer in Canada, in any location, in any occupation. You are not tied to a specific job or company.",
    examples: [
      "Post-Graduation Work Permit (PGWP) — for international graduates",
      "Spousal/Common-law Partner Open Work Permit",
      "Bridging Open Work Permit (BOWP) — while waiting for PR",
      "International Mobility Program (IMP) open permits",
      "Working Holiday / International Experience Canada (IEC)",
    ],
    conditions:
      "Valid for the period on the permit. Check for any noted restrictions on occupation or location. Your SIN will start with 9 and expire with your permit.",
  },
  {
    type: "Employer-Specific (Closed) Work Permit",
    tag: "Restricted",
    tagCls: "fp-tag--orange",
    icon: "🔒",
    desc: "Ties you to a specific employer, occupation (NOC code), and sometimes location. You cannot work for any other employer without applying for a new permit first.",
    examples: [
      "LMIA-based work permits (most Temporary Foreign Workers)",
      "Intra-company transfers",
      "Some International Mobility Program streams",
      "Live-in caregiver program permits",
    ],
    conditions:
      "Working for a different employer — even part-time or unpaid — violates your conditions. Apply for a change of employer before switching. Employer must update their LMIA record if circumstances change.",
  },
  {
    type: "Co-op / Intern Work Permit",
    tag: "Students",
    tagCls: "fp-tag--blue",
    icon: "🔬",
    desc: "Authorizes work as part of a mandatory academic co-op, internship, or clinical placement. Can be on your study permit as an authorization, or as a separate permit.",
    examples: [
      "Authorization noted on study permit ('may work in co-op')",
      "Separate co-op work permit for full-time placements",
      "Clinical placement permits for healthcare students",
    ],
    conditions:
      "Only valid for the authorized co-op/internship period. Must have a letter from your school. Does NOT count against the 24 hr/week off-campus limit.",
  },
];

const LMIA_INFO = [
  {
    term: "LMIA",
    def: "Labour Market Impact Assessment. A document employers obtain from Employment and Social Development Canada (ESDC) confirming there is a need for a foreign worker and no Canadian or PR could fill the role.",
  },
  {
    term: "LMIA-exempt",
    def: "Many categories don't require an LMIA, including intra-company transfers, recipients of free trade agreements (CUSMA/USMCA), IEC participants, and significant benefit to Canada streams (C10, C11).",
  },
  {
    term: "NOC Code",
    def: "National Occupational Classification code. Each job has a TEER level (0–5). Your NOC code on the permit determines the type of work you're authorized for. Working outside your NOC may violate conditions.",
  },
  {
    term: "Implied Status",
    def: "If you apply to renew your work permit before it expires, you can continue working under the same conditions even after the expiry date printed on your permit, while waiting for a decision.",
  },
  {
    term: "Restoration of Status",
    def: "If your permit expired before you renewed, you can apply to restore status within 90 days of the expiry. You cannot work during this time. After 90 days, you must leave Canada.",
  },
];

const CHANGE_EMPLOYER = [
  {
    step: "1",
    title: "Confirm your current permit type",
    body: "Check if your permit is open or employer-specific. If it is open, you can change employers immediately without applying for a new permit.",
  },
  {
    step: "2",
    title: "Secure the new job offer",
    body: "Obtain a formal written job offer from your new employer. For LMIA-required permits, your new employer must obtain a new LMIA before you can start.",
  },
  {
    step: "3",
    title: "Apply for a new employer-specific permit (if required)",
    body: "Do NOT start work for the new employer until you receive the new permit. Working before approval is a violation of your conditions.",
  },
  {
    step: "4",
    title: "Submit your application",
    body: "Apply online through the IRCC portal. Include the new LMIA (if applicable), new job offer letter, and your current permit. Pay the CAD $155 fee.",
  },
  {
    step: "5",
    title: "Wait for approval — do not start early",
    body: "Processing times vary. Use the implied status provision only if you applied before your current permit expired and want to continue with your current employer while waiting.",
  },
];

const WORK_CONDITION_FAQS = [
  {
    q: "Can I work remotely in Canada on a work permit?",
    a: "Yes, if your permit allows it. For employer-specific permits, the work must typically be for the named employer. Remote work for a foreign (non-Canadian) employer from inside Canada may require separate authorization depending on your permit type.",
  },
  {
    q: "What happens if my employer closes or goes bankrupt?",
    a: "If your employer closes and your permit is employer-specific, you cannot legally work for a new employer immediately. Apply for a new permit or an open work permit as soon as possible. Some vulnerable worker provisions may apply.",
  },
  {
    q: "Can my family work if they come with me?",
    a: "Dependants of some permit holders are eligible for open work permits. Check if your permit category qualifies. Spouses/partners of skilled workers and students in eligible programs often qualify.",
  },
  {
    q: "Can I study while on a work permit?",
    a: "Work permit holders can study for up to 6 months without a study permit. For programs longer than 6 months, you need to apply for a study permit.",
  },
  {
    q: "What is a Bridging Open Work Permit (BOWP)?",
    a: "If you have applied for permanent residence and your work permit is expiring, you may be eligible for a BOWP — an open work permit that bridges the gap until your PR is processed. You must meet specific eligibility criteria.",
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function WorkPermitInfo() {
  const [openFaq, setOpenFaq] = useState(null);
  const [apiContent, setApiContent] = useState(null);
  const [apiResources, setApiResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWorkPermitInfo() {
      try {
        const res = await fetch(`${API_BASE}/api/info/work-permit`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setApiContent(data.content);
          setApiResources(data.resources || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkPermitInfo();
  }, []);

  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--red">
        <div className="info-hero__icon">💼</div>
        <div>
          <div className="info-hero__eyebrow">Employment Authorization</div>
          <h1 className="info-hero__title">
            {apiContent?.title || "Work Permits in Canada"}
          </h1>
          <p className="info-hero__sub">
            {apiContent?.summary ||
              "Everything you need to understand work authorization — permit types, employer restrictions, LMIA, changing jobs, and your rights as a worker."}
          </p>
          <Link to="/guides/permit-renewal" className="info-hero__cta">
            → Step-by-step: Renew your work permit
          </Link>
        </div>
      </div>

      {/* API resources section — shown only when data is available */}
      {!loading && !error && apiResources.length > 0 && (
        <div className="fp-section">
          <h2 className="fp-section__title">📌 Featured Resources</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {apiResources.map((r) => (
              <div
                key={r.id}
                className="fp-card"
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong
                    style={{
                      fontSize: "0.88rem",
                      color: "#1a0d10",
                      display: "block",
                    }}
                  >
                    {r.title}
                  </strong>
                  {r.description && (
                    <span style={{ fontSize: "0.8rem", color: "#6b5a61" }}>
                      {r.description}
                    </span>
                  )}
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#8E0002",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="fp-alert fp-alert--danger" style={{ margin: "1rem 0" }}>
          <span className="fp-alert__icon">⚠️</span>
          <span className="fp-alert__text">
            Could not load live content: {error}
          </span>
        </div>
      )}

      {/* Permit types */}
      <div className="fp-section">
        <h2 className="fp-section__title">📄 Types of Work Permits</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {PERMIT_TYPES.map((pt) => (
            <div key={pt.type} className="fp-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{pt.icon}</span>
                  <h3 className="fp-card__title" style={{ margin: 0 }}>
                    {pt.type}
                  </h3>
                </div>
                <span className={`fp-tag ${pt.tagCls}`}>{pt.tag}</span>
              </div>
              <p className="fp-card__body">{pt.desc}</p>
              <div style={{ marginTop: "0.5rem" }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#8E0002",
                    marginBottom: "0.3rem",
                  }}
                >
                  Common examples
                </p>
                <ul
                  style={{
                    paddingLeft: "1.1rem",
                    margin: "0 0 0.6rem",
                    fontSize: "0.83rem",
                    color: "#3a2a30",
                  }}
                >
                  {pt.examples.map((e) => (
                    <li key={e} style={{ marginBottom: "0.15rem" }}>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  background: "#f9f5f6",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.82rem",
                  color: "#5a4a50",
                }}
              >
                <strong>Conditions: </strong>
                {pt.conditions}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key terms */}
      <div className="fp-section">
        <h2 className="fp-section__title">📖 Key Terms Explained</h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {LMIA_INFO.map((item) => (
            <div
              key={item.term}
              className="fp-card"
              style={{
                flexDirection: "row",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  color: "#8E0002",
                  minWidth: "120px",
                  flexShrink: 0,
                }}
              >
                {item.term}
              </span>
              <p className="fp-card__body" style={{ margin: 0 }}>
                {item.def}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Changing employers */}
      <div className="fp-section">
        <h2 className="fp-section__title">🔄 How to Change Employers</h2>
        <div className="fp-alert fp-alert--danger">
          <span className="fp-alert__icon">🚨</span>
          <span className="fp-alert__text">
            <strong className="fp-alert__title">
              Never start a new job before getting approval
            </strong>
            If you hold an employer-specific permit, working for a new employer
            before receiving an updated permit is a violation of your
            immigration status. This can affect future applications.
          </span>
        </div>
        <div className="fp-steps">
          {CHANGE_EMPLOYER.map((s) => (
            <div key={s.step} className="fp-step">
              <div className="fp-step__dot" />
              <div className="fp-step__num">Step {s.step}</div>
              <div className="fp-step__title">{s.title}</div>
              <div className="fp-step__body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="fp-section">
        <h2 className="fp-section__title">❓ Common Questions</h2>
        <div className="fp-accordion">
          {WORK_CONDITION_FAQS.map((faq, i) => (
            <div key={i} className="fp-accordion__item">
              <button
                className="fp-accordion__trigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <span
                  className={`fp-accordion__chevron ${openFaq === i ? "fp-accordion__chevron--open" : ""}`}
                >
                  ▼
                </span>
              </button>
              {openFaq === i && (
                <div className="fp-accordion__body">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="info-links-row">
        <div className="fp-card fp-card--accent" style={{ flex: 1 }}>
          <h3 className="fp-card__title">📖 Need to renew?</h3>
          <p className="fp-card__body">
            Step-by-step guide with document checklist for study and work permit
            renewal.
          </p>
          <Link
            to="/guides/permit-renewal"
            className="fp-btn fp-btn--primary"
            style={{ marginTop: "0.5rem" }}
          >
            Renewal Guide
          </Link>
        </div>
        <div className="fp-card" style={{ flex: 1 }}>
          <h3 className="fp-card__title">🔗 Official Resources</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <li>
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/work-permit.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Work permits overview — canada.ca
              </a>
            </li>
            <li>
              <a
                href="https://www.canada.ca/en/employment-social-development/services/foreign-workers.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Hiring temporary foreign workers (ESDC)
              </a>
            </li>
            <li>
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Current processing times
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
