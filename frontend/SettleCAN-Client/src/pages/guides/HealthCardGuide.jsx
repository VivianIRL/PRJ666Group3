// HealthCardGuide.jsx — register for provincial health insurance in Canada
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/TaskGuide.scss";

const PROVINCES = [
  { prov: "Ontario",          program: "OHIP",  wait: "3 months", office: "ServiceOntario", url: "https://www.ontario.ca/page/apply-ohip-and-get-health-card" },
  { prov: "British Columbia", program: "MSP",   wait: "None",     office: "Health Insurance BC", url: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/enrolment/how-to-enrol" },
  { prov: "Alberta",          program: "AHCIP", wait: "None",     office: "Alberta Health",  url: "https://www.alberta.ca/ahcip-apply.aspx" },
  { prov: "Quebec",           program: "RAMQ",  wait: "3 months (some exceptions)", office: "RAMQ", url: "https://www.ramq.gouv.qc.ca/en/citizens/health-insurance/register" },
  { prov: "Manitoba",         program: "Manitoba Health", wait: "None", office: "Manitoba Health", url: "https://www.gov.mb.ca/health/mhsip/index.html" },
  { prov: "Nova Scotia",      program: "MSI",   wait: "3 months", office: "MSI (Medavie Blue Cross)", url: "https://msi.medavie.ca/en/MSI/" },
  { prov: "Saskatchewan",     program: "Saskatchewan Health Card", wait: "3 months", office: "eHealth Saskatchewan", url: "https://www.ehealthsask.ca/residents/health-cards" },
  { prov: "New Brunswick",    program: "Medicare NB", wait: "3 months", office: "Medicare NB", url: "https://www2.gnb.ca/content/gnb/en/departments/health/Medicare.html" },
];

const STEPS = [
  {
    title: "Arrive in Canada and start the clock",
    body: "In most provinces, your 3-month waiting period begins on your arrival date or the date you become a permanent resident — NOT the date you apply. Apply on Day 1 so the clock starts as early as possible.",
    docs: [],
    link: null,
  },
  {
    title: "Check your province's health authority website",
    body: "Each province has its own health card program. The required documents and application process differ. Find your province in the table below for the correct office and link.",
    docs: [],
    link: null,
  },
  {
    title: "Gather your required documents",
    body: "Most provinces require: proof of identity, proof of Canadian immigration status, and proof of residence in the province. Bring originals — photocopies are usually not accepted.",
    docs: ["Passport", "Study permit, work permit, or PR card", "Proof of address in the province (lease, utility bill, or bank statement)"],
    link: null,
  },
  {
    title: "Submit your application",
    body: "Most provinces allow applications in person, by mail, or online. Ontario (OHIP) requires an in-person visit to a ServiceOntario location. BC (MSP) can be done online through Health Insurance BC.",
    docs: [],
    link: null,
  },
  {
    title: "Get interim coverage and wait for your card",
    body: "After the waiting period ends, you will receive your health card by mail. During the wait, purchase private health insurance — many universities and employers offer group coverage for newcomers.",
    docs: [],
    link: null,
  },
];

const DOCS = [
  { label: "Passport",                    required: true  },
  { label: "Study permit, work permit, or PR card", required: true },
  { label: "Proof of province address (lease, utility bill, bank statement)", required: true },
  { label: "Student ID or acceptance letter (for some provinces)", required: false },
];

export default function HealthCardGuide() {
  const [checked, setChecked] = useState({});

  return (
    <div className="tg-page">
      <Link to="/tasks" className="tg-back">← Back to My Tasks</Link>

      <div className="tg-hero">
        <div className="tg-hero__eyebrow">Health · Step-by-Step Guide</div>
        <h1 className="tg-hero__title">Register for Provincial Health Insurance</h1>
        <div className="tg-hero__meta">
          <span className="tg-hero__chip">⏱ 30–45 minutes to apply</span>
          <span className="tg-hero__chip">📄 3 documents</span>
          <span className="tg-hero__chip">🏥 In person or online</span>
          <span className="tg-hero__chip">💰 Free</span>
        </div>
      </div>

      <div className="tg-note tg-note--warning">
        <span className="tg-note__icon">⚠️</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Apply on Day 1 — the waiting period starts from arrival</strong>
          In provinces with a 3-month wait (Ontario, Quebec, Nova Scotia, etc.), the clock starts on arrival. Apply immediately — delaying your application delays your coverage.
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

      <p className="tg-section-title">🗺️ By Province</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", background: "#fff", borderRadius: "0.85rem", overflow: "hidden", boxShadow: "0 3px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem" }}>
        <thead>
          <tr style={{ background: "#fdeaed" }}>
            <th style={{ padding: "0.6rem 0.9rem", textAlign: "left", color: "#8E0002", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Province</th>
            <th style={{ padding: "0.6rem 0.9rem", textAlign: "left", color: "#8E0002", fontSize: "0.7rem", textTransform: "uppercase" }}>Program</th>
            <th style={{ padding: "0.6rem 0.9rem", textAlign: "left", color: "#8E0002", fontSize: "0.7rem", textTransform: "uppercase" }}>Wait Period</th>
            <th style={{ padding: "0.6rem 0.9rem", textAlign: "left", color: "#8E0002", fontSize: "0.7rem", textTransform: "uppercase" }}>Apply</th>
          </tr>
        </thead>
        <tbody>
          {PROVINCES.map(row => (
            <tr key={row.prov} style={{ borderBottom: "1px solid #f5eff2" }}>
              <td style={{ padding: "0.6rem 0.9rem", fontWeight: 700, color: "#1a0d10" }}>{row.prov}</td>
              <td style={{ padding: "0.6rem 0.9rem" }}>{row.program}</td>
              <td style={{ padding: "0.6rem 0.9rem" }}>
                <span style={{ background: row.wait === "None" ? "#e6f9ef" : "#fff3e0", color: row.wait === "None" ? "#15803d" : "#c2410c", borderRadius: "999px", padding: "0.15rem 0.55rem", fontSize: "0.72rem", fontWeight: 700 }}>
                  {row.wait}
                </span>
              </td>
              <td style={{ padding: "0.6rem 0.9rem" }}>
                <a href={row.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8E0002", textDecoration: "none" }}>Apply →</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tg-note tg-note--info">
        <span className="tg-note__icon">💡</span>
        <span className="tg-note__text">
          <strong className="tg-note__title">Coverage during the wait</strong>
          During the waiting period, check if your school or employer provides group health insurance. The Interim Federal Health Program (IFHP) covers some refugee claimants. Travel insurance may also be extended to cover the waiting period.
        </span>
      </div>
    </div>
  );
}
