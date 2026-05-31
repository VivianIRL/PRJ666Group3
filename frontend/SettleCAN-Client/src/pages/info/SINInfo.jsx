// SINInfo.jsx — comprehensive information page about the Social Insurance Number
import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const WHAT_SECTIONS = [
  {
    q: "What is a SIN?",
    a: "A Social Insurance Number (SIN) is a 9-digit number issued by Service Canada. It is your unique identifier for all government programs and employment in Canada — including the Canada Pension Plan (CPP), Employment Insurance (EI), tax filing, and most banking. Every person who works or receives government benefits in Canada must have one.",
  },
  {
    q: "Who can apply for a SIN?",
    a: "Canadian citizens, permanent residents, and temporary residents (international students, work permit holders, and some protected persons) are eligible. Visitors and tourists are NOT eligible unless their visitor record specifically authorizes work.",
  },
  {
    q: "What does a SIN starting with 9 mean?",
    a: "A SIN beginning with the digit 9 is issued to temporary residents — people on study permits, work permits, or other temporary status. It is not permanent and expires when your immigration document expires. You must update your SIN record when you renew your permit, and employers cannot use an expired SIN.",
  },
  {
    q: "Is a SIN the same as a Social Security Number (SSN)?",
    a: "They serve similar purposes but are different systems. A Canadian SIN is issued by Service Canada and used only within Canada. The US Social Security Number (SSN) is a separate identifier. If you have worked in both countries, you will have both numbers.",
  },
  {
    q: "Can I have more than one SIN?",
    a: "No. You are only ever issued one SIN in your lifetime. If you lose your SIN document, Service Canada can reissue it — you will receive the same number. Do not attempt to apply again if you have already received one.",
  },
  {
    q: "When should I share my SIN?",
    a: "Only share your SIN when it is legally required: with your employer (for payroll and tax purposes), your bank (for interest-bearing accounts), and government agencies. You are NOT required to give your SIN to a landlord, doctor, insurance company, or any retailer.",
  },
];

const WHO_NEEDS_TABLE = [
  { situation: "Starting a new job",                   needed: true,  note: "Employer needs it for payroll and tax deductions (T4 slip)." },
  { situation: "Opening a bank account",               needed: true,  note: "Required for interest-bearing accounts and GICs." },
  { situation: "Filing Canadian taxes",                needed: true,  note: "CRA uses your SIN to identify your tax account." },
  { situation: "Applying for EI (Employment Insurance)", needed: true,  note: "Service Canada program requires a SIN." },
  { situation: "Accessing CPP retirement benefits",    needed: true,  note: "SIN is the key identifier for your CPP contribution history." },
  { situation: "Applying for GST/HST credit",         needed: true,  note: "CRA benefit — requires a SIN on file." },
  { situation: "Renting an apartment",                needed: false, note: "Landlords do NOT legally require your SIN." },
  { situation: "Signing up for a cell phone plan",    needed: false, note: "Phone providers do not need your SIN." },
  { situation: "Visiting a doctor",                   needed: false, note: "Your provincial health card number is used, not your SIN." },
];

const SCAMS = [
  {
    icon: "📞",
    title: "CRA Phone Scam",
    desc: "You receive a call claiming to be from the Canada Revenue Agency saying your SIN has been 'suspended' due to fraud. Callers demand immediate payment. The CRA will never call to demand emergency payment or threaten arrest.",
  },
  {
    icon: "📧",
    title: "Email Phishing",
    desc: "Emails claiming your SIN is linked to criminal activity and asking you to provide your SIN and personal details to 'verify your account'. Service Canada does not solicit SIN information via unsolicited email.",
  },
  {
    icon: "🏠",
    title: "Rental Application Scam",
    desc: "A landlord asks for your SIN as part of a rental application. Legitimate landlords do not need your SIN — they only need a credit check, which does not require you to provide a SIN directly.",
  },
  {
    icon: "💼",
    title: "Job Application Fraud",
    desc: "A job posting asks for your SIN before an interview. Legitimate employers only need your SIN after you accept a job offer. Providing it too early is a common identity theft tactic.",
  },
];

