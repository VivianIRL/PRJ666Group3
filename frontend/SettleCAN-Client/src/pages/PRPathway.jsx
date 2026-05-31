// PRPathway.jsx — PR pathway comparison and guidance
import { useState } from "react";
import "../scss/FeaturePages.scss";

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
