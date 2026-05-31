// PersonalizedChecklists.jsx — generate a tailored checklist by status + province
import { useState } from "react";
import "../scss/FeaturePages.scss";

const STATUS_TASKS = {
  "International Student": [
    "Apply for Social Insurance Number (SIN) at Service Canada",
    "Open a Canadian bank account (newcomer package recommended)",
    "Register for provincial health card (check your province's wait period)",
    "Confirm your DLI status and enrollment is full-time",
    "Understand the 24-hr off-campus work rule",
    "Apply for co-op work permit if your program requires it",
    "Research PGWP eligibility and apply within 180 days of graduation",
    "Join your school's international student office for support",
    "Get student health insurance through your institution",
    "Apply for TTC / transit card and student discount",
  ],
  "Work Permit Holder": [
    "Apply for SIN at Service Canada",
    "Open a Canadian bank account",
    "Register for provincial health card",
    "Confirm your work permit conditions (employer, location, NOC)",
    "Never work for a different employer without a new permit",
    "Set renewal reminder 90 days before your permit expires",
    "Explore PR pathways: CEC, PNP, or LMIA-based sponsorship",
    "Accumulate 1 year of TEER 0–3 work experience for CEC",
    "Improve language test score (IELTS/CELPIP) for Express Entry",
    "File Canadian taxes — even if your income is from abroad",
  ],
  "Permanent Resident": [
    "Activate your PR card (land before COPR expiry date)",
    "Apply for SIN (new PR SIN does not start with 9)",
    "Register children in school via local school board",
    "Apply for provincial health card immediately",
    "Open a Canadian bank account",
    "Enroll in LINC / ESL language classes if needed (free)",
    "Start building Canadian credit history",
    "Keep track of physical presence days for citizenship (need 1095 in 5 years)",
    "Renew PR card 9 months before expiry (valid for 5 years)",
    "File Canadian taxes each April",
  ],
  "Refugee / Protected Person": [
    "Receive your Protected Person determination document",
    "Apply for Convention Refugee Travel Document (CRTD) for travel",
    "Apply for SIN",
    "Register for provincial health (you may be covered by IFHP initially)",
    "Connect with a UNHCR-affiliated settlement agency near you",
    "Open a bank account (some banks have newcomer/refugee accounts)",
    "Apply for PR as a protected person — you are eligible immediately",
    "Enroll in LINC / ESL language classes (free)",
    "Apply for Federal Government assistance (RAP program)",
    "Access legal aid if your refugee claim is still pending",
  ],
  "Visitor": [
    "Understand your authorized stay (usually 6 months from entry)",
    "Do NOT work without authorization — get a work permit first",
    "Apply for a study permit if you plan to attend school",
    "Apply for a Super Visa if visiting parents/grandparents in Canada",
    "Extend your stay via IRCC before your authorized period ends",
    "Get visitor health insurance — provincial health does not cover visitors",
  ],
};

const PROVINCE_TIPS = {
  "Ontario": ["OHIP (health card) has a 3-month waiting period", "Apply for OHIP on Day 1 to start the clock", "Presto card for TTC, GO Transit, MiWay, and other transit systems", "Landlord must use Ontario standard lease form"],
  "British Columbia": ["MSP (health coverage) — apply on arrival, no waiting period", "Compass card for TransLink (Metro Vancouver)", "Provincial nominee program: BC PNP Tech Pilot for tech workers", "RTB (Residential Tenancy Branch) for housing disputes"],
  "Alberta": ["No provincial health wait period — register for AHCIP immediately", "No provincial sales tax (PST) — lower cost of living", "AAIP for workers already employed in Alberta", "Alberta has no rent control — prices can rise significantly"],
  "Quebec": ["You must apply to MIDI (immigration Quebec) first for most pathways", "Knowledge of French is highly advantageous — CELPIP not accepted, use TEF/TCF", "RAMQ (health coverage) has a 3-month wait except for certain situations", "OPUS card for STM (Montreal metro/bus)"],
  "Manitoba": ["Nominee program: MPNP — strong pathway for workers in Manitoba", "Blue Cross provincial health — apply on arrival", "Winnipeg has a large, established newcomer community", "WRHA for public health services"],
  "Nova Scotia": ["Atlantic Immigration Program (AIP) — employer-sponsored pathway", "MSI health card — 3-month wait unless covered by a federal program", "NSNP for skilled workers with Nova Scotia ties", "Halifax is the main centre — lower cost of living than Toronto/Vancouver"],
};

