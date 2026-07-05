import { Link } from "react-router-dom";
import "../scss/TaskGuide.scss";

const GUIDES_LIST = [
    {
        title: "Social Insurance Number (SIN)", path: "sin", desc: "Your 9-digit identifier for work, taxes, and government benefits in Canada."},
        {title: "Work Permits in Canada", path: "work-permit", desc: "Everything you need to understand work authorization — permit types, employer restrictions, LMIA, changing jobs, and your rights as a worker."},
        {title: "Health Coverage in Canada", path: "health", desc: "Understand provincial health insurance, what's covered, how to find a doctor, mental health resources, and what to do during the waiting period."},
        {title: "Language Tests & Learning in Canada", path: "language", desc: "IELTS, CELPIP, TEF, and TCF — understand each test, CLB score requirements for immigration, and free language learning programs available to newcomers."},
    

]


export default function Info() {
  return (
    <div className="page features-hub">
      <div className="header">
        <span className="header__eyebrow">🍁 SettleCAN</span>
        <h1 className="header__title">Info</h1>
        <p className="header__subtitle">
          All our informational pages. Be sure to cross reference these with official resources as well.
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
