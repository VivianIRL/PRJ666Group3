// LanguageInfo.jsx — language tests and learning resources for newcomers in Canada
import { useState } from "react";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const TESTS = [
  {
    name: "IELTS General Training",
    lang: "English",
    icon: "🇬🇧",
    tagCls: "fp-tag--blue",
    usedFor: ["Express Entry (FSW, CEC)", "Provincial nominee programs", "Citizenship"],
    format: "4 modules: Listening (40 min), Reading (60 min), Writing (60 min), Speaking (11–14 min). Total ~3 hours.",
    scoring: "Band score 0–9 per module. Immigration typically requires CLB 7–9 (band 6.0–7.5+). Each module scored separately.",
    cost: "~CAD $330–$360",
    validity: "2 years",
    url: "https://www.ielts.org",
    tip: "General Training is for immigration/work. Academic is for university admission. Make sure you choose the correct test type.",
  },
  {
    name: "CELPIP General",
    lang: "English",
    icon: "🍁",
    tagCls: "fp-tag--blue",
    usedFor: ["Express Entry (FSW, CEC)", "Canadian citizenship", "Provincial nominee programs"],
    format: "All computer-based. Listening (47–55 min), Reading (55–60 min), Writing (53–60 min), Speaking (15–20 min).",
    scoring: "CELPIP Level 1–12. Level 9 = CLB 9. Results in 4–8 business days. More convenient for tech-comfortable test-takers.",
    cost: "~CAD $280",
    validity: "2 years",
    url: "https://www.celpip.ca",
    tip: "Only accepted by IRCC and some provincial programs. Not accepted by most universities. Good alternative if you prefer computer-based tests.",
  },
  {
    name: "TEF Canada",
    lang: "French",
    icon: "🇫🇷",
    tagCls: "fp-tag--green",
    usedFor: ["Express Entry French-speaking draws", "Quebec immigration (RAMQ)", "Federal Skilled Worker Program"],
    format: "Compréhension de l'oral, Compréhension des écrits, Expression écrite, Expression orale. Paper and computer-based options.",
    scoring: "NCLC levels 1–12 for immigration. Scores mapped to NCLC for IRCC. French proficiency gives significant CRS boost in Express Entry.",
    cost: "~CAD $300–$400",
    validity: "2 years",
    url: "https://www.lefrancaisdesaffaires.fr/tests-et-diplomes/test-devaluation-de-francais/tef-canada/",
    tip: "French proficiency gives 25–50+ bonus CRS points in Express Entry. If you speak any French, it is worth testing.",
  },
  {
    name: "TCF Canada",
    lang: "French",
    icon: "🇫🇷",
    tagCls: "fp-tag--green",
    usedFor: ["Express Entry", "Quebec immigration", "Federal programs"],
    format: "Compréhension de l'oral (29 questions), Maîtrise des structures de la langue, Compréhension des écrits, Expression écrite, Expression orale.",
    scoring: "Niveaux A1–C2 (CECRL). Mapped to NCLC for IRCC applications. Results in about 15 business days.",
    cost: "~CAD $300",
    validity: "2 years",
    url: "https://www.france-education-international.fr/tcf-canada",
    tip: "Less widely offered than TEF Canada. Check if there is a test centre near you before registering.",
  },
];

const CLB_TABLE = [
  { clb: "CLB 10–12", ielts: "8.5–9.0", celpip: "10–12", notes: "Highest proficiency. Typically native or near-native." },
  { clb: "CLB 9",     ielts: "7.5",      celpip: "9",     notes: "Required for many PNP draws and Federal Skilled Worker high CRS." },
  { clb: "CLB 8",     ielts: "6.5–7.0",  celpip: "8",     notes: "Common minimum for CEC, many PNPs." },
  { clb: "CLB 7",     ielts: "6.0",      celpip: "7",     notes: "Minimum for Federal Skilled Worker program." },
  { clb: "CLB 6",     ielts: "5.5",      celpip: "6",     notes: "Minimum for some family sponsorship and refugee programs." },
  { clb: "CLB 4–5",   ielts: "4.0–5.0",  celpip: "4–5",   notes: "Below typical immigration thresholds." },
];

const FREE_PROGRAMS = [
  { name: "LINC (Language Instruction for Newcomers to Canada)", desc: "Free federally funded English classes for eligible newcomers (PRs and protected persons). Part-time and full-time options. Childcare may be available.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/language-skills/find-program.html", level: "All levels" },
  { name: "CLIC (Cours de langue pour les immigrants au Canada)", desc: "French-language equivalent of LINC. Free for eligible newcomers. Offered across Canada, especially in Quebec and francophone communities.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/language-skills/find-program.html", level: "All levels" },
  { name: "Enhanced Language Training (ELT)", desc: "Advanced language programs focused on occupation-specific language skills to help newcomers enter professional careers faster.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/language-skills/enhanced-language-training.html", level: "Advanced" },
  { name: "Public Libraries", desc: "Most public libraries offer free English and French conversation circles, ESL materials, and access to online learning platforms like Mango Languages or Rosetta Stone.", url: "https://www.tpl.ca/programs-and-learning/english-language-learning", level: "Beginner–Intermediate" },
  { name: "Settlement.org", desc: "Online English learning resources, language quizzes, and vocabulary guides specifically designed for newcomers to Ontario.", url: "https://settlement.org/ontario/education/english-as-a-second-language-esl/", level: "Beginner–Intermediate" },
  { name: "IELTS / CELPIP Official Practice", desc: "Both IELTS and CELPIP offer free practice tests and sample questions on their official websites. Always use official materials for the most accurate preparation.", url: "https://www.celpip.ca/prepare-for-celpip/free-study-resources/", level: "Test prep" },
];

