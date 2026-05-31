// HousingSupport.jsx — housing support organizations, programs, and general guidance for newcomers
import { useState } from "react";
import "../scss/FeaturePages.scss";

// ── Support organizations ──────────────────────────────────────────────────────
const ORGS = [
  {
    icon: "🏛️",
    name: "CMHC (Canada Mortgage and Housing Corporation)",
    type: "Federal Agency",
    typeColor: "fp-tag--blue",
    desc: "Canada's national housing agency. Provides guides on renting, tenant rights, affordable housing programs, and the National Housing Strategy.",
    url: "https://www.cmhc-schl.gc.ca/consumers/renting",
    services: ["Rental guides for newcomers", "Affordable housing information", "Know your rights as a tenant"],
  },
  {
    icon: "🤝",
    name: "ACCES Employment",
    type: "Settlement Agency",
    typeColor: "fp-tag--green",
    desc: "Offers workshops on finding housing in Canada, understanding leases, and connecting with housing supports — often alongside employment services.",
    url: "https://accesemployment.ca",
    services: ["Housing navigation workshops", "Understanding leases", "Newcomer orientation"],
  },
  {
    icon: "🏠",
    name: "Habitat for Humanity Canada",
    type: "Non-Profit",
    typeColor: "fp-tag--orange",
    desc: "Builds affordable homes and advocates for housing policy reform. Works with low-income families including newcomers to provide stable housing.",
    url: "https://habitat.ca",
    services: ["Affordable homeownership program", "Housing advocacy", "Community support"],
  },
  {
    icon: "📞",
    name: "211 Canada",
    type: "Helpline & Directory",
    typeColor: "fp-tag--gray",
    desc: "Dial 2-1-1 or visit 211.ca to find local housing services, emergency shelters, rent assistance programs, and settlement agencies near you.",
    url: "https://211.ca",
    services: ["Emergency housing referrals", "Local shelter listings", "Rent assistance programs"],
  },
  {
    icon: "🧡",
    name: "Local Immigrant Partnership (LIP)",
    type: "Settlement Network",
    typeColor: "fp-tag--green",
    desc: "LIPs operate in communities across Canada, connecting newcomers with local housing services, settlement workers, and community supports.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/local-immigration-partnerships.html",
    services: ["Local housing referrals", "Settlement worker support", "Community connections"],
  },
  {
    icon: "🏢",
    name: "IRCC Settlement Program",
    type: "Federal Program",
    typeColor: "fp-tag--blue",
    desc: "IRCC funds settlement organizations across Canada that offer free housing navigation, translation, and orientation services to eligible newcomers.",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/finding-services.html",
    services: ["Free housing guidance", "Language support", "Orientation to Canadian housing system"],
  },
  {
    icon: "🌍",
    name: "Centre for Immigrant and Community Services (CICS)",
    type: "Settlement Agency",
    typeColor: "fp-tag--green",
    desc: "Provides housing support, tenant rights education, emergency housing assistance, and lease interpretation for newcomers in Ontario.",
    url: "https://www.cicstoronto.com",
    services: ["Tenant rights workshops", "Lease interpretation", "Emergency housing referrals"],
  },
  {
    icon: "⚖️",
    name: "Community Legal Clinics",
    type: "Legal Aid",
    typeColor: "fp-tag--red",
    desc: "Free legal advice on housing disputes, illegal evictions, rent increases, and unsafe living conditions. Available in most provinces through Legal Aid.",
    url: "https://www.legalaid.on.ca/legal-aid-services/clinics/community-legal-clinics/",
    services: ["Free housing legal advice", "Eviction assistance", "Landlord dispute help"],
  },
];

