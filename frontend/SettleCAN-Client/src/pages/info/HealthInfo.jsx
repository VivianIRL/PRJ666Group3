// HealthInfo.jsx — comprehensive health coverage information for newcomers in Canada
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";
import LastUpdatedBadge from "../../components/LastUpdatedBadge";

const PROVINCIAL_COVERAGE = [
  {
    prov: "Ontario",
    card: "OHIP",
    wait: "3 months",
    dental: false,
    vision: false,
    drugs: "ODB (65+, social assistance)",
    url: "https://www.ontario.ca/page/apply-ohip-and-get-health-card",
  },
  {
    prov: "British Columbia",
    card: "MSP",
    wait: "None",
    dental: false,
    vision: false,
    drugs: "BC PharmaCare (income-based)",
    url: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/enrolment/how-to-enrol",
  },
  {
    prov: "Alberta",
    card: "AHCIP",
    wait: "None",
    dental: false,
    vision: false,
    drugs: "Non-group coverage for some",
    url: "https://www.alberta.ca/ahcip.aspx",
  },
  {
    prov: "Quebec",
    card: "RAMQ",
    wait: "3 months",
    dental: false,
    vision: false,
    drugs: "RAMQ drug plan (mandatory)",
    url: "https://www.ramq.gouv.qc.ca/en/citizens",
  },
  {
    prov: "Manitoba",
    card: "Manitoba Health",
    wait: "None",
    dental: false,
    vision: false,
    drugs: "Pharmacare (deductible-based)",
    url: "https://www.gov.mb.ca/health/mhsip/",
  },
  {
    prov: "Nova Scotia",
    card: "MSI",
    wait: "3 months",
    dental: false,
    vision: false,
    drugs: "NS Pharmacare (seniors)",
    url: "https://msi.medavie.ca",
  },
];

const WHAT_IS_COVERED = [
  { service: "Doctor visits (family physician & specialist)", covered: true },
  { service: "Emergency room and urgent care", covered: true },
  { service: "Hospital stays (medically necessary)", covered: true },
  { service: "Diagnostic tests (blood work, X-rays, MRI)", covered: true },
  { service: "Mental health (psychiatrist — with referral)", covered: true },
  { service: "Routine dental care", covered: false },
  { service: "Vision care (glasses, contacts)", covered: false },
  {
    service: "Prescription drugs",
    covered: false,
    note: "Some provincial plans exist for specific groups",
  },
  { service: "Physiotherapy (private)", covered: false },
  {
    service: "Ambulance services",
    covered: null,
    note: "Partially covered — varies by province",
  },
  { service: "Massage therapy", covered: false },
  { service: "Cosmetic procedures", covered: false },
];

const FINDING_DOCTOR = [
  {
    icon: "🏥",
    title: "Walk-in Clinics",
    body: "The fastest way to see a doctor without a family physician. No appointment needed. Covered by provincial health insurance. Hours vary — many are open evenings and weekends. Use Medimap or Locating a Doctor to find one near you.",
    url: "https://www.medimap.ca",
  },
  {
    icon: "👨‍⚕️",
    title: "Family Physician",
    body: "A long-term primary care doctor who manages your overall health. Getting one in major cities can take months to years — add yourself to waitlists (Health Care Connect in Ontario, Health Gateway in BC). Community health centres sometimes accept new patients faster.",
    url: "https://healthcareconnect.ontario.ca",
  },
  {
    icon: "🏙️",
    title: "Community Health Centres (CHC)",
    body: "Provide primary care to underserved populations including newcomers — often regardless of insurance status. Services may include mental health, dental, and social support. Many have multilingual staff.",
    url: "https://www.achc.ca",
  },
  {
    icon: "📱",
    title: "Virtual Care (Telehealth)",
    body: "Provinces offer free telehealth lines (e.g., Telehealth Ontario — 1-866-797-0000) for 24/7 nurse advice. Apps like Maple, Dialogue, and Teladoc allow video doctor visits (some covered provincially).",
    url: "https://www.health.gov.on.ca/en/public/programs/telehealth/",
  },
  {
    icon: "🚨",
    title: "Emergency Room",
    body: "For life-threatening or serious conditions only. Provincial health covers ER visits. For non-emergencies, walk-in clinics reduce ER wait times and free up resources.",
    url: null,
  },
];

