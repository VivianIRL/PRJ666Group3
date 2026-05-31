// SINGuide.jsx — step-by-step guide for applying for a Social Insurance Number
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/TaskGuide.scss";

const STEPS = [
  {
    title: "Check if you are eligible to apply",
    body: "You need a valid immigration document that authorizes you to work or study in Canada — a study permit, work permit, or PR card. Visitors are NOT eligible for a SIN unless their permit authorizes work.",
    docs: [],
    link: null,
  },
  {
    title: "Gather your required documents",
    body: "You must bring original documents — photocopies are not accepted. At a minimum, bring your passport and your immigration document. Proof of Canadian address is required if applying online.",
    docs: ["Valid passport", "Study permit or work permit (or PR confirmation letter)", "Proof of address (utility bill, bank statement, or lease)"],
    link: null,
  },
  {
    title: "Choose how to apply",
    body: "You can apply in person at any Service Canada office — this is the fastest option and you receive your SIN the same day. Online applications are available but take longer (5–10 business days). Mail applications are also accepted but slowest.",
    docs: [],
    link: { label: "Find a Service Canada office near you", url: "https://www.servicecanada.gc.ca/tbsc-fsco/sc-hme.jsp?lang=eng" },
  },
  {
    title: "Complete the SIN application form",
    body: "If applying in person, a Service Canada agent will guide you. If applying online, complete form SIN-A on the Service Canada website. The application itself takes about 10–15 minutes.",
    docs: [],
    link: { label: "Apply for SIN online", url: "https://www.canada.ca/en/employment-social-development/services/sin/apply.html" },
  },
  {
    title: "Receive and protect your SIN",
    body: "In-person applicants receive their SIN immediately on a paper document. Online applicants receive a letter within 5–10 business days. Store it securely — never carry your SIN card in your wallet. Only share your SIN with employers, your bank, and government agencies.",
    docs: [],
    link: null,
  },
];

const DOCS = [
  { label: "Valid passport",              required: true  },
  { label: "Study permit or work permit", required: true  },
  { label: "PR confirmation letter (if applicable)", required: false },
  { label: "Proof of Canadian address",  required: true  },
];

export default function SINGuide() {
  const [checked, setChecked] = useState({});

  return (
    <div className="tg-page">
      <Link to="/tasks" className="tg-back">← Back to My Tasks</Link>

      {/* Hero */}
      <div className="tg-hero">
        <div className="tg-hero__eyebrow">Employment · Step-by-Step Guide</div>
        <h1 className="tg-hero__title">Apply for a Social Insurance Number (SIN)</h1>
        <div className="tg-hero__meta">
          <span className="tg-hero__chip">⏱ 30 minutes</span>
          <span className="tg-hero__chip">📄 3 documents</span>
          <span className="tg-hero__chip">🏛️ In person or online</span>
          <span className="tg-hero__chip">💰 Free</span>
        </div>
      </div>

      <div className="tg-note tg-note--info">
        <span className="tg-note__icon">ℹ️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Why you need a SIN</strong>
          Your SIN is required to work legally in Canada, file taxes, access government benefits, and open most bank accounts. Apply as soon as you have a valid permit.
        </span>
      </div>

      {/* Steps */}
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
                <a href={step.link.url} target="_blank" rel="noreferrer" className="tg-step__link">
                  🔗 {step.link.label}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Document checklist */}
      <p className="tg-section-title">📁 Document Checklist</p>
      <div className="tg-docs">
        <div className="tg-docs__list">
          {DOCS.map((doc, i) => (
            <div key={i} className="tg-docs__item">
              <input
                type="checkbox"
                id={`doc-${i}`}
                checked={!!checked[i]}
                onChange={() => setChecked(p => ({ ...p, [i]: !p[i] }))}
              />
              <label htmlFor={`doc-${i}`}>
                {doc.label}
                {doc.required
                  ? <span style={{ color: "#8E0002", fontWeight: 700 }}> · Required</span>
                  : <span> · If applicable</span>}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="tg-note tg-note--warning">
        <span className="tg-note__icon">⚠️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">If your SIN starts with 9</strong>
          A SIN beginning with 9 is issued to temporary residents. It expires when your permit expires. You must update your SIN record with each new permit. Employers are not permitted to use an expired SIN.
        </span>
      </div>

      {/* Official links */}
      <div className="tg-links">
        <p className="tg-links__title">🔗 Official Resources</p>
        <ul className="tg-links__list">
          <li><a href="https://www.canada.ca/en/employment-social-development/services/sin/apply.html" target="_blank" rel="noreferrer">Apply for a SIN — canada.ca</a></li>
          <li><a href="https://www.servicecanada.gc.ca/tbsc-fsco/sc-hme.jsp?lang=eng" target="_blank" rel="noreferrer">Find a Service Canada office</a></li>
          <li><a href="https://www.canada.ca/en/employment-social-development/services/sin/protect.html" target="_blank" rel="noreferrer">Protect your SIN — guide</a></li>
        </ul>
      </div>
    </div>
  );
}
