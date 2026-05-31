// InternationalStudents.jsx
import { useState } from "react";
import "../scss/FeaturePages.scss";

const WORK_RULES = [
  { situation: "During academic session (enrolled full-time)", limit: "24 hrs/week off-campus", note: "Increased from 20 hrs as of Nov 15, 2024. On-campus work is unlimited." },
  { situation: "During scheduled breaks (summer, winter, spring)", limit: "Unlimited hours", note: "Breaks must be scheduled by your institution — ad hoc breaks don't count." },
  { situation: "Mandatory co-op / internship (authorized)", limit: "Unlimited hours", note: "Requires authorization on your study permit or a co-op work permit. Apply before the semester." },
  { situation: "Final semester (need fewer courses)", limit: "Unlimited hours", note: "If you are in your final semester and don't need full course load to graduate, you may work full-time." },
  { situation: "No valid study permit", limit: "Not authorized to work", note: "Working without authorization has serious consequences including removal and future inadmissibility." },
];

const PGWP_REQUIREMENTS = [
  { req: "Graduate from an eligible DLI", detail: "Most public colleges and universities qualify. Private institutions may have restrictions — check the DLI list at canada.ca." },
  { req: "Program duration of 8 months or more", detail: "Programs shorter than 8 months don't qualify for PGWP. Multiple short programs can sometimes be combined." },
  { req: "Apply within 180 days of graduating", detail: "Start date is either the date your final marks are received OR the date your degree/diploma is issued — whichever is first." },
  { req: "Maintain valid student status", detail: "You must have maintained valid status throughout your studies. Any unauthorized work or unauthorized leave may affect eligibility." },
  { req: "Not already held a PGWP before", detail: "You can only receive one PGWP in your lifetime. Plan your post-graduation pathway carefully." },
];

const PGWP_LENGTHS = [
  { program: "Less than 8 months",  pgwp: "Not eligible" },
  { program: "8 months – less than 2 years", pgwp: "Equal to program length" },
  { program: "2 years or more",     pgwp: "3 years" },
];

const FAQS = [
  { q: "Can I work while waiting for my PGWP?", a: "Yes. If you apply for your PGWP before your study permit expires (or while on maintained status), you can work full-time while waiting for a decision, as long as you were authorized to work before." },
  { q: "What is a DLI?", a: "A Designated Learning Institution is a school approved by a provincial or territorial government to host international students. All DLIs are listed at canada.ca/en/immigration. If your school is not on the list, you cannot get or renew a study permit for it." },
  { q: "What if I transfer schools?", a: "You can transfer to another DLI without getting a new study permit as long as the new school is a DLI and you start full-time studies immediately. Notify IRCC by updating your account." },
  { q: "Does the 24-hr limit apply to on-campus jobs?", a: "No. On-campus work is unlimited and does not count toward the 24-hr off-campus limit. This includes jobs at your university's cafeteria, bookstore, or IT services." },
  { q: "Can I bring a spouse or partner to Canada?", a: "Your spouse or common-law partner may be eligible for an open work permit if you are enrolled full-time in a master's, doctoral, or certain professional degree programs. Check the eligible programs list at canada.ca." },
  { q: "What health coverage do I have?", a: "International students are typically not eligible for provincial health insurance (e.g., OHIP) in their first months. Most schools offer mandatory student health insurance plans. Check your enrolment confirmation." },
];

export default function InternationalStudents() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">🎓 Students</span>
        <h1 className="fp-header__title">International Student Guidance</h1>
        <p className="fp-header__subtitle">
          Work rules, PGWP eligibility, co-op requirements, DLI compliance, and health coverage —
          everything an international student in Canada needs to know.
        </p>
      </div>

      {/* Work rights */}
      <div className="fp-section">
        <h2 className="fp-section__title">💼 Work Rights by Situation</h2>
        <table className="fp-table">
          <thead>
            <tr><th>Your Situation</th><th>Work Limit</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {WORK_RULES.map(r => (
              <tr key={r.situation}>
                <td><strong>{r.situation}</strong></td>
                <td><span className={`fp-tag ${r.limit.includes("Not") ? "fp-tag--red" : r.limit.includes("Unlimited") ? "fp-tag--green" : "fp-tag--orange"}`}>{r.limit}</span></td>
                <td style={{ fontSize: "0.82rem", color: "#6b5a61" }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PGWP */}
      <div className="fp-section">
        <h2 className="fp-section__title">🎓 Post-Graduation Work Permit (PGWP)</h2>
        <div className="fp-alert fp-alert--info">
          <span className="fp-alert__icon">💡</span>
          <span className="fp-alert__text">The PGWP is an open work permit — you can work for any employer anywhere in Canada. It is one of the best pathways to Canadian work experience for PR eligibility.</span>
        </div>

        <div className="fp-grid fp-grid--2" style={{ marginBottom: "1rem" }}>
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.6rem", color: "#1a0d10" }}>Requirements</h4>
            <div className="fp-steps">
              {PGWP_REQUIREMENTS.map((r, i) => (
                <div key={i} className="fp-step">
                  <div className="fp-step__dot" />
                  <div className="fp-step__title">{r.req}</div>
                  <div className="fp-step__body">{r.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.6rem", color: "#1a0d10" }}>PGWP Length by Program</h4>
            <table className="fp-table">
              <thead><tr><th>Program Length</th><th>PGWP Length</th></tr></thead>
              <tbody>
                {PGWP_LENGTHS.map(row => (
                  <tr key={row.program}>
                    <td>{row.program}</td>
                    <td><span className={`fp-tag ${row.pgwp === "Not eligible" ? "fp-tag--red" : "fp-tag--green"}`}>{row.pgwp}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fp-card fp-card--info" style={{ marginTop: "0.75rem" }}>
              <span className="fp-card__title">After PGWP: Target Canadian Experience Class (CEC)</span>
              <p className="fp-card__body">After 1 year of skilled work (NOC TEER 0, 1, 2, or 3) in Canada, you qualify for CEC under Express Entry. This is the most common path from student → PR.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="fp-section">
        <h2 className="fp-section__title">❓ Frequently Asked Questions</h2>
        <div className="fp-accordion">
          {FAQS.map((faq, i) => (
            <div key={i} className="fp-accordion__item">
              <button className="fp-accordion__trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className={`fp-accordion__chevron ${openFaq === i ? "fp-accordion__chevron--open" : ""}`}>▼</span>
              </button>
              {openFaq === i && <div className="fp-accordion__body">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
