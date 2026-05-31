// PermitRenewalGuide.jsx — renew a study or work permit before it expires
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/TaskGuide.scss";

const STEPS = [
  {
    title: "Check your permit expiry date — apply 90 days before",
    body: "IRCC recommends applying at least 90 days before your permit expires. Processing can take 3–5 months. If you applied before expiry and your permit expires while waiting, you have 'maintained status' — you can continue living and working/studying under the same conditions.",
    docs: [],
    link: null,
  },
  {
    title: "Log into your IRCC Secure Account",
    body: "Create or access your account at canada.ca/ircc. Most renewal applications are submitted online. Paper applications are only used when specifically directed by IRCC.",
    docs: [],
    link: { label: "Sign in to IRCC Secure Account", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html" },
  },
  {
    title: "Complete the eligibility checklist",
    body: "Use the IRCC 'Come to Canada' tool to confirm your eligibility and generate a personalized document checklist. Eligibility depends on your current status, employer (for work permits), or school (for study permits).",
    docs: [],
    link: { label: "IRCC Come to Canada tool", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/come-canada-tool-immigration-express-entry.html" },
  },
  {
    title: "Gather all required documents",
    body: "For study permits: current permit, letter of acceptance from your DLI, proof of funds, passport. For work permits: current permit, employer letter, LMIA (if required), job offer letter, and passport.",
    docs: [
      "Current study or work permit",
      "Valid passport (must be valid beyond new permit end date)",
      "Letter of acceptance (study permits) or employer letter (work permits)",
      "Proof of funds (bank statements showing sufficient funds)",
      "LMIA or LMIA-exempt letter (work permits, if applicable)",
      "Biometrics (if required — check your application checklist)",
    ],
    link: null,
  },
  {
    title: "Pay the application fee",
    body: "Study permit renewal: CAD $150. Work permit renewal: CAD $155. Open work permit holder fee: CAD $100 (additional). Pay online using a credit or debit card on the IRCC portal.",
    docs: [],
    link: { label: "IRCC fee schedule", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence/collect-forms/pay-fee.html" },
  },
  {
    title: "Submit and track your application",
    body: "After submitting, note your Application Number and save confirmation. Track processing through your IRCC Secure Account. Respond promptly to any IRCC requests for additional documents — delays in responding pause processing.",
    docs: [],
    link: { label: "Check current processing times", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html" },
  },
  {
    title: "Receive your new permit",
    body: "Once approved, you will receive a new permit document. If you are outside Canada, a port of entry letter will be sent for a new stamp. If inside Canada, the new permit will be mailed or available for download. Check expiry dates carefully.",
    docs: [],
    link: null,
  },
];

const DOCS = [
  { label: "Current study or work permit (copy)",            required: true  },
  { label: "Valid passport — valid beyond the permit period", required: true  },
  { label: "Letter of acceptance (DLI) — for study permits", required: true  },
  { label: "Employer letter with job details — for work permits", required: false },
  { label: "Proof of funds (3–6 months bank statements)",    required: true  },
  { label: "Biometrics receipt (if previously collected)",   required: false },
  { label: "LMIA or LMIA-exempt documentation",             required: false },
  { label: "Photos (passport-style, if paper application)", required: false },
];

export default function PermitRenewalGuide() {
  const [checked, setChecked] = useState({});

  return (
    <div className="tg-page">
      <Link to="/tasks" className="tg-back">← Back to My Tasks</Link>

      <div className="tg-hero">
        <div className="tg-hero__eyebrow">Immigration · Step-by-Step Guide</div>
        <h1 className="tg-hero__title">Renew Your Study or Work Permit</h1>
        <div className="tg-hero__meta">
          <span className="tg-hero__chip">⏱ 3–5 months processing</span>
          <span className="tg-hero__chip">📄 6+ documents</span>
          <span className="tg-hero__chip">🌐 Online (IRCC portal)</span>
          <span className="tg-hero__chip">💰 $150–$155 CAD</span>
        </div>
      </div>

      <div className="tg-note tg-note--danger">
        <span className="tg-note__icon">🚨</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Apply 90 days before expiry — do not wait</strong>
          If your permit expires before you apply, you lose your status and must leave Canada or restore status (which is a separate, more complex process). Set a reminder now.
        </span>
      </div>

      <div className="tg-note tg-note--info">
        <span className="tg-note__icon">ℹ️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Maintained Status ("implied status")</strong>
          If you applied before your permit expired, you can continue under your previous conditions while waiting for a decision — even after your permit's printed expiry date passes. Keep your IRCC submission confirmation as proof.
        </span>
      </div>

      <p className="tg-section-title">📋 Step-by-Step Process</p>
      <div className="tg-steps">
        {STEPS.map((step, i) => (
          <div key={i} className="tg-step">
            <div className="tg-step__num">{i + 1}</div>
            <div className="tg-step__card">
              <h3 className="tg-step__title">{step.title}</h3>
              <p className="tg-step__body">{step.body}</p>
              {step.docs.length > 0 && (
                <div className="tg-step__docs">
                  {step.docs.map(d => <span key={d} className="tg-step__doc-chip">📄 {d}</span>)}
                </div>
              )}
              {step.link && (
                step.link.url.startsWith("/")
                  ? <Link to={step.link.url} className="tg-step__link">🔗 {step.link.label}</Link>
                  : <a href={step.link.url} target="_blank" rel="noreferrer" className="tg-step__link">🔗 {step.link.label}</a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="tg-section-title">📁 Document Checklist</p>
      <div className="tg-docs">
        <div className="tg-docs__list">
          {DOCS.map((doc, i) => (
            <div key={i} className="tg-docs__item">
              <input type="checkbox" id={`doc-${i}`} checked={!!checked[i]} onChange={() => setChecked(p => ({ ...p, [i]: !p[i] }))} />
              <label htmlFor={`doc-${i}`}>{doc.label}{doc.required ? <span style={{ color: "#8E0002", fontWeight: 700 }}> · Required</span> : <span> · If applicable</span>}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="tg-links">
        <p className="tg-links__title">🔗 Official Resources</p>
        <ul className="tg-links__list">
          <li><a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html" target="_blank" rel="noreferrer">Extend a study permit — canada.ca</a></li>
          <li><a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html" target="_blank" rel="noreferrer">Extend a work permit — canada.ca</a></li>
          <li><a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html" target="_blank" rel="noreferrer">Check current processing times</a></li>
          <li><a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html" target="_blank" rel="noreferrer">IRCC Secure Account login</a></li>
        </ul>
      </div>
    </div>
  );
}