const MENTAL_HEALTH = [
  {
    name: "Crisis Services Canada",
    desc: "24/7 crisis line and chat for anyone in emotional distress",
    phone: "1-833-456-4566",
    url: "https://www.crisisservicescanada.ca",
  },
  {
    name: "Newcomer Stress & Support",
    desc: "IRCC-funded mental health support for newcomers through settlement agencies",
    phone: "211",
    url: "https://211.ca",
  },
  {
    name: "Kids Help Phone",
    desc: "Free counselling for youth up to 29 via call, text, or chat",
    phone: "1-800-668-6868",
    url: "https://kidshelpphone.ca",
  },
  {
    name: "Centre for Addiction & Mental Health (CAMH)",
    desc: "Ontario's largest mental health and addiction teaching hospital",
    phone: "416-535-8501",
    url: "https://www.camh.ca",
  },
  {
    name: "Wellness Together Canada",
    desc: "Free government-funded mental health and substance use support online/app",
    phone: null,
    url: "https://www.wellnesstogether.ca",
  },
];

const WAIT_FAQS = [
  {
    q: "What do I do during the 3-month health card wait?",
    a: "Purchase private/temporary health insurance. Many schools offer mandatory student health plans. Some travel insurance policies can be extended. Pharmacies carry over-the-counter medications. Walk-in clinics may offer services on a pay-per-visit basis during the wait.",
  },
  {
    q: "Does the wait apply to emergencies?",
    a: "Emergency room services are typically provided to all patients regardless of insurance status — but you may receive a bill if you are not yet covered. Private insurance can help cover this.",
  },
  {
    q: "Can I use my home country's insurance in Canada?",
    a: "Many international health plans have limited coverage in Canada and may not cover long-term care. Always verify with your insurer before relying on it. Purchase Canadian supplemental coverage.",
  },
  {
    q: "What is the Interim Federal Health Program (IFHP)?",
    a: "IFHP provides temporary health coverage to refugee claimants, government-assisted refugees, and certain other groups. It covers basic and emergency health services until provincial coverage is available.",
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function HealthInfo() {
  const [openFaq, setOpenFaq] = useState(null);
  const [apiContent, setApiContent] = useState(null);
  const [apiResources, setApiResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHealthInfo() {
      try {
        const res = await fetch(`${API_BASE}/api/info/health`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setApiContent(data.content);
          setApiResources(data.resources || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHealthInfo();
  }, []);

  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--green">
        <div className="info-hero__icon">🏥</div>
        <div>
          <div className="info-hero__eyebrow">Healthcare</div>
          <h1 className="info-hero__title">
            {apiContent?.title || "Health Coverage in Canada"}
          </h1>
          <p className="info-hero__sub">
            {apiContent?.summary ||
              "Understand provincial health insurance, what's covered, how to find a doctor, mental health resources, and what to do during the waiting period."}
          </p>
          <Link to="/guides/health-card" className="info-hero__cta">
            → Step-by-step: Register for your health card
          </Link>
        </div>
      </div>

      <div className="fp-alert fp-alert--info">
        <span className="fp-alert__icon">ℹ️</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">
            Canada has universal public health care
          </strong>
          All medically necessary hospital and physician services are covered by
          provincial health insurance at no direct cost to the patient. You must
          register and, in some provinces, complete a waiting period.
        </span>
      </div>

      {/* API resources section — shown only when data is available */}
      {!loading && !error && apiResources.length > 0 && (
        <div className="fp-section">
          <h2 className="fp-section__title">📌 Featured Resources</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {apiResources.map((r) => (
              <div
                key={r.id}
                className="fp-card"
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong
                    style={{
                      fontSize: "0.88rem",
                      color: "#1a0d10",
                      display: "block",
                    }}
                  >
                    {r.title}
                  </strong>
                  {r.description && (
                    <span style={{ fontSize: "0.8rem", color: "#6b5a61" }}>
                      {r.description}
                    </span>
                  )}
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#8E0002",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="fp-alert fp-alert--danger" style={{ margin: "1rem 0" }}>
          <span className="fp-alert__icon">⚠️</span>
          <span className="fp-alert__text">
            Could not load live content: {error}
          </span>
        </div>
      )}

      {/* What is covered */}
      <div className="fp-section">
        <h2 className="fp-section__title">✅ What is and isn't covered</h2>
        <table className="fp-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Covered by Provincial Plan?</th>
            </tr>
          </thead>
          <tbody>
            {WHAT_IS_COVERED.map((row) => (
              <tr key={row.service}>
                <td>
                  {row.service}
                  {row.note && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b5a61",
                        display: "block",
                      }}
                    >
                      {row.note}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`fp-tag ${row.covered === true ? "fp-tag--green" : row.covered === null ? "fp-tag--orange" : "fp-tag--red"}`}
                  >
                    {row.covered === true
                      ? "✓ Covered"
                      : row.covered === null
                        ? "Partial"
                        : "✗ Not covered"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          style={{ fontSize: "0.8rem", color: "#7a6a70", marginTop: "0.5rem" }}
        >
          💡 Dental, vision, and drug coverage can be obtained through employer
          group benefits or private insurance. Some provinces have supplemental
          programs for low-income residents.
        </p>
      </div>

      {/* By province */}
      <div className="fp-section">
        <h2 className="fp-section__title">🗺️ Provincial Health Cards</h2>
        <table className="fp-table">
          <thead>
            <tr>
              <th>Province</th>
              <th>Card Name</th>
              <th>Wait Period</th>
              <th>Drug Coverage</th>
              <th>Apply</th>
            </tr>
          </thead>
          <tbody>
            {PROVINCIAL_COVERAGE.map((row) => (
              <tr key={row.prov}>
                <td>
                  <strong>{row.prov}</strong>
                </td>
                <td>{row.card}</td>
                <td>
                  <span
                    className={`fp-tag ${row.wait === "None" ? "fp-tag--green" : "fp-tag--orange"}`}
                  >
                    {row.wait}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "#6b5a61" }}>
                  {row.drugs}
                </td>
                <td>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#8E0002",
                      textDecoration: "none",
                    }}
                  >
                    Apply →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finding a doctor */}
      <div className="fp-section">
        <h2 className="fp-section__title">👨‍⚕️ How to Access Health Care</h2>
        <div className="fp-grid fp-grid--2">
          {FINDING_DOCTOR.map((item) => (
            <div key={item.title} className="fp-card">
              <span className="fp-card__icon">{item.icon}</span>
              <h3 className="fp-card__title">{item.title}</h3>
              <p className="fp-card__body">{item.body}</p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="fp-btn fp-btn--outline"
                  style={{ alignSelf: "flex-start", marginTop: "auto" }}
                >
                  Visit →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mental health */}
      <div className="fp-section">
        <h2 className="fp-section__title">🧠 Mental Health Resources</h2>
        <div className="fp-alert fp-alert--info">
          <span className="fp-alert__icon">💙</span>
          <span className="fp-alert__text">
            Settling in a new country is stressful. It is normal to feel
            anxious, isolated, or overwhelmed. Help is available — many services
            are free and available in multiple languages.
          </span>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {MENTAL_HEALTH.map((r) => (
            <div
              key={r.name}
              className="fp-card"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong
                  style={{
                    fontSize: "0.88rem",
                    color: "#1a0d10",
                    display: "block",
                  }}
                >
                  {r.name}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#6b5a61" }}>
                  {r.desc}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {r.phone && (
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "#8E0002",
                    }}
                  >
                    {r.phone}
                  </span>
                )}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#8E0002",
                    textDecoration: "none",
                  }}
                >
                  Visit →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wait period FAQ */}
      <div className="fp-section">
        <h2 className="fp-section__title">❓ Common Questions</h2>
        <div className="fp-accordion">
          {WAIT_FAQS.map((faq, i) => (
            <div key={i} className="fp-accordion__item">
              <button
                className="fp-accordion__trigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <span
                  className={`fp-accordion__chevron ${openFaq === i ? "fp-accordion__chevron--open" : ""}`}
                >
                  ▼
                </span>
              </button>
              {openFaq === i && (
                <div className="fp-accordion__body">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="info-links-row">
        <div className="fp-card fp-card--accent" style={{ flex: 1 }}>
          <h3 className="fp-card__title">📖 Ready to register?</h3>
          <p className="fp-card__body">
            Step-by-step guide for registering for your provincial health card
            with document checklist.
          </p>
          <Link
            to="/guides/health-card"
            className="fp-btn fp-btn--primary"
            style={{ marginTop: "0.5rem" }}
          >
            Health Card Guide
          </Link>
        </div>
        <div className="fp-card" style={{ flex: 1 }}>
          <h3 className="fp-card__title">🔗 Official Resources</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <li>
              <a
                href="https://www.canada.ca/en/health-canada/services/health-care-system.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Canada's health care system — canada.ca
              </a>
            </li>
            <li>
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-within-canada/health-care/interim-federal-health-program.html"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Interim Federal Health Program (IFHP)
              </a>
            </li>
            <li>
              <a
                href="https://www.wellnesstogether.ca"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.83rem",
                  color: "#8E0002",
                  fontWeight: 600,
                }}
              >
                Wellness Together Canada (free mental health)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
