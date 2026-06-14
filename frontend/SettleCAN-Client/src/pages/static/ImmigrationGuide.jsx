import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const PATHWAYS = [
  {
    icon: "🎓",
    title: "International Student",
    summary: "Study permit holders can work part-time, apply for PGWP after graduation, and transition to work permit or PR through CEC.",
    steps: [
      "Apply for a study permit from IRCC before arriving",
      "Enroll at a Designated Learning Institution (DLI)",
      "Work up to 24 hours off-campus per week during studies",
      "Apply for Post-Graduation Work Permit (PGWP) within 180 days of graduation",
      "Gain Canadian work experience, then apply via Express Entry (CEC)",
    ],
    link: "/register",
    linkLabel: "Work Permit Guide",
  },
  {
    icon: "💼",
    title: "Work Permit Holder",
    summary: "Temporary foreign workers can gain Canadian experience and transition to PR through Express Entry or Provincial Nominee Programs.",
    steps: [
      "Confirm permit conditions — employer, location, NOC code",
      "Never work outside your permit conditions",
      "Accumulate 1 year of skilled work experience (TEER 0–3) for CEC",
      "Take an English or French language test (IELTS/CELPIP/TEF)",
      "Create an Express Entry profile when eligible",
      "Consider Provincial Nominee Programs (PNP) for faster PR",
    ],
    link: "/register",
    linkLabel: "PR Pathway Guide",
  },
  {
    icon: "🍁",
    title: "Permanent Resident",
    summary: "PRs have most of the same rights as citizens. Maintain physical presence to qualify for citizenship after 3 years.",
    steps: [
      "Activate your PR status by landing before COPR expiry",
      "Apply for your PR card and SIN immediately",
      "Maintain 730 days of physical presence in Canada every 5 years",
      "After 3 years (1,095 days in 5 years), apply for citizenship",
      "Renew PR card 9 months before expiry",
    ],
    link: "/register",
    linkLabel: "PR Checklist",
  },
  {
    icon: "🛡️",
    title: "Refugee / Protected Person",
    summary: "Refugees and protected persons have a direct pathway to PR and can access federally funded health programs while their claim is processed.",
    steps: [
      "Receive Protected Person determination from the IRB",
      "Apply for PR as soon as possible — protected persons are eligible immediately",
      "Register for IFHP (Interim Federal Health Program)",
      "Apply for RAP (Resettlement Assistance Program) if eligible",
      "Access free LINC language training",
    ],
    link: "/register",
    linkLabel: "Refugee Checklist",
  },
  {
    icon: "🌍",
    title: "Visitor / Tourist",
    summary: "Visitors can stay up to 6 months by default. Extensions, Super Visas, and status changes are possible through IRCC.",
    steps: [
      "Confirm authorized stay duration on entry stamp or eTA",
      "Do not work or study without the correct permit",
      "Purchase visitor health insurance — you are not covered provincially",
      "Apply to extend stay through IRCC at least 30 days before expiry",
      "Explore pathways to work or study permit if you plan to stay longer",
    ],
    link: "/register",
    linkLabel: "Visitor Checklist",
  },
];

const KEY_PROGRAMS = [
  { name: "Express Entry", desc: "Points-based system for skilled workers. Manages applications for FSW, CEC, and FST programs. CRS score determines invitation to apply.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html" },
  { name: "Provincial Nominee Program (PNP)", desc: "Each province nominates immigrants to fill specific labour market needs. Nominations add 600 CRS points — virtually guaranteeing an ITA.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html" },
  { name: "Quebec Skilled Worker Program (QSWP)", desc: "Quebec manages its own immigration selection. French proficiency is heavily weighted. Selected candidates still require federal health and security approval.", url: "https://www.immigration-quebec.gouv.qc.ca/en/immigrate-settle/workers/index.html" },
  { name: "Atlantic Immigration Program (AIP)", desc: "For skilled workers and international graduates who want to live in Atlantic Canada. Requires a job offer from a designated employer.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration.html" },
  { name: "Rural and Northern Immigration Pilot", desc: "Helps smaller communities attract and retain immigrants. Requires a job offer and intention to live in the community.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-northern-immigration-pilot.html" },
];

export default function ImmigrationGuide() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">🇨🇦</div>
        <div>
          <div className="info-hero__eyebrow">Resources</div>
          <h1 className="info-hero__title">Immigration Guide</h1>
          <p className="info-hero__sub">
            A plain-language overview of Canadian immigration pathways — from study permits to permanent residency and citizenship.
          </p>
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">🗺️ Pathways by Immigration Status</h2>
        <p style={{ fontSize: "0.87rem", color: "#6b5a61", marginBottom: "1rem" }}>
          Select your status below to see the typical steps and progression for your situation.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {PATHWAYS.map(p => (
            <div key={p.title} className="fp-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "2rem" }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 className="fp-card__title" style={{ marginBottom: "0.25rem" }}>{p.title}</h3>
                  <p className="fp-card__body" style={{ marginBottom: "0.75rem" }}>{p.summary}</p>
                  <ol style={{ paddingLeft: "1.2rem", margin: "0 0 0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {p.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: "0.85rem", color: "#4a3a40", lineHeight: 1.6 }}>{step}</li>
                    ))}
                  </ol>
                  <Link to={p.link} className="fp-btn fp-btn--outline" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
                    {p.linkLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">📋 Key Immigration Programs</h2>
        <div className="fp-grid fp-grid--2">
          {KEY_PROGRAMS.map(p => (
            <div key={p.name} className="fp-card">
              <h3 className="fp-card__title">{p.name}</h3>
              <p className="fp-card__body">{p.desc}</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                Official page →
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="fp-section">
        <div className="fp-card fp-card--accent">
          <h3 style={{ margin: "0 0 0.5rem", color: "#1a0d10" }}>⚠️ Important reminder</h3>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "#4a3a40", lineHeight: 1.7 }}>
            Immigration rules change frequently. Always verify deadlines and requirements with official IRCC sources.
            This guide is for general awareness only — not legal advice.
          </p>
          <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" target="_blank" rel="noreferrer" className="fp-btn fp-btn--primary">
            Visit IRCC Official Site →
          </a>
        </div>
      </div>
    </div>
  );
}
