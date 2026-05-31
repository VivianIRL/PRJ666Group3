// PostArrival.jsx — first week and first month checklist for newcomers
import { useState } from "react";
import "../scss/FeaturePages.scss";

const PHASES = [
  {
    phase: "Day 1–3",
    icon: "✈️",
    color: "#fdeaed",
    border: "#b3203b",
    tasks: [
      { id: "p1t1", label: "Clear CBSA at port of entry — keep all immigration documents", done: false },
      { id: "p1t2", label: "Get a Canadian SIM card (Telus, Rogers, Bell, or Koodo)", done: false },
      { id: "p1t3", label: "Contact your school/employer to confirm arrival", done: false },
      { id: "p1t4", label: "Locate nearest Service Canada office for SIN appointment", done: false },
      { id: "p1t5", label: "Find temporary accommodation if permanent housing isn't ready", done: false },
    ],
  },
  {
    phase: "Week 1",
    icon: "📋",
    color: "#fff3e0",
    border: "#e67e22",
    tasks: [
      { id: "p2t1", label: "Apply for Social Insurance Number (SIN) at Service Canada", done: false },
      { id: "p2t2", label: "Open a Canadian bank account (TD, RBC, Scotiabank, BMO, CIBC)", done: false },
      { id: "p2t3", label: "Register for provincial health insurance (OHIP, MSP, AHCIP, etc.)", done: false },
      { id: "p2t4", label: "Attend international student/newcomer orientation at your institution", done: false },
      { id: "p2t5", label: "Set up transit card (Presto in Ontario, Compass in BC, etc.)", done: false },
      { id: "p2t6", label: "Explore nearby grocery stores, pharmacies, and transit routes", done: false },
    ],
  },
  {
    phase: "Weeks 2–4",
    icon: "🏠",
    color: "#e8f0fe",
    border: "#2563eb",
    tasks: [
      { id: "p3t1", label: "Secure permanent housing and sign a lease", done: false },
      { id: "p3t2", label: "Set up utilities: electricity, gas, internet (Bell, Rogers, Shaw, Videotron)", done: false },
      { id: "p3t3", label: "Enroll children in school (contact local school board)", done: false },
      { id: "p3t4", label: "Register for LINC / ESL / language classes if needed (free federally funded)", done: false },
      { id: "p3t5", label: "Get a Canadian driver's licence (exchange foreign licence or take test)", done: false },
      { id: "p3t6", label: "Research local newcomer settlement agencies (free legal, employment, social services)", done: false },
    ],
  },
  {
    phase: "First 3 Months",
    icon: "🍁",
    color: "#e6f9ef",
    border: "#27ae60",
    tasks: [
      { id: "p4t1", label: "File taxes in April (even with no income — for benefits eligibility)", done: false },
      { id: "p4t2", label: "Apply for CCB (Canada Child Benefit) if you have children", done: false },
      { id: "p4t3", label: "Apply for GST/HST credit (automatic when you file taxes)", done: false },
      { id: "p4t4", label: "Join a local newcomer community group, mosque, temple, or church", done: false },
      { id: "p4t5", label: "Get a credit card to start building Canadian credit history", done: false },
      { id: "p4t6", label: "Learn about tenant rights in your province", done: false },
    ],
  },
];

const RESOURCES = [
  { name: "211 Canada", desc: "Find local social services, newcomer support, food banks, housing help.", url: "https://211.ca", icon: "📞" },
  { name: "Service Canada", desc: "SIN, EI, CPP, Old Age Security — all federal benefit programs.", url: "https://www.canada.ca/en/employment-social-development/corporate/portfolio/service-canada.html", icon: "🏛️" },
  { name: "ACCES Employment", desc: "Free employment workshops, job search help, employer connections.", url: "https://accesemployment.ca", icon: "💼" },
  { name: "LINC (Language Instruction for Newcomers)", desc: "Free government-funded English and French language classes.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/language-skills/find-program.html", icon: "🗣️" },
  { name: "CMHC (Canada Mortgage & Housing)", desc: "Rental resources, tenant rights, affordable housing programs.", url: "https://www.cmhc-schl.gc.ca", icon: "🏠" },
  { name: "CRA My Account", desc: "File taxes, check benefit eligibility, update address.", url: "https://www.canada.ca/en/revenue-agency/services/e-services/cra-login-services.html", icon: "🧾" },
];

export default function PostArrival() {
  const [phases, setPhases] = useState(PHASES);

  function toggleTask(phaseIdx, taskId) {
    setPhases(prev => prev.map((phase, i) => {
      if (i !== phaseIdx) return phase;
      return { ...phase, tasks: phase.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) };
    }));
  }

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const doneTasks  = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.done).length, 0);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🛬 New Arrivals</span>
        <h1 className="fp-header__title">Post-Arrival Support</h1>
        <p className="fp-header__subtitle">
          Your step-by-step guide for your first days, weeks, and months in Canada.
          Check off each task as you complete it.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#6b5a61", marginBottom: "0.4rem" }}>
          <span>{doneTasks} of {totalTasks} tasks complete</span>
          <span style={{ fontWeight: 700, color: "#8E0002" }}>{Math.round((doneTasks / totalTasks) * 100)}%</span>
        </div>
        <div className="fp-progress">
          <div className="fp-progress__bar" style={{ width: `${(doneTasks / totalTasks) * 100}%` }} />
        </div>
      </div>

      {/* Phase checklists */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {phases.map((phase, phaseIdx) => {
          const pDone = phase.tasks.filter(t => t.done).length;
          return (
            <div key={phase.phase} style={{ background: phase.color, borderRadius: "1rem", padding: "1.25rem 1.4rem", borderLeft: `4px solid ${phase.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>{phase.icon}</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1a0d10" }}>{phase.phase}</h3>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: phase.border }}>{pDone}/{phase.tasks.length} done</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {phase.tasks.map(task => (
                  <label key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.55rem", cursor: "pointer", fontSize: "0.875rem", color: task.done ? "#9a8a90" : "#2b1a1f" }}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(phaseIdx, task.id)}
                      style={{ width: 16, height: 16, accentColor: "#8E0002", marginTop: 2, flexShrink: 0 }}
                    />
                    <span style={{ textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resources */}
      <div className="fp-section">
        <h2 className="fp-section__title">🔗 Newcomer Resources</h2>
        <div className="fp-grid fp-grid--3">
          {RESOURCES.map(r => (
            <div key={r.name} className="fp-card">
              <span className="fp-card__icon">{r.icon}</span>
              <h3 className="fp-card__title">{r.name}</h3>
              <p className="fp-card__body">{r.desc}</p>
              <a href={r.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ marginTop: "auto" }}>Visit →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
