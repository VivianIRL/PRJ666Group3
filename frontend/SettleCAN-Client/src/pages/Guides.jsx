import { Link } from "react-router-dom";
import "../scss/TaskGuide.scss";

const GUIDES_LIST = [
    {
        title: "Open a Bank Account", path: "bank-account", desc: "Step by step guide on opening a Canadian bank account."},
        {title: "Register for Provincial Health Insurance", path: "health-card", desc: "Apply for health insurance, and get your health card, which is also a form of ID."},
        {title: "Apply for a Social Insurance Number (SIN)", path: "sin", desc: "Apply for your Social Insurance Number (SIN), a very important and private piece of info which is used for working, banking, and many government services."},
        {title: "Permit Renewal", path: "permit-renewal", desc: "Renew your Study or Work permit, at least 90 days before expiry."},
        {title: "Tax Returns", path: "tax-return", desc: "File your income tax returns, even if you have zero income"},
    

]


export default function Guides() {
  return (
    <div className="page features-hub">
      <div className="header">
        <span className="header__eyebrow">🍁 SettleCAN</span>
        <h1 className="header__title">Guides</h1>
        <p className="header__subtitle">
          All the guides we have written. Be sure to cross reference these with our other resources!
        </p>
      </div>

      <div className="fh-grid">
        {GUIDES_LIST.map(f => (
          <Link key={f.path} to={f.path} className="fh-card">
            
            
            <h3 className="guide-card__title">{f.title}</h3>
            <p>{f.desc}</p>
            
          </Link>
        ))}
      </div>
    </div>
  );
}