export default function SINInfo() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--red">
        <div className="info-hero__icon">🪪</div>
        <div>
          <div className="info-hero__eyebrow">Identity & Employment</div>
          <h1 className="info-hero__title">Social Insurance Number (SIN)</h1>
          <p className="info-hero__sub">
            Your 9-digit identifier for work, taxes, and government benefits in Canada.
          </p>
          <Link to="/guides/sin" className="info-hero__cta">
            → Step-by-step: How to apply for a SIN
          </Link>
        </div>
      </div>

      {/* Who needs a SIN table */}
      <div className="fp-section">
        <h2 className="fp-section__title">📋 When do you need a SIN?</h2>
        <table className="fp-table">
          <thead>
            <tr><th>Situation</th><th>SIN Required?</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {WHO_NEEDS_TABLE.map(row => (
              <tr key={row.situation}>
                <td><strong>{row.situation}</strong></td>
                <td>
                  <span className={`fp-tag ${row.needed ? "fp-tag--red" : "fp-tag--green"}`}>
                    {row.needed ? "✓ Required" : "✗ Not required"}
                  </span>
                </td>
                <td style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="fp-section">
        <h2 className="fp-section__title">❓ Understanding Your SIN</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {WHAT_SECTIONS.map((item, i) => (
            <div key={i} className="fp-card">
              <h3 className="fp-card__title">{item.q}</h3>
              <p className="fp-card__body">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SIN types */}
      <div className="fp-section">
        <h2 className="fp-section__title">🔢 SIN Number Types</h2>
        <div className="fp-grid fp-grid--3">
          <div className="fp-card fp-card--success">
            <h3 className="fp-card__title">Starts with 1–8</h3>
            <p className="fp-card__body">Issued to Canadian citizens and permanent residents. Permanent — never expires. No need to renew.</p>
            <span className="fp-tag fp-tag--green">Permanent</span>
          </div>
          <div className="fp-card fp-card--warning">
            <h3 className="fp-card__title">Starts with 9</h3>
            <p className="fp-card__body">Issued to temporary residents (study/work permit holders). Expires when your immigration document expires. Must update on each renewal.</p>
            <span className="fp-tag fp-tag--orange">Temporary</span>
          </div>
          <div className="fp-card">
            <h3 className="fp-card__title">Starts with 0</h3>
            <p className="fp-card__body">Reserved for future use. Not currently issued to individuals. If you see this, it may be an error.</p>
            <span className="fp-tag fp-tag--gray">Not in use</span>
          </div>
        </div>
      </div>

      {/* Scams */}
      <div className="fp-section">
        <h2 className="fp-section__title">🚨 Protect Your SIN — Common Scams</h2>
        <div className="fp-alert fp-alert--danger">
          <span className="fp-alert__icon">🚨</span>
          <span className="fp-alert__text">
            <strong className="fp-alert__title">Identity theft using your SIN is a serious crime</strong>
            Criminals who obtain your SIN can file fraudulent tax returns, access government benefits, and open credit accounts in your name. Guard it like a password.
          </span>
        </div>
        <div className="fp-grid fp-grid--2">
          {SCAMS.map(s => (
            <div key={s.title} className="fp-card fp-card--danger">
              <span className="fp-card__icon">{s.icon}</span>
              <h3 className="fp-card__title">{s.title}</h3>
              <p className="fp-card__body">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="info-links-row">
        <div className="fp-card fp-card--accent" style={{ flex: 1 }}>
          <h3 className="fp-card__title">📖 Ready to apply?</h3>
          <p className="fp-card__body">Follow our step-by-step guide with document checklist and official links.</p>
          <Link to="/guides/sin" className="fp-btn fp-btn--primary" style={{ marginTop: "0.5rem" }}>Apply for SIN — Guide</Link>
        </div>
        <div className="fp-card" style={{ flex: 1 }}>
          <h3 className="fp-card__title">🔗 Official Resources</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <li><a href="https://www.canada.ca/en/employment-social-development/services/sin.html" target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "#8E0002", fontWeight: 600 }}>SIN Program Overview — canada.ca</a></li>
            <li><a href="https://www.canada.ca/en/employment-social-development/services/sin/protect.html" target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "#8E0002", fontWeight: 600 }}>How to protect your SIN</a></li>
            <li><a href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/sin.html" target="_blank" rel="noreferrer" style={{ fontSize: "0.83rem", color: "#8E0002", fontWeight: 600 }}>SIN and the CRA</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