// ── Government programs ────────────────────────────────────────────────────────
const PROGRAMS = [
  { name: "Canada Housing Benefit (CHB)", desc: "A direct, portable rent supplement that helps low-income households afford housing. Delivered jointly by federal and provincial governments. Eligibility varies by province.", url: "https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/funding-programs/all-funding-programs/canada-housing-benefit" },
  { name: "Co-operative Housing", desc: "Non-profit housing co-ops offer stable, affordable housing governed by members. Wait lists can be long but rents are typically below market. Apply through your provincial co-op federation.", url: "https://chfc.ca/find-a-co-op/" },
  { name: "Social Housing / Subsidized Housing", desc: "Offered by provincial housing authorities for low-income individuals and families. Apply through your municipality or provincial housing registry. Wait times vary significantly by city.", url: "https://www.ontario.ca/page/find-social-housing" },
  { name: "Emergency Housing Assistance", desc: "If you are at risk of homelessness, contact 211 or your local municipality's emergency housing program. Many municipalities have emergency funds and short-term shelter options for newcomers.", url: "https://211.ca" },
  { name: "National Housing Strategy", desc: "Canada's 10-year, $115B plan to give more Canadians a place to call home, focused on the most vulnerable including newcomers. Details at CMHC.", url: "https://www.cmhc-schl.gc.ca/nhs" },
];

// ── General housing guidance ────────────────────────────────────────────────────
const GUIDANCE = [
  {
    q: "What documents do I typically need to rent in Canada?",
    a: "Most landlords ask for: proof of income (employment letter or bank statement), a reference letter, and sometimes a credit check. As a newcomer without Canadian credit history, offer a larger security deposit or a letter from your employer. Some landlords accept an international credit report.",
  },
  {
    q: "What is a standard lease and do I have to sign one?",
    a: "In Ontario and some other provinces, landlords must use the government's Standard Lease form. Always read before signing. You have the right to request a standard lease within 21 days of moving in. A lease does NOT give the landlord the right to enter without 24 hours notice.",
  },
  {
    q: "What is 'first and last month's rent'?",
    a: "Most landlords legally collect the first month's rent upfront plus a deposit equal to last month's rent. This is the maximum deposit allowed in most provinces. A 'key deposit' is typically capped at $100. Be cautious of landlords asking for more.",
  },
  {
    q: "Can my landlord increase my rent?",
    a: "Rent increases are regulated in most provinces. In Ontario, landlords can only increase rent once per year and must give 90 days written notice. The increase must stay within the annual provincial rent increase guideline (2.5% for 2024). Some provinces like Alberta have no rent control.",
  },
  {
    q: "What if my landlord wants to evict me?",
    a: "Landlords cannot evict you without legal grounds and proper notice (typically 60–90 days). If you receive an eviction notice, contact a community legal clinic or your provincial tenant board immediately. Do not leave without understanding your rights.",
  },
  {
    q: "Is a verbal lease valid in Canada?",
    a: "Yes, verbal leases are legally valid but very difficult to enforce. Always insist on a written lease. Without a written lease, you may default to a month-to-month tenancy with provincial default rules applying.",
  },
  {
    q: "What is tenant insurance and do I need it?",
    a: "Tenant (renter's) insurance covers your personal belongings, liability, and additional living expenses if your unit becomes uninhabitable. It does NOT cover the building — that is the landlord's responsibility. Tenant insurance is highly recommended and often required by landlords.",
  },
];

// ── Tenant rights by province ───────────────────────────────────────────────────
const TENANT_BOARDS = [
  { province: "Ontario",          board: "Landlord and Tenant Board (LTB)",           url: "https://tribunalsontario.ca/ltb/" },
  { province: "British Columbia", board: "Residential Tenancy Branch (RTB)",           url: "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies" },
  { province: "Alberta",          board: "Service Alberta — Residential Tenancies",    url: "https://www.alberta.ca/residential-tenancies.aspx" },
  { province: "Quebec",           board: "Tribunal administratif du logement (TAL)",   url: "https://www.tal.gouv.qc.ca" },
  { province: "Manitoba",         board: "Residential Tenancies Branch",               url: "https://www.gov.mb.ca/cca/rtb/" },
  { province: "Nova Scotia",      board: "Residential Tenancies Program",              url: "https://beta.novascotia.ca/programs-and-services/residential-tenancies-program" },
  { province: "Saskatchewan",     board: "Office of Residential Tenancies",            url: "https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/renting-a-home-or-commercial-property/residential-tenancies" },
  { province: "New Brunswick",    board: "Rentalsman — Service New Brunswick",         url: "https://www.snb.ca/e/1000/1000-1e.html" },
];

