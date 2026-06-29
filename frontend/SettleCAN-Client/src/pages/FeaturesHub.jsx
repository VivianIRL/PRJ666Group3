// FeaturesHub.jsx — landing page for all SettleCAN features
import { Link } from "react-router-dom";
import "../scss/FeaturePages.scss";
import "../scss/FeaturesHub.scss";

const INFOFEATURES = [
  {
    icon: "🪪",
    eyebrow: "Identity & Employment",
    title: "Social Insurance Number (SIN)",
    desc: "Your 9-digit identifier for work, taxes, and government benefits in Canada.",
    path: "/info/sin",
  },
  {
    icon: "💼",
    eyebrow: "Employment Authorization",
    title: "Work Permits in Canada",
    desc: "Everything you need to understand work authorization — permit types, employer restrictions, LMIA, changing jobs, and your rights as a worker.",
    path: "/info/work-permit"
  },
  {
    icon: "🏥",
    eyebrow: "Healthcare",
    title: "Health Coverage in Canada",
    desc: "Understand provincial health insurance, what's covered, how to find a doctor, mental health resources, and what to do during the waiting period.",
    path: "/info/health",
  },
  {
    icon: "🗣️",
    eyebrow: "Language",
    title: "Language Tests & Learning in Canada",
    desc: "IELTS, CELPIP, TEF, and TCF — understand each test, CLB score requirements for immigration, and free language learning programs available to newcomers.",
    path: "/info/language"
  }
];

const GUIDEFEATURES = [
  {
    icon: "🪪",
    eyebrow: "Employment",
    title: "Apply for a Social Insurance Number (SIN)",
    desc: "Your SIN is required to work legally in Canada, file taxes, access government benefits, and open most bank accounts. Apply as soon as you have a valid permit.",
    path: "/guides/sin",
  },
  {
    icon: "🏦",
    eyebrow: "Banking",
    title: "Open a Canadian Bank Account",
    desc: "All major banks accept newcomers without a Canadian credit history. Bring your foreign passport and immigration document — that's all they need to verify your identity.",
    path: "/guides/bank-account"
  },
  {
    icon: "⚕️",
    eyebrow: "Health",
    title: "Register for Provincial Health Insurance",
    desc: "In provinces with a 3-month wait (Ontario, Quebec, Nova Scotia, etc.), the clock starts on arrival. Apply immediately — delaying your application delays your coverage.",
    path: "/guides/health-card",
  },
  {
    icon: "📋",
    eyebrow: "Immigration",
    title: "Renew Your Study or Work Permit",
    desc: "If your permit expires before you apply, you lose your status and must leave Canada or restore status (which is a separate, more complex process). Set a reminder now.",
    path: "/guides/permit-renewal",
  },
  {
    icon: "💸",
    eyebrow: "Tax & Finance",
    title: "File Your Canadian Income Tax Return",
    desc: "Filing with no income establishes your tax residency and unlocks the GST/HST credit, carbon rebate, and child benefits. First-time filers who don't file miss out on thousands of dollars in benefits.",
    path: "/guides/tax-return",
  }
];

export default function FeaturesHub() {
  return (
    <div className="fp-page features-hub">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🍁 SettleCAN</span>
        <h1 className="fp-header__title">Information resources</h1>
        <p className="fp-header__subtitle">
          All sub-pages regarding information for what you should have when settling into Canada.
        </p>
      </div>

      <div className="fh-grid">
        {INFOFEATURES.map(f => (
          <Link key={f.path} to={f.path} className="fh-card">
            <div className="fh-card__top">
              <span className="fh-card__icon">{f.icon}</span>
              <span className={`fp-tag fp-tag--${f.tagColor}`}>{f.tag}</span>
            </div>
            <span className="fh-card__eyebrow">{f.eyebrow}</span>
            <h3 className="fh-card__title">{f.title}</h3>
            <p className="fh-card__desc">{f.desc}</p>
            <span className="fh-card__cta">Explore →</span>
          </Link>
        ))}
      </div>
      <br/>
      <br/>
      <div className="fp-header">
        <h1 className="fp-header__title">Guides</h1>
        <p className="fp-header__subtitle">
          All sub-pages regarding guides for helping to settle into Canada and maintain your status as a Canada immigrant/citizen.
        </p>
      </div>

      <div className="fh-grid">
        {GUIDEFEATURES.map(f => (
          <Link key={f.path} to={f.path} className="fh-card">
            <div className="fh-card__top">
              <span className="fh-card__icon">{f.icon}</span>
              <span className={`fp-tag fp-tag--${f.tagColor}`}>{f.tag}</span>
            </div>
            <span className="fh-card__eyebrow">{f.eyebrow}</span>
            <h3 className="fh-card__title">{f.title}</h3>
            <p className="fh-card__desc">{f.desc}</p>
            <span className="fh-card__cta">Explore →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
