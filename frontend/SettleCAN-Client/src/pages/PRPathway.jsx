// PRPathway.jsx — PR pathway comparison and guidance
import { useState } from "react";
import "../scss/FeaturePages.scss";

// ── CRS score estimator ───────────────────────────────────────────────────────
// Simplified CRS calculator based on IRCC's core human capital factors.
// Not a replacement for the official IRCC tool — for estimation only.
function CRSEstimator() {
  const [form, setForm] = useState({
    age: "25", edu: "bachelors", canadaExp: "1", foreignExp: "1",
    clbFirst: "9", clbSecond: "0", jobOffer: "none", pnp: false, sibling: false,
    hasSpouse: false, spouseEdu: "secondary", spouseExp: "0", spouseClb: "0",
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function calcCRS() {
    let score = 0;

    // Age (max 110 without spouse)
    const age = parseInt(form.age);
    const ageMap = { 17: 0, 18: 99, 19: 105, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110, 25: 110, 26: 110, 27: 110, 28: 110, 29: 110, 30: 105, 31: 99, 32: 94, 33: 88, 34: 83, 35: 77, 36: 72, 37: 66, 38: 61, 39: 55, 40: 50, 41: 39, 42: 28, 43: 17, 44: 6 };
    score += age >= 18 && age <= 44 ? (ageMap[Math.min(age, 44)] ?? 0) : 0;

    // Education (max 150)
    const eduMap = { secondary: 28, one_year: 84, two_year: 91, bachelors: 120, two_degrees: 128, masters: 135, phd: 150 };
    score += eduMap[form.edu] ?? 0;

    // Canadian work experience (max 80)
    const canMap = { 0: 0, 1: 40, 2: 53, 3: 64, 4: 72, 5: 80 };
    score += canMap[Math.min(parseInt(form.canadaExp), 5)] ?? 0;

    // First language (max 136 at CLB 10+)
    const clb = parseInt(form.clbFirst);
    const langMap = { 4: 6, 5: 6, 6: 8, 7: 16, 8: 22, 9: 29, 10: 32, 11: 34, 12: 34 };
    const langScore = (langMap[Math.min(clb, 12)] ?? 0) * 4; // 4 abilities
    score += langScore;

    // Second official language (max 24)
    const clb2 = parseInt(form.clbSecond);
    if (clb2 >= 5) score += clb2 >= 9 ? 24 : clb2 >= 7 ? 22 : clb2 >= 5 ? 4 : 0;

    // Foreign work experience (max 50 combined with Canadian exp)
    const fgnMap = { 0: 0, 1: 13, 2: 25, 3: 25 };
    score += fgnMap[Math.min(parseInt(form.foreignExp), 3)] ?? 0;

    // Job offer
    if (form.jobOffer === "noc_00") score += 200;
    else if (form.jobOffer === "noc_teer1") score += 50;

    // PNP
    if (form.pnp) score += 600;

    // Canadian sibling
    if (form.sibling) score += 15;

    // Spouse factors (simplified)
    if (form.hasSpouse) {
      const spEduMap = { secondary: 2, bachelors: 8, masters: 10, phd: 10 };
      score += spEduMap[form.spouseEdu] ?? 0;
      const spExpMap = { 0: 0, 1: 5, 2: 7, 3: 8, 4: 10, 5: 10 };
      score += spExpMap[Math.min(parseInt(form.spouseExp), 5)] ?? 0;
      const spClb = parseInt(form.spouseClb);
      if (spClb >= 9) score += 20;
      else if (spClb >= 7) score += 16;
      else if (spClb >= 5) score += 4;
    }

    return Math.min(score, 1200);
  }

  const crs = calcCRS();
  const band = crs >= 500 ? { label: "Strong", color: "#15803d", bg: "#e6f9ef" }
    : crs >= 440 ? { label: "Competitive", color: "#b45309", bg: "#fff7e6" }
    : crs >= 380 ? { label: "Moderate", color: "#2563eb", bg: "#eff6ff" }
    : { label: "Low", color: "#8E0002", bg: "#fdeaed" };

  const Field = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b5a61", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
  const sel = (k, opts) => (
    <select value={form[k]} onChange={e => s(k, e.target.value)}
      style={{ border: "1.5px solid #e0d8da", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.85rem", background: "#faf8f9", color: "#1a0d10" }}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div style={{ background: "#fff", border: "1.5px solid #f0eaec", borderRadius: "1rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.05rem", fontWeight: 800, color: "#1a0d10" }}>⚡ CRS Score Estimator</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#9a8a90" }}>Simplified estimate — use the official IRCC tool for a precise score.</p>
        </div>
        <div style={{ background: band.bg, borderRadius: "0.85rem", padding: "0.75rem 1.25rem", textAlign: "center", minWidth: "110px" }}>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: band.color, lineHeight: 1 }}>{crs}</div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: band.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{band.label}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <Field label="Age">
          <input type="number" min={17} max={55} value={form.age} onChange={e => s("age", e.target.value)}
            style={{ border: "1.5px solid #e0d8da", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", fontSize: "0.85rem", background: "#faf8f9" }} />
        </Field>
        <Field label="Education">{sel("edu", [["secondary","High school"],["one_year","1-year diploma"],["two_year","2-year diploma"],["bachelors","Bachelor's"],["two_degrees","Two+ degrees"],["masters","Master's"],["phd","PhD"]])}</Field>
        <Field label="Canadian Work Exp">{sel("canadaExp", [["0","None"],["1","1 year"],["2","2 years"],["3","3 years"],["4","4 years"],["5","5+ years"]])}</Field>
        <Field label="Foreign Work Exp">{sel("foreignExp", [["0","None"],["1","1 year"],["2","2 years"],["3","3+ years"]])}</Field>
        <Field label="English/French (CLB)">{sel("clbFirst", [["4","CLB 4"],["5","CLB 5"],["6","CLB 6"],["7","CLB 7"],["8","CLB 8"],["9","CLB 9"],["10","CLB 10"],["11","CLB 11"],["12","CLB 12+"]])}</Field>
        <Field label="2nd Language (CLB)">{sel("clbSecond", [["0","None"],["5","CLB 5-6"],["7","CLB 7-8"],["9","CLB 9+"]])}</Field>
        <Field label="Job Offer">{sel("jobOffer", [["none","None"],["noc_teer1","TEER 1–3 offer (+50)"],["noc_00","Senior mgr offer (+200)"]])}</Field>
        <Field label="Provincial Nomination">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", paddingTop: "0.3rem" }}>
            <input type="checkbox" checked={form.pnp} onChange={e => s("pnp", e.target.checked)} /> Yes (+600 pts)
          </label>
        </Field>
        <Field label="Canadian Sibling (PR/Citizen)">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", paddingTop: "0.3rem" }}>
            <input type="checkbox" checked={form.sibling} onChange={e => s("sibling", e.target.checked)} /> Yes (+15 pts)
          </label>
        </Field>
        <Field label="Accompanying Spouse/Partner">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", paddingTop: "0.3rem" }}>
            <input type="checkbox" checked={form.hasSpouse} onChange={e => s("hasSpouse", e.target.checked)} /> Yes
          </label>
        </Field>
        {form.hasSpouse && <>
          <Field label="Spouse Education">{sel("spouseEdu", [["secondary","High school or less"],["bachelors","Bachelor's"],["masters","Master's/PhD"]])}</Field>
          <Field label="Spouse Canadian Exp">{sel("spouseExp", [["0","None"],["1","1 year"],["2","2 years"],["3","3 years"],["4","4 years"],["5","5+ years"]])}</Field>
          <Field label="Spouse Language (CLB)">{sel("spouseClb", [["0","None / below 5"],["5","CLB 5-6"],["7","CLB 7-8"],["9","CLB 9+"]])}</Field>
        </>}
      </div>

      <div style={{ background: "#f9f5f6", borderRadius: "0.6rem", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#5a4a50" }}>
        💡 Recent Express Entry draws range from <strong>~470–550</strong> for general rounds and <strong>lower</strong> for category-based draws (healthcare, trades, STEM, French). Check{" "}
        <a href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html" target="_blank" rel="noreferrer" style={{ color: "#8E0002", fontWeight: 700 }}>IRCC draw history →</a>
      </div>
    </div>
  );
}

const PATHWAYS = [
  {
    id: "ee",
    icon: "⚡",
    name: "Express Entry",
    tag: "Most Common",
    tagCls: "fp-tag--green",
    timeToPR: "~6 months (after ITA)",
    bestFor: "Skilled workers with post-secondary education, work experience, and strong English/French",
    streams: [
      { name: "Federal Skilled Worker (FSW)", req: "67+ points on selection grid. Must have 1 year skilled work experience OR a qualifying job offer. No Canadian work experience required." },
      { name: "Canadian Experience Class (CEC)", req: "1+ year of skilled work experience in Canada (TEER 0–3) within the last 3 years. No job offer needed. Best for PGWP holders." },
      { name: "Federal Skilled Trades (FST)", req: "2 years of full-time skilled trade work in past 5 years. Job offer or certificate of qualification required." },
    ],
    tips: "Boost your CRS score by: improving IELTS score (each band jump adds ~50–80 points), getting a provincial nomination (+600 pts), completing a Canadian degree, or obtaining a valid job offer.",
    minCRS: "Varies by draw (typically 470–550 for general rounds; lower for category-based draws)",
    processTime: "6 months (80% of complete applications)",
  },
  {
    id: "pnp",
    icon: "🏙️",
    name: "Provincial Nominee Program (PNP)",
    tag: "Province-Specific",
    tagCls: "fp-tag--blue",
    timeToPR: "15–19 months total",
    bestFor: "Candidates with ties to a specific province: job offer, education, or community connection",
    streams: [
      { name: "Ontario (OINP)", req: "Human Capital Priorities, French-speaking Skilled Worker, Employer Job Offer streams. In-demand workers with NOI to the province." },
      { name: "BC PNP Tech", req: "Fast-track for tech workers in BC. Job offer required. Many NOC codes eligible." },
      { name: "Alberta Advantage Immigration Program (AAIP)", req: "Alberta Opportunity stream for workers already employed in Alberta. Express Entry-aligned stream." },
      { name: "Saskatchewan (SINP)", req: "Occupations in-demand list. Express Entry and Occupations In-Demand sub-categories." },
    ],
    tips: "Express Entry-linked PNPs add 600 CRS points — essentially a guaranteed ITA. Non-EE PNPs go through a separate federal processing stream.",
    minCRS: "N/A for non-EE streams; EE-linked PNPs add 600 pts",
    processTime: "6 months (federal) + provincial nomination processing (3–6 months)",
  },
  {
    id: "atlantic",
    icon: "🌊",
    name: "Atlantic Immigration Program (AIP)",
    tag: "Atlantic Provinces",
    tagCls: "fp-tag--blue",
    timeToPR: "~12 months",
    bestFor: "International graduates from Atlantic institutions OR skilled workers with a job offer in Atlantic Canada",
    streams: [
      { name: "Atlantic High-Skilled Program", req: "NOC TEER 0, 1, 2, or 3 job offer from a designated Atlantic employer. 1 year relevant work experience." },
      { name: "Atlantic Intermediate-Skilled Program", req: "NOC TEER 4 job offer from a designated Atlantic employer. 1 year relevant work experience." },
      { name: "Atlantic International Graduate Program", req: "Graduated from an eligible institution in NL, NS, NB, or PEI in the past 2 years. No work experience required." },
    ],
    tips: "Atlantic provinces have labour shortages — employer designation makes them motivated to hire newcomers. This program does NOT use CRS points.",
    minCRS: "Not applicable",
    processTime: "~12 months",
  },
  {
    id: "family",
    icon: "👨‍👩‍👧",
    name: "Family Sponsorship",
    tag: "Family Ties",
    tagCls: "fp-tag--gray",
    timeToPR: "12–24 months",
    bestFor: "Individuals with a Canadian citizen or permanent resident spouse, partner, child, or parent",
    streams: [
      { name: "Spousal / Partner Sponsorship", req: "Canadian citizen or PR sponsors their spouse, common-law partner, or conjugal partner. Inland (spouse in Canada) or Outland." },
      { name: "Dependent Child Sponsorship", req: "Canadian sponsor their dependent child under 22 years old (or incapable of self-support)." },
      { name: "Parents & Grandparents Program (PGP)", req: "Annual intake cap. Sponsor must meet LICO income threshold. SuperVisa is an alternative allowing 5-year stays." },
    ],
    tips: "Inland spousal applicants can apply for an Open Work Permit simultaneously, allowing them to work while PR is processed.",
    minCRS: "Not applicable",
    processTime: "Spouse: ~12 months (outland), ~12 months (inland); Parents: 24+ months",
  },
];

const PR_STEPS = [
  { num: "01", title: "Determine your pathway", body: "Use the 'Come to Canada' wizard at canada.ca/immigration or consult a Regulated Canadian Immigration Consultant (RCIC)." },
  { num: "02", title: "Meet the eligibility criteria", body: "Work experience, education credentials, language tests (IELTS/CELPIP/TEF), and NOC classification all matter." },
  { num: "03", title: "Create an Express Entry profile (if applicable)", body: "Enter your profile into the pool. Your CRS score determines when you receive an Invitation to Apply (ITA)." },
  { num: "04", title: "Receive an ITA or Provincial Nomination", body: "Wait for a draw (EE) or apply directly (PNP, AIP, Family). ITAs are issued in rounds every ~2 weeks." },
  { num: "05", title: "Submit complete PR application within 60 days", body: "Gather medical exams, police certificates, photos, and all supporting documents. IRCC is strict about completeness." },
  { num: "06", title: "Biometrics and background checks", body: "Provide biometrics at an ASC (Application Support Centre). IRCC conducts security and criminal background checks." },
  { num: "07", title: "Receive Confirmation of Permanent Residence (COPR)", body: "Once approved, you will receive your COPR. You must land in Canada before the expiry date on the COPR to activate PR status." },
];

export default function PRPathway() {
  const [active, setActive] = useState("ee");
  const current = PATHWAYS.find(p => p.id === active);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🍁 Permanent Residency</span>
        <h1 className="fp-header__title">PR Pathway Guidance</h1>
        <p className="fp-header__subtitle">
          Compare all major pathways to Canadian Permanent Residency — Express Entry, Provincial Nominee Program,
          Atlantic Immigration, and Family Sponsorship.
        </p>
      </div>

      {/* Stats */}
      <div className="fp-stats">
        <div className="fp-stat"><span className="fp-stat__num">4</span><span className="fp-stat__label">Main Pathways</span></div>
        <div className="fp-stat"><span className="fp-stat__num">~6mo</span><span className="fp-stat__label">Fastest PR (EE)</span></div>
        <div className="fp-stat"><span className="fp-stat__num">60</span><span className="fp-stat__label">Days to Apply (after ITA)</span></div>
        <div className="fp-stat"><span className="fp-stat__num">1095</span><span className="fp-stat__label">Days for Citizenship</span></div>
      </div>

      {/* Pathway selector tabs */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {PATHWAYS.map(p => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`fp-btn ${active === p.id ? "fp-btn--primary" : "fp-btn--ghost"}`}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Pathway detail */}
      {current && (
        <div className="fp-card fp-card--accent" style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 0.2rem", color: "#1a0d10" }}>{current.icon} {current.name}</h2>
              <span className={`fp-tag ${current.tagCls}`}>{current.tag}</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#8E0002" }}>{current.timeToPR}</div>
                <div style={{ fontSize: "0.68rem", color: "#9a8a90", fontWeight: 600, textTransform: "uppercase" }}>Time to PR</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#8E0002" }}>{current.processTime}</div>
                <div style={{ fontSize: "0.68rem", color: "#9a8a90", fontWeight: 600, textTransform: "uppercase" }}>Processing</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "0.88rem", color: "#5a4a50", margin: "0.75rem 0 0", lineHeight: 1.5 }}>
            <strong>Best for:</strong> {current.bestFor}
          </p>

          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#8E0002", margin: "0 0 0.5rem", letterSpacing: "0.07em" }}>Streams &amp; Requirements</p>
            {current.streams.map(s => (
              <div key={s.name} style={{ background: "#fdf7f8", borderRadius: "0.6rem", padding: "0.65rem 0.8rem", marginBottom: "0.5rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", margin: "0 0 0.2rem", color: "#1a0d10" }}>{s.name}</p>
                <p style={{ fontSize: "0.82rem", color: "#5a4a50", margin: 0, lineHeight: 1.5 }}>{s.req}</p>
              </div>
            ))}
          </div>

          <div className="fp-alert fp-alert--info" style={{ marginTop: "0.75rem" }}>
            <span className="fp-alert__icon">💡</span>
            <span className="fp-alert__text"><strong className="fp-alert__title">Pro Tip</strong>{current.tips}</span>
          </div>
        </div>
      )}

      {/* CRS estimator */}
      <div className="fp-section">
        <CRSEstimator />
      </div>

      {/* Pathway comparison table */}
      <div className="fp-section">
        <h2 className="fp-section__title">📊 Pathway Comparison at a Glance</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="fp-table">
            <thead>
              <tr>
                <th>Pathway</th>
                <th>CRS Points?</th>
                <th>Job Offer Required?</th>
                <th>Canadian Exp. Required?</th>
                <th>Estimated Time to PR</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Express Entry — FSW",     crs: "Yes",  job: "Not required (helps)",  exp: "Not required",          time: "~6 months" },
                { name: "Express Entry — CEC",     crs: "Yes",  job: "Not required",          exp: "1 year in Canada",      time: "~6 months" },
                { name: "Express Entry — FST",     crs: "Yes",  job: "Or trade certificate",  exp: "2 yrs skilled trade",   time: "~6 months" },
                { name: "PNP (EE-linked)",         crs: "+600", job: "Varies by stream",      exp: "Varies by province",    time: "9–12 months" },
                { name: "PNP (non-EE)",            crs: "No",   job: "Often required",        exp: "Varies by province",    time: "15–19 months" },
                { name: "Atlantic Immigration",    crs: "No",   job: "Yes — designated employer", exp: "Not for graduates", time: "~12 months" },
                { name: "Family Sponsorship",      crs: "No",   job: "No",                    exp: "No",                    time: "12–24 months" },
              ].map(row => (
                <tr key={row.name}>
                  <td><strong style={{ fontSize: "0.83rem" }}>{row.name}</strong></td>
                  <td style={{ fontSize: "0.82rem" }}>{row.crs}</td>
                  <td style={{ fontSize: "0.82rem" }}>{row.job}</td>
                  <td style={{ fontSize: "0.82rem" }}>{row.exp}</td>
                  <td style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8E0002" }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-step PR process */}
      <div className="fp-section">
        <h2 className="fp-section__title">🗺️ The PR Application Process</h2>
        <div className="fp-steps">
          {PR_STEPS.map(step => (
            <div key={step.num} className="fp-step">
              <div className="fp-step__dot" />
              <div className="fp-step__num">Step {step.num}</div>
              <div className="fp-step__title">{step.title}</div>
              <div className="fp-step__body">{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-alert fp-alert--warning">
        <span className="fp-alert__icon">⚠️</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Consult a Regulated Professional</strong>
          Immigration law is complex. Only use Regulated Canadian Immigration Consultants (RCIC) listed at iccrc-crcic.ca or lawyers from your provincial law society. Avoid unauthorized "consultants."
        </span>
      </div>
    </div>
  );
}