const PROVINCES = Object.keys(PROVINCE_TIPS);
const STATUSES  = Object.keys(STATUS_TASKS);

export default function PersonalizedChecklists() {
  const [status,   setStatus]   = useState("");
  const [province, setProvince] = useState("");
  const [checked,  setChecked]  = useState({});
  const [generated, setGenerated] = useState(false);

  const tasks = generated && status ? STATUS_TASKS[status] ?? [] : [];
  const tips  = generated && province ? PROVINCE_TIPS[province] ?? [] : [];
  const done  = tasks.filter((_, i) => checked[i]).length;

  function generate() {
    if (status) { setChecked({}); setGenerated(true); }
  }

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">📝 Personalization</span>
        <h1 className="fp-header__title">Personalized Checklists</h1>
        <p className="fp-header__subtitle">
          Select your immigration status and province to get a tailored settlement checklist
          with province-specific tips.
        </p>
      </div>

      {/* Selector */}
      <div className="fp-card" style={{ maxWidth: 560 }}>
        <h3 className="fp-card__title">Generate Your Checklist</h3>

        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2b1a1f", display: "block", marginBottom: "0.3rem" }}>
          Immigration Status *
        </label>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setGenerated(false); }}
          style={{ width: "100%", border: "1.5px solid #e0d8da", borderRadius: "0.65rem", padding: "0.55rem 0.85rem", fontSize: "0.9rem", background: "#faf8f9", marginBottom: "0.85rem" }}
        >
          <option value="">Select your status…</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2b1a1f", display: "block", marginBottom: "0.3rem" }}>
          Province / Territory (optional)
        </label>
        <select
          value={province}
          onChange={e => { setProvince(e.target.value); setGenerated(false); }}
          style={{ width: "100%", border: "1.5px solid #e0d8da", borderRadius: "0.65rem", padding: "0.55rem 0.85rem", fontSize: "0.9rem", background: "#faf8f9", marginBottom: "1rem" }}
        >
          <option value="">Select province…</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button
          className="fp-btn fp-btn--primary"
          onClick={generate}
          disabled={!status}
          style={{ opacity: status ? 1 : 0.5 }}
        >
          Generate My Checklist →
        </button>
      </div>

      {/* Generated checklist */}
      {generated && tasks.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a0d10", margin: 0 }}>
              {status} — Settlement Checklist
            </h2>
            <span style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{done}/{tasks.length} complete</span>
          </div>

          <div className="fp-progress" style={{ marginBottom: "0.5rem" }}>
            <div className="fp-progress__bar" style={{ width: `${tasks.length ? (done/tasks.length)*100 : 0}%` }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {tasks.map((task, i) => (
              <label
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "0.6rem",
                  background: checked[i] ? "#f6fff9" : "#fff",
                  borderRadius: "0.75rem", padding: "0.75rem 1rem",
                  cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                  style={{ width: 16, height: 16, accentColor: "#8E0002", flexShrink: 0, marginTop: 2 }}
                />
                <span style={{ fontSize: "0.875rem", color: checked[i] ? "#9a8a90" : "#1a0d10", textDecoration: checked[i] ? "line-through" : "none", lineHeight: 1.45 }}>
                  {task}
                </span>
              </label>
            ))}
          </div>

          {/* Province tips */}
          {tips.length > 0 && (
            <div className="fp-card fp-card--info" style={{ marginTop: "0.5rem" }}>
              <h3 className="fp-card__title">📍 {province}-Specific Tips</h3>
              <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
                {tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "#3a2a30", marginBottom: "0.3rem" }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