const IMMIGRATION_IMPACT = [
  { program: "Express Entry — Federal Skilled Worker", minCLB: "CLB 7 (all 4 abilities)", note: "Higher scores = more CRS points. Going from CLB 7 to CLB 9 can add ~50–80 CRS points." },
  { program: "Express Entry — Canadian Experience Class", minCLB: "CLB 7 (NOC 0/1) or CLB 5 (NOC 2/3)", note: "CEC minimum is lower, but higher scores improve CRS ranking significantly." },
  { program: "Federal Skilled Trades", minCLB: "CLB 5 (reading/writing), CLB 4 (listening/speaking)", note: "Lower minimums reflect trades-based assessment." },
  { program: "Canadian Citizenship", minCLB: "CLB 4 (effective communication)", note: "Must demonstrate adequate language ability in English or French." },
  { program: "Quebec Skilled Worker (QSWP)", minCLB: "Scored points — French is heavily weighted", note: "French proficiency can earn up to 22 of 120 selection grid points." },
];

export default function LanguageInfo() {
  const [activeTest, setActiveTest] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const test = TESTS[activeTest];

  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">🗣️</div>
        <div>
          <div className="info-hero__eyebrow">Language</div>
          <h1 className="info-hero__title">Language Tests &amp; Learning in Canada</h1>
          <p className="info-hero__sub">
            IELTS, CELPIP, TEF, and TCF — understand each test, CLB score requirements for immigration,
            and free language learning programs available to newcomers.
          </p>
        </div>
      </div>

      {/* Test selector */}
      <div className="fp-section">
        <h2 className="fp-section__title">📝 Approved Language Tests</h2>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {TESTS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setActiveTest(i)}
              className={`fp-btn ${activeTest === i ? "fp-btn--primary" : "fp-btn--ghost"}`}
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        {/* Test detail card */}
        <div className="fp-card fp-card--accent">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.1rem", fontWeight: 800, color: "#1a0d10" }}>
                {test.icon} {test.name}
              </h3>
              <span className={`fp-tag ${test.tagCls}`}>{test.lang}</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {[["Cost", test.cost], ["Valid for", test.validity]].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#8E0002" }}>{val}</div>
                  <div style={{ fontSize: "0.65rem", color: "#9a8a90", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Used for", content: test.usedFor.join(", ") },
              { label: "Format", content: test.format },
              { label: "Scoring", content: test.scoring },
              { label: "💡 Tip", content: test.tip },
            ].map(item => (
              <div key={item.label} style={{ background: "#fdf7f8", borderRadius: "0.6rem", padding: "0.6rem 0.75rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#8E0002", marginBottom: "0.25rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.83rem", color: "#3a2a30", lineHeight: 1.5 }}>{item.content}</div>
              </div>
            ))}
          </div>

          <a href={test.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ alignSelf: "flex-start", marginTop: "0.75rem" }}>
            Official {test.name} website →
          </a>
        </div>
      </div>

      {/* CLB table */}
      <div className="fp-section">
        <h2 className="fp-section__title">📊 CLB Score Equivalents</h2>
        <p style={{ fontSize: "0.87rem", color: "#6b5a61", marginBottom: "0.85rem" }}>
          IRCC uses the Canadian Language Benchmark (CLB) to standardize language scores across all approved tests. Your test score is automatically converted to a CLB level.
        </p>
        <table className="fp-table">
          <thead><tr><th>CLB Level</th><th>IELTS (General)</th><th>CELPIP</th><th>Typical Use</th></tr></thead>
          <tbody>
            {CLB_TABLE.map(row => (
              <tr key={row.clb}>
                <td><strong>{row.clb}</strong></td>
                <td>{row.ielts}</td>
                <td>{row.celpip}</td>
                <td style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Immigration impact */}
      <div className="fp-section">
        <h2 className="fp-section__title">🍁 Language Requirements by Immigration Program</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {IMMIGRATION_IMPACT.map(row => (
            <div key={row.program} className="fp-card" style={{ flexDirection: "row", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: "180px" }}>
                <strong style={{ fontSize: "0.88rem", color: "#1a0d10" }}>{row.program}</strong>
                <div style={{ marginTop: "0.2rem" }}><span className="fp-tag fp-tag--blue">{row.minCLB}</span></div>
              </div>
              <p className="fp-card__body" style={{ margin: 0, flex: 2 }}>{row.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free learning */}
      <div className="fp-section">
        <h2 className="fp-section__title">📚 Free Language Learning Programs</h2>
        <div className="fp-grid fp-grid--2">
          {FREE_PROGRAMS.map(p => (
            <div key={p.name} className="fp-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 className="fp-card__title" style={{ flex: 1 }}>{p.name}</h3>
                <span className="fp-tag fp-tag--gray" style={{ flexShrink: 0, marginLeft: "0.5rem" }}>{p.level}</span>
              </div>
              <p className="fp-card__body">{p.desc}</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ alignSelf: "flex-start", marginTop: "auto" }}>Find program →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
