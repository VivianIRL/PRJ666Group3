// TaxReturnGuide.jsx — file a Canadian income tax return as a newcomer
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/TaskGuide.scss";

const FREE_SOFTWARE = [
  { name: "Wealthsimple Tax",  note: "Free for all, NETFILE certified, very user-friendly", url: "https://www.wealthsimple.com/en-ca/tax" },
  { name: "StudioTax",         note: "Free, Windows/Mac/mobile, NETFILE certified",          url: "https://www.studiotax.com" },
  { name: "SimpleTax (now Wealthsimple)", note: "Merged into Wealthsimple Tax",             url: "https://www.wealthsimple.com/en-ca/tax" },
  { name: "UFile Free",        note: "Free for students, seniors, and simple returns",       url: "https://www.ufile.ca" },
  { name: "NETFILE-certified tools", note: "Full list of CRA-approved software",            url: "https://www.canada.ca/en/revenue-agency/services/e-services/e-filing-individuals/about-netfile/certified-software-netfile-program.html" },
];

const STEPS = [
  {
    title: "Determine your tax year and residency status",
    body: "The Canadian tax year is January 1 – December 31. The filing deadline is April 30. As a newcomer, you file as a 'part-year resident' in your first year — from your arrival date to December 31. Even with zero income, you must file to access benefits (GST/HST credit, carbon rebate, etc.).",
    docs: [],
    link: null,
  },
  {
    title: "Gather all tax slips",
    body: "Your employer sends a T4 slip (employment income) by the end of February. Your school sends a T2202 (tuition tax credit). Banks send T5 slips (investment income). You should receive all slips by early March. If you earned money outside Canada before arriving, you may need to report it.",
    docs: ["T4 slip (from each employer)", "T2202 (from your school — for tuition credit)", "T5 (from your bank — if applicable)", "Proof of arrival date in Canada"],
    link: null,
  },
  {
    title: "Get a CRA My Account",
    body: "Register for a CRA (Canada Revenue Agency) My Account — it's free and lets you submit online (NETFILE), track your return, receive refunds faster, and see your benefit information. Use your previous year's return or call CRA to verify your identity.",
    docs: [],
    link: { label: "Register for CRA My Account", url: "https://www.canada.ca/en/revenue-agency/services/e-services/cra-login-services.html" },
  },
  {
    title: "Choose free tax software",
    body: "All the software listed below is certified by CRA and free for simple returns. Wealthsimple Tax is the most newcomer-friendly. The software guides you through every step — you don't need an accountant for a standard student or employee return.",
    docs: [],
    link: null,
  },
  {
    title: "Complete and file your return",
    body: "The software imports your tax slips where possible. Enter your arrival date, province of residence on December 31, and any income earned before arriving in Canada (if applicable). Review the summary, then NETFILE directly to CRA — most refunds arrive in 2 weeks.",
    docs: [],
    link: { label: "Submit via NETFILE", url: "https://www.canada.ca/en/revenue-agency/services/e-services/e-filing-individuals/about-netfile/using-netfile-certified-software.html" },
  },
  {
    title: "Apply for benefits you are now entitled to",
    body: "Filing your return automatically triggers assessment for: GST/HST Credit (quarterly tax-free payments), Canada Carbon Rebate (if in eligible provinces), and Canada Child Benefit (if you have children). These benefits require an annual filed return — you miss them if you don't file.",
    docs: [],
    link: { label: "Canada benefits for newcomers", url: "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/benefit-amounts-newcomers-canada.html" },
  },
];

const DOCS = [
  { label: "T4 slip (one per employer)",          required: true  },
  { label: "T2202 tuition tax receipt (from DLI)", required: false },
  { label: "T5 investment income slip (from bank)", required: false },
  { label: "SIN number",                           required: true  },
  { label: "Proof of Canadian arrival date",       required: true  },
  { label: "Passport (for identity verification)", required: true  },
];