export default function HousingSupport() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🏠 Housing</span>
        <h1 className="fp-header__title">Housing Support for Newcomers</h1>
        <p className="fp-header__subtitle">
          Find organizations and government programs that help newcomers access safe, affordable housing
          in Canada — plus general guidance on renting, tenant rights, and what to expect.
        </p>
      </div>

      <div className="fp-alert fp-alert--info">
        <span className="fp-alert__icon">💡</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Get help from a settlement agency first</strong>
          Most settlement organizations offer free housing support, including help understanding leases,
          knowing your rights, and finding emergency housing. You do not need to navigate this alone.
        </span>
      </div>

      {/* Support organizations */}
      <div className="fp-section">
        <h2 className="fp-section__title">🤝 Organizations That Can Help</h2>
        <div className="fp-grid fp-grid--2">
          {ORGS.map(org => (
            <div key={org.name} className="fp-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.4rem" }}>{org.icon}</span>
                <span className={`fp-tag ${org.typeColor}`}>{org.type}</span>
              </div>
              <h3 className="fp-card__title">{org.name}</h3>
              <p className="fp-card__body">{org.desc}</p>
              <ul style={{ paddingLeft: "1.1rem", margin: "0.1rem 0 0.5rem", fontSize: "0.8rem", color: "#5a4a50" }}>
                {org.services.map(s => <li key={s}>{s}</li>)}
              </ul>
              <a href={org.url} target="_blank" rel="noreferrer" className="fp-btn fp-btn--outline" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                Visit resource →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Government programs */}
      <div className="fp-section">
        <h2 className="fp-section__title">🏛️ Government Housing Programs</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {PROGRAMS.map(p => (
            <div key={p.name} className="fp-card fp-card--accent">
              <h3 className="fp-card__title">{p.name}</h3>
              <p className="fp-card__body">{p.desc}</p>
              <a href={p.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8E0002", textDecoration: "none" }}>
                Learn more on canada.ca →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* General guidance FAQ */}
      <div className="fp-section">
        <h2 className="fp-section__title">❓ Understanding Housing in Canada</h2>
        <div className="fp-accordion">
          {GUIDANCE.map((item, i) => (
            <div key={i} className="fp-accordion__item">
              <button
                className="fp-accordion__trigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className={`fp-accordion__chevron ${openFaq === i ? "fp-accordion__chevron--open" : ""}`}>▼</span>
              </button>
              {openFaq === i && (
                <div className="fp-accordion__body">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tenant boards */}
      <div className="fp-section">
        <h2 className="fp-section__title">⚖️ Provincial Tenant Rights Boards</h2>
        <p style={{ fontSize: "0.87rem", color: "#6b5a61", marginBottom: "0.85rem" }}>
          If you have a dispute with your landlord, contact your province's tenant board.
          Most offer free mediation and formal hearings. Legal aid clinics can also help you prepare.
        </p>
        <table className="fp-table">
          <thead>
            <tr><th>Province</th><th>Board / Program</th><th>Link</th></tr>
          </thead>
          <tbody>
            {TENANT_BOARDS.map(row => (
              <tr key={row.province}>
                <td><strong>{row.province}</strong></td>
                <td style={{ fontSize: "0.83rem" }}>{row.board}</td>
                <td>
                  <a href={row.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8E0002", textDecoration: "none" }}>
                    Visit →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fp-alert fp-alert--warning">
        <span className="fp-alert__icon">⚠️</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Watch out for housing scams</strong>
          Never send money before seeing a unit in person. Legitimate landlords do not ask for e-transfer
          deposits before signing a lease. If a deal seems too good to be true, contact 211 or a settlement
          agency before proceeding.
        </span>
      </div>
    </div>
  );
}
