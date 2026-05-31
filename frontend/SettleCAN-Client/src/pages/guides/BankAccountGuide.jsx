// BankAccountGuide.jsx — open a Canadian bank account as a newcomer
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/TaskGuide.scss";

const BANKS = [
  { name: "TD Bank",        program: "TD New to Canada Banking Package",  url: "https://www.td.com/ca/en/personal-banking/products/bank-accounts/new-to-canada/" },
  { name: "RBC",            program: "RBC Newcomer Advantage",            url: "https://www.rbc.com/newcomers/index.html" },
  { name: "Scotiabank",     program: "StartRight Program",                url: "https://www.scotiabank.com/ca/en/personal/ways-to-bank/newcomers-to-canada.html" },
  { name: "BMO",            program: "BMO NewStart Program",              url: "https://www.bmo.com/en-ca/main/personal/banking/newcomers-to-canada/" },
  { name: "CIBC",           program: "CIBC Smart for Newcomers",          url: "https://www.cibc.com/en/personal-banking/ways-to-bank/newcomers.html" },
  { name: "Tangerine / EQ Bank", program: "Online newcomer-friendly accounts", url: "https://www.tangerine.ca" },
];

const STEPS = [
  {
    title: "Get your SIN first",
    body: "Most banks require a Social Insurance Number (SIN) to open an account. Apply for your SIN at Service Canada before booking a bank appointment.",
    docs: ["SIN document"],
    link: { label: "See the SIN guide", url: "/guides/sin" },
  },
  {
    title: "Choose a bank and account type",
    body: "All major Canadian banks offer newcomer packages with no monthly fees for 1–2 years. Compare: TD, RBC, Scotiabank, BMO, and CIBC all have dedicated newcomer programs. Online banks (Tangerine, EQ Bank) have no monthly fees permanently but fewer in-branch services.",
    docs: [],
    link: null,
  },
  {
    title: "Book an appointment",
    body: "Book online or walk in. For newcomer accounts, calling ahead to confirm document requirements is recommended — some branches have newcomer-specialist advisors.",
    docs: [],
    link: null,
  },
  {
    title: "Bring your documents",
    body: "Bring two pieces of ID and your SIN. Proof of address is required — your university acceptance letter, lease agreement, or any piece of mail with your name and Canadian address works.",
    docs: ["Passport (primary ID)", "Study or work permit (second ID)", "SIN document", "Proof of Canadian address"],
    link: null,
  },
  {
    title: "Open your account and set up online banking",
    body: "The appointment typically takes 30–60 minutes. You will receive a debit card, set up online banking, and can link the account to receive direct deposit from your employer or school.",
    docs: [],
    link: null,
  },
  {
    title: "Start building Canadian credit history",
    body: "After 3–6 months, apply for a secured credit card or student credit card to begin building a Canadian credit score. This is important for future rental applications, car loans, and mortgages.",
    docs: [],
    link: null,
  },
];

const DOCS = [
  { label: "Passport",                    required: true  },
  { label: "Study permit or work permit", required: true  },
  { label: "SIN document",                required: true  },
  { label: "Proof of Canadian address (lease, letter of acceptance, utility bill)", required: true },
];

export default function BankAccountGuide() {
  const [checked, setChecked] = useState({});

  return (
    <div className="tg-page">
      <Link to="/tasks" className="tg-back">← Back to My Tasks</Link>

      <div className="tg-hero">
        <div className="tg-hero__eyebrow">Banking · Step-by-Step Guide</div>
        <h1 className="tg-hero__title">Open a Canadian Bank Account</h1>
        <div className="tg-hero__meta">
          <span className="tg-hero__chip">⏱ 1–2 hours</span>
          <span className="tg-hero__chip">📄 4 documents</span>
          <span className="tg-hero__chip">🏦 In branch</span>
          <span className="tg-hero__chip">💰 Free (newcomer packages)</span>
        </div>
      </div>

      <div className="tg-note tg-note--success">
        <span className="tg-note__icon">✅</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">No Canadian credit history required</strong>
          All major banks accept newcomers without a Canadian credit history. Bring your foreign passport and immigration document — that's all they need to verify your identity.
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
                <Link to={step.link.url} className="tg-step__link">🔗 {step.link.label}</Link>
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
              <label htmlFor={`doc-${i}`}>{doc.label}{doc.required ? <span style={{ color: "#8E0002", fontWeight: 700 }}> · Required</span> : <span> · If available</span>}</label>
            </div>
          ))}
        </div>
      </div>

      <p className="tg-section-title">🏦 Newcomer Banking Programs</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.5rem" }}>
        {BANKS.map(b => (
          <div key={b.name} style={{ background: "#fff", borderRadius: "0.7rem", padding: "0.75rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a0d10" }}>{b.name}</span>
              <span style={{ fontSize: "0.78rem", color: "#6b5a61", marginLeft: "0.5rem" }}>{b.program}</span>
            </div>
            <a href={b.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8E0002", textDecoration: "none", flexShrink: 0 }}>Visit →</a>
          </div>
        ))}
      </div>

      <div className="tg-note tg-note--warning">
        <span className="tg-note__icon">⚠️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Watch for account fees</strong>
          Newcomer package fee waivers typically last 1–2 years. After that, fees apply unless you maintain a minimum balance. Review your account terms before the waiver period ends.
        </span>
      </div>
    </div>
  );
}