const BENEFITS = [
  { name: "GST/HST Credit",         desc: "Quarterly tax-free payment to low/moderate-income individuals. Up to ~$650/year per individual.", when: "Assessed automatically when you file" },
  { name: "Canada Carbon Rebate",   desc: "Quarterly payment for residents of ON, MB, SK, AB, NS, PEI, NL, NB. Amount depends on province and family size.", when: "Assessed automatically when you file" },
  { name: "Canada Child Benefit (CCB)", desc: "Monthly tax-free payment for families with children under 18. Up to ~$7,437/year per child under 6.", when: "File return + complete RC66 form" },
  { name: "Tuition Tax Credit",     desc: "Non-refundable credit for eligible tuition paid. T2202 slip from your school. Can carry forward to future years.", when: "Claim on your return with T2202" },
];

export default function TaxReturnGuide() {
  const [checked, setChecked] = useState({});

  return (
    <div className="tg-page">
      <Link to="/tasks" className="tg-back">← Back to My Tasks</Link>

      <div className="tg-hero">
        <div className="tg-hero__eyebrow">Tax & Finance · Step-by-Step Guide</div>
        <h1 className="tg-hero__title">File Your Canadian Income Tax Return</h1>
        <div className="tg-hero__meta">
          <span className="tg-hero__chip">📅 Due April 30</span>
          <span className="tg-hero__chip">⏱ 1–3 hours</span>
          <span className="tg-hero__chip">🌐 Online (NETFILE)</span>
          <span className="tg-hero__chip">💰 Free software available</span>
        </div>
      </div>

      <div className="tg-note tg-note--success">
        <span className="tg-note__icon">✅</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">File even with zero income</strong>
          Filing with no income establishes your tax residency and unlocks the GST/HST credit, carbon rebate, and child benefits. First-time filers who don't file miss out on thousands of dollars in benefits.
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
                <a href={step.link.url} target="_blank" rel="noreferrer" className="tg-step__link">🔗 {step.link.label}</a>
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

      <p className="tg-section-title">💻 Free Tax Software</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.5rem" }}>
        {FREE_SOFTWARE.map(s => (
          <div key={s.name} style={{ background: "#fff", borderRadius: "0.7rem", padding: "0.7rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.87rem", color: "#1a0d10" }}>{s.name}</span>
              <span style={{ fontSize: "0.77rem", color: "#6b5a61", marginLeft: "0.5rem" }}>{s.note}</span>
            </div>
            <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8E0002", textDecoration: "none", flexShrink: 0 }}>Open →</a>
          </div>
        ))}
      </div>

      <p className="tg-section-title">🎁 Benefits You Unlock by Filing</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {BENEFITS.map(b => (
          <div key={b.name} style={{ background: "#fff", borderRadius: "0.85rem", padding: "0.85rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderLeft: "3px solid #8E0002" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a0d10", marginBottom: "0.2rem" }}>{b.name}</div>
            <div style={{ fontSize: "0.8rem", color: "#5a4a50", marginBottom: "0.3rem", lineHeight: 1.5 }}>{b.desc}</div>
            <div style={{ fontSize: "0.72rem", color: "#8E0002", fontWeight: 600 }}>{b.when}</div>
          </div>
        ))}
      </div>

      <div className="tg-note tg-note--warning">
        <span className="tg-note__icon">⚠️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Late filing penalty</strong>
          If you owe taxes and file late, CRA charges a 5% late-filing penalty plus 1% per month (up to 12 months). If you have a refund or zero balance, there is no penalty — but file anyway to start your benefits.
        </span>
      </div>

      <div className="tg-links">
        <p className="tg-links__title">🔗 Official Resources</p>
        <ul className="tg-links__list">
          <li><a href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/newcomers-canada-individuals.html" target="_blank" rel="noreferrer">Filing taxes as a newcomer — CRA guide</a></li>
          <li><a href="https://www.canada.ca/en/revenue-agency/services/e-services/cra-login-services.html" target="_blank" rel="noreferrer">CRA My Account — register or sign in</a></li>
          <li><a href="https://www.canada.ca/en/revenue-agency/services/child-family-benefits/gsthstc-isyourentitled.html" target="_blank" rel="noreferrer">Am I eligible for the GST/HST Credit?</a></li>
        </ul>
      </div>
    </div>
  );
}
