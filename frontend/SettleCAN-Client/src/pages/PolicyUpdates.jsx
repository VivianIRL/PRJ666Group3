// PolicyUpdates.jsx — IRCC policy changes and immigration news feed
import "../scss/FeaturePages.scss";

const UPDATES = [
  {
    date: "May 2025", category: "Study Permit", severity: "info",
    title: "Post-Graduation Work Permit Processing: Updated Guidance",
    body: "IRCC clarified that PGWP applicants must now submit their final transcript or official completion letter within 180 days of the date shown on their transcript — not the convocation date. Applicants are advised to apply as soon as marks are posted.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html",
    tag: "PGWP",
  },
  {
    date: "Nov 2024", category: "Study Permit", severity: "success",
    title: "Off-Campus Work Hours Increased to 24 hrs/week",
    body: "International students can now work up to 24 hours per week off-campus during academic sessions. This is an increase from the previous 20-hour limit and applies to all valid study permit holders at eligible DLIs.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/10/canada-announces-changes-to-off-campus-work-hours-for-international-students.html",
    tag: "Work Rules",
  },
  {
    date: "Oct 2024", category: "Study Permit", severity: "warning",
    title: "International Student Intake Cap Extended to 2025",
    body: "Canada extended its cap on new study permit approvals for undergraduate and college-level international students to 2025. The cap limits the number of new approvals allocated per province. Existing permit holders are not affected.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/09/canada-to-extend-cap-on-international-student-study-permit-approvals-into-2025.html",
    tag: "Cap",
  },
  {
    date: "Sep 2024", category: "Express Entry", severity: "info",
    title: "Category-Based Express Entry Draws Continue in 2024–2025",
    body: "IRCC continues to issue category-based draws prioritizing healthcare workers, STEM professionals, French speakers, agriculture workers, and trades workers. These draws have lower CRS cutoffs than all-program draws and are expected to continue.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html",
    tag: "CRS",
  },
  {
    date: "Aug 2024", category: "PR", severity: "info",
    title: "Canada Targets 500,000 New PRs per Year Through 2026",
    body: "Canada's Immigration Levels Plan targets 485,000 new permanent residents in 2024, 500,000 in 2025, and 500,000 in 2026. Economic class immigrants (Express Entry and PNP) account for the largest share.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/supplementary-immigration-levels-plan-2023-2025.html",
    tag: "Levels Plan",
  },
  {
    date: "Jul 2024", category: "Work Permit", severity: "warning",
    title: "Temporary Foreign Worker Program: New Employer Obligations",
    body: "Employers using the TFWP face stricter compliance requirements including unannounced worksite inspections, expanded grounds for suspension, and higher penalties for non-compliance. Workers can now report violations directly to ESDC.",
    source: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/employer-compliance.html",
    tag: "TFWP",
  },
  {
    date: "Jun 2024", category: "Family", severity: "info",
    title: "Parents & Grandparents Program (PGP): 2024 Intake Open",
    body: "IRCC opened the 2024 PGP sponsorship intake. Sponsors must meet minimum income thresholds (LICO + 30%). Interested sponsors should register during the intake window. Those not selected for 2024 can reapply in future years.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/relative/pgp.html",
    tag: "PGP",
  },
  {
    date: "May 2024", category: "Citizenship", severity: "success",
    title: "Citizenship Application Fees Waived for Protected Persons",
    body: "IRCC permanently waived the citizenship application fee for protected persons (refugees and convention refugees). This removes a financial barrier to citizenship for this group.",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2024/04/canada-permanently-waives-citizenship-fees-for-protected-persons.html",
    tag: "Fees",
  },
];

const CAT_COLORS = {
  "Study Permit":  { bg: "#e8f0fe", text: "#1d4ed8" },
  "Express Entry": { bg: "#fdeaed", text: "#8E0002" },
  "PR":            { bg: "#fdeaed", text: "#8E0002" },
  "Work Permit":   { bg: "#fff3e0", text: "#c2410c" },
  "Family":        { bg: "#f3e8ff", text: "#7c3aed" },
  "Citizenship":   { bg: "#e6f9ef", text: "#15803d" },
};

const SEV_ICON = { info: "ℹ️", warning: "⚠️", success: "✅", danger: "🚨" };

export default function PolicyUpdates() {
  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">📰 Policy</span>
        <h1 className="fp-header__title">Updated With Policy Changes</h1>
        <p className="fp-header__subtitle">
          Stay current on IRCC announcements, cap changes, fee updates, and new immigration streams.
          All items link directly to official government sources.
        </p>
      </div>

      <div className="fp-alert fp-alert--info">
        <span className="fp-alert__icon">🔗</span>
        <span className="fp-alert__text">
          All updates are sourced from official canada.ca and IRCC announcements. Click "Read more" to view the original source.
          Policy changes can happen quickly — always verify with official IRCC channels.
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {UPDATES.map(u => {
          const cat = CAT_COLORS[u.category] ?? { bg: "#f3f0f1", text: "#6b5a61" };
          return (
            <div key={u.title} className="fp-card" style={{ borderLeft: `4px solid ${cat.text}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{SEV_ICON[u.severity]}</span>
                  <span style={{ background: cat.bg, color: cat.text, fontSize: "0.68rem", fontWeight: 700, borderRadius: "999px", padding: "0.18rem 0.6rem" }}>
                    {u.category}
                  </span>
                  <span className="fp-tag fp-tag--gray" style={{ fontSize: "0.65rem" }}>{u.tag}</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#9a8a90" }}>{u.date}</span>
              </div>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a0d10", margin: 0 }}>{u.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#5a4a50", lineHeight: 1.6, margin: 0 }}>{u.body}</p>

              <a href={u.source} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8E0002", textDecoration: "none" }}
              >
                Read official source →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
