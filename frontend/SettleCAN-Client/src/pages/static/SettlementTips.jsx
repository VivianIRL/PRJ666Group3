import { Link } from "react-router-dom";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const TIPS_BY_TOPIC = [
  {
    icon: "🏦",
    title: "Banking & Credit",
    tips: [
      { headline: "Open a bank account within your first week", body: "TD, RBC, Scotiabank, and BMO all offer newcomer packages with no monthly fees for 1–2 years. Bring your passport, study or work permit, and proof of address." },
      { headline: "Start building credit immediately", body: "Get a secured credit card from your bank as soon as possible. Use it for small regular purchases and pay it off in full each month. Good credit opens doors to rentals, car loans, and eventually a mortgage." },
      { headline: "Set up direct deposit and e-transfer", body: "Canadian banks use Interac e-Transfer for sending money domestically — no fee in most accounts. Set up direct deposit with your employer on day one." },
      { headline: "Avoid international wire fees", body: "Use Wise, Remitly, or your bank's transfer service to send money home. Avoid exchanging cash at the airport — rates are poor." },
    ],
  },
  {
    icon: "🏠",
    title: "Housing",
    tips: [
      { headline: "Budget for first and last month's rent", body: "Most Canadian landlords require first and last month's rent upfront. In Ontario this is legally the maximum they can ask for. Budget accordingly before you arrive." },
      { headline: "Get tenant (renter's) insurance", body: "Tenant insurance typically costs $20–$40/month and covers your belongings against theft, fire, and water damage. Many landlords require proof of it." },
      { headline: "Know your rights as a tenant", body: "Each province has a landlord-tenant act. In Ontario, the Residential Tenancies Act protects you from unlawful evictions and limits how much rent can be raised." },
      { headline: "Use settlement agencies for housing help", body: "Organizations like ACCES Employment, COSTI, and local newcomer centres can help with housing searches, lease review, and connecting you to subsidised housing waitlists." },
    ],
  },
  {
    icon: "🚌",
    title: "Getting Around",
    tips: [
      { headline: "Download the local transit app", body: "TTC (Toronto), STM (Montreal), TransLink (Vancouver), OC Transpo (Ottawa). The Transit app works in most Canadian cities and shows real-time arrivals." },
      { headline: "Get a PRESTO / Compass / Opus card", body: "Transit cards give you a lower fare than cash in most cities. Load them online or at machines in stations." },
      { headline: "Consider a used bicycle", body: "For shorter commutes, a bicycle is practical and free. Check Facebook Marketplace or the Canadian Tire clearance section for affordable options." },
      { headline: "Driver's licence exchange", body: "Many countries have agreements with Canadian provinces for licence exchange. Visit your provincial MTO office within 90 days to find out if you qualify." },
    ],
  },
  {
    icon: "🏥",
    title: "Health & Wellness",
    tips: [
      { headline: "Apply for your provincial health card immediately", body: "Most provinces have a 3-month wait before coverage begins. Apply as soon as you arrive. In the meantime, purchase private health insurance to cover the gap." },
      { headline: "Find a family doctor early", body: "Family doctors in Canada are in high demand. Register with your province's doctor finder tool, or try a local Community Health Centre (CHC) which accepts unattached patients." },
      { headline: "Use 811 for non-emergency health questions", body: "Most provinces have a health line (811 or similar) staffed by registered nurses 24/7. Call before going to an emergency room for minor issues." },
      { headline: "Mental health support is available", body: "Distress Centre Canada: 1-800-456-4566. BounceBack program offers free CBT coaching for mild-to-moderate depression and anxiety. Many settlement agencies offer counselling too." },
    ],
  },
  {
    icon: "💼",
    title: "Employment",
    tips: [
      { headline: "Get your credentials assessed", body: "If you worked in a regulated profession (medicine, engineering, law, teaching), get your credentials assessed by the appropriate body early. This process can take months." },
      { headline: "Use LinkedIn aggressively", body: "Canadian hiring culture is heavily relationship-driven. Connect with people in your field, attend industry meetups, and ask for informational interviews. Many jobs are filled before they're posted." },
      { headline: "Settlement agencies offer free job coaching", body: "ACCES Employment, JVS Toronto, MOSAIC Vancouver, and dozens of others offer resume help, mock interviews, and employer connections for newcomers — at no cost." },
      { headline: "Know your workplace rights", body: "Federally regulated and provincially regulated workers have different protections. Employment standards offices handle wage theft and wrongful dismissal — most complaints are free to file." },
    ],
  },
  {
    icon: "📋",
    title: "Taxes & Government Benefits",
    tips: [
      { headline: "File a tax return every year — even with no income", body: "Filing taxes establishes your Canadian residency and unlocks benefits like GST/HST credits, carbon rebates, and the Canada Child Benefit. File by April 30 each year." },
      { headline: "Apply for the Canada Child Benefit (CCB)", body: "If you have children under 18, apply for the CCB as soon as you have your SIN and PR/permit status. Payments can be significant — thousands of dollars per year per child." },
      { headline: "Use free tax clinics", body: "Community Volunteer Income Tax Program (CVITP) clinics prepare taxes for free for people with modest incomes. Most newcomers qualify. Search for clinics at canada.ca." },
      { headline: "Set up a CRA My Account", body: "Register at canada.ca for CRA My Account to track your tax returns, benefits, RRSP room, and government correspondence all in one place." },
    ],
  },
];

export default function SettlementTips() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">💡</div>
        <div>
          <div className="info-hero__eyebrow">Resources</div>
          <h1 className="info-hero__title">Settlement Tips</h1>
          <p className="info-hero__sub">
            Practical, real-world advice from newcomers who've navigated Canadian life — covering banking, housing, health, employment, and more.
          </p>
        </div>
      </div>

      {TIPS_BY_TOPIC.map(section => (
        <div key={section.title} className="fp-section">
          <h2 className="fp-section__title">{section.icon} {section.title}</h2>
          <div className="fp-grid fp-grid--2">
            {section.tips.map((tip, i) => (
              <div key={i} className="fp-card">
                <h3 className="fp-card__title">{tip.headline}</h3>
                <p className="fp-card__body">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="fp-section">
        <div className="fp-card fp-card--accent" style={{ flexDirection: "row", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 0.3rem", color: "#1a0d10" }}>Ready to take action?</h3>
            <p style={{ margin: 0, color: "#6b5a61", fontSize: "0.88rem" }}>
              Your personalised checklist turns these tips into concrete steps with your own progress tracker.
            </p>
          </div>
          <Link to="/register" className="fp-btn fp-btn--primary" style={{ textDecoration: "none", flexShrink: 0 }}>
            Open My Checklist →
          </Link>
        </div>
      </div>
    </div>
  );
}
