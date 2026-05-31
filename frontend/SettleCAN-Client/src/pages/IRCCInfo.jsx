// IRCCInfo.jsx — Official IRCC information integration
import "../scss/FeaturePages.scss";

const PORTALS = [
  { icon: "🌐", title: "IRCC Online Portal", desc: "Apply for, renew, or check status of study permits, work permits, PR, and citizenship.", url: "https://www.canada.ca/en/immigration-refugees-citizenship.html", tag: "Main Portal" },
  { icon: "📊", title: "Processing Times", desc: "Check current processing times for your specific application type and country of origin.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html", tag: "Live Data" },
  { icon: "🔑", title: "IRCC Secure Account", desc: "Log in to your IRCC account to submit applications, upload documents, and get messages.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html", tag: "Login" },
  { icon: "📋", title: "Application Checklist Builder", desc: "Use the official IRCC tool to generate a personalized document checklist for your application.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/come-canada-tool-immigration-express-entry.html", tag: "Tool" },
  { icon: "💰", title: "Fees & Payment", desc: "Official fee schedule for all IRCC applications including biometrics and right of PR fee.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence/collect-forms/pay-fee.html", tag: "Fees" },
  { icon: "📞", title: "IRCC Help Centre", desc: "Submit a web form, find a service centre, or use the IRCC virtual assistant (Emma).", url: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc.html", tag: "Contact" },
];

const PROCESSING = [
  { type: "Study Permit (outside Canada)", time: "7–12 weeks", note: "Varies by country. Use Student Direct Stream (SDS) for faster processing from eligible countries." },
  { type: "Study Permit (inside Canada)", time: "5–8 weeks", note: "Apply well before your current status expires. Maintained status applies while you wait." },
  { type: "Open Work Permit (PGWP)", time: "3–5 months", note: "Apply within 180 days of receiving final marks confirmation. Single-entry vs. multiple-entry matters." },
  { type: "Employer-Specific Work Permit", time: "2–5 months", note: "Requires LMIA (Labour Market Impact Assessment) from your employer in most cases." },
  { type: "Express Entry – Final Decision", time: "6 months", note: "IRCC targets 80% of complete applications within 6 months after ITA is accepted." },
  { type: "PR Card (renewal)", time: "45 days", note: "Must be physically in Canada to apply. Apply at least 9 months before expiry." },
  { type: "Citizenship Application", time: "12–24 months", note: "You must have 1095 days of physical presence in Canada in the last 5 years." },
  { type: "Spousal Sponsorship (inland)", time: "12 months", note: "Sponsor must meet minimum income requirements. Spouse can apply for open work permit." },
];

const STREAMS = [
  { name: "Express Entry", streams: ["Federal Skilled Worker (FSW)", "Canadian Experience Class (CEC)", "Federal Skilled Trades (FST)"], note: "Points-based system using Comprehensive Ranking System (CRS). Draws happen regularly." },
  { name: "Provincial Nominee Program (PNP)", streams: ["Ontario Immigrant Nominee Program (OINP)", "BC PNP Tech Pilot", "Alberta Advantage Immigration Program", "Saskatchewan Immigrant Nominee Program (SINP)"], note: "Provinces nominate candidates; 600 CRS points bonus added for Express Entry-linked streams." },
  { name: "Student-to-PR Pathways", streams: ["Post-Graduation Work Permit (PGWP)", "Canadian Experience Class (CEC)", "Atlantic Immigration Program (AIP)"], note: "International graduates who work in Canada for 1 year+ become competitive for CEC." },
  { name: "Family Sponsorship", streams: ["Spousal/Partner Sponsorship", "Child Sponsorship", "Parent & Grandparent Program (PGP)"], note: "PGP has an annual cap. SuperVisa is an alternative allowing 5-year visits." },
];

export default function IRCCInfo() {
  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🏛️ Official Sources</span>
        <h1 className="fp-header__title">IRCC Information Integration</h1>
        <p className="fp-header__subtitle">
          Direct links to official Immigration, Refugees and Citizenship Canada (IRCC) portals,
          current processing times, and all major immigration streams.
        </p>
      </div>

      <div className="fp-alert fp-alert--info">
        <span className="fp-alert__icon">ℹ️</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Always use official sources</strong>
          All links below go directly to canada.ca. Be cautious of third-party immigration websites that may charge for free government services.
        </span>
      </div>

      {/* Official portals */}
      <div className="fp-section">
        <h2 className="fp-section__title">🌐 Official IRCC Portals</h2>
        <div className="fp-grid fp-grid--3">
          {PORTALS.map(p => (
            <div key={p.title} className="fp-card">
              <span className="fp-card__icon">{p.icon}</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 className="fp-card__title">{p.title}</h3>
                <span className="fp-tag fp-tag--blue">{p.tag}</span>
              </div>
              <p className="fp-card__body">{p.desc}</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ marginTop: "0.5rem" }}>
                Visit →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Processing times */}
      <div className="fp-section">
        <h2 className="fp-section__title">⏱️ Current Processing Times</h2>
        <div className="fp-alert fp-alert--warning">
          <span className="fp-alert__icon">⚠️</span>
          <span className="fp-alert__text">Processing times are estimates and change frequently. Always check the IRCC website for the most current data.</span>
        </div>
        <table className="fp-table">
          <thead>
            <tr>
              <th>Application Type</th>
              <th>Estimated Time</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSING.map(row => (
              <tr key={row.type}>
                <td><strong>{row.type}</strong></td>
                <td><span className="fp-tag fp-tag--orange">{row.time}</span></td>
                <td style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Immigration streams */}
      <div className="fp-section">
        <h2 className="fp-section__title">🍁 Immigration Streams Overview</h2>
        <div className="fp-grid fp-grid--2">
          {STREAMS.map(s => (
            <div key={s.name} className="fp-card fp-card--accent">
              <h3 className="fp-card__title">{s.name}</h3>
              <ul style={{ paddingLeft: "1.1rem", margin: "0.25rem 0", fontSize: "0.85rem", color: "#3a2a30" }}>
                {s.streams.map(str => <li key={str}>{str}</li>)}
              </ul>
              <p className="fp-card__body" style={{ marginTop: "0.4rem", fontStyle: "italic" }}>{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
