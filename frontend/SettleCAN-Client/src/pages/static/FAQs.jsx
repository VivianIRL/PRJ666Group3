import { useState } from "react";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "Who is SettleCAN for?",
        a: "SettleCAN is for anyone navigating life in Canada as a newcomer — international students, work permit holders, permanent residents, refugees, and temporary residents. The app personalises checklists and guidance based on your immigration status.",
      },
      {
        q: "Do I need to pay to use SettleCAN?",
        a: "No. SettleCAN is completely free to use. All checklists, guides, and settlement resources are available at no cost.",
      },
      {
        q: "Is SettleCAN available in French?",
        a: "English is currently the primary language. French language support is planned for a future release.",
      },
    ],
  },
  {
    category: "Checklists & Tasks",
    items: [
      {
        q: "Why does my checklist look different from another user's?",
        a: "Checklists are personalised to your immigration status. An international student sees categories about study permits and tuition, while a permanent resident sees PR card timelines and citizenship planning. You can also add your own custom items.",
      },
      {
        q: "Can I add my own checklist items?",
        a: "Yes — click '+ Add Item' at the top of the Checklist page to add a custom item to any category.",
      },
      {
        q: "My checklist progress disappeared. What happened?",
        a: "Checklist progress is saved per user account in your browser's local storage. If you cleared your browser data or switched to a different browser or device, your progress may not carry over. We recommend completing the checklist on a consistent device.",
      },
      {
        q: "If I complete a task in My Tasks, does it update my checklist?",
        a: "Yes. When you mark a task as complete in the Tasks page, the corresponding checklist item is automatically checked. For example, completing 'Apply for Social Insurance Number (SIN)' also checks the SIN item in your checklist.",
      },
    ],
  },
  {
    category: "Immigration & Status",
    items: [
      {
        q: "What does 'Visitor / Tourist' mean in SettleCAN?",
        a: "Visitor / Tourist refers to someone visiting Canada on a visitor visa or eTA without a study or work permit. This includes tourists, family visitors, and people exploring their options before applying for a different permit.",
      },
      {
        q: "Can I change my immigration status in the app?",
        a: "Yes. Go to your Profile and update your immigration status. Your checklist will update automatically to reflect your new status. Note: existing progress will be preserved if you've saved checklist items.",
      },
      {
        q: "Does SettleCAN provide official immigration advice?",
        a: "No. SettleCAN provides general educational information only. For official immigration advice, contact a Regulated Canadian Immigration Consultant (RCIC) or an immigration lawyer. Always verify critical deadlines with IRCC at canada.ca.",
      },
    ],
  },
  {
    category: "Account & Data",
    items: [
      {
        q: "How do I reset my password?",
        a: "On the login page, click 'Forgot password?' and enter your email. You'll receive a reset link. If you don't see the email, check your spam folder.",
      },
      {
        q: "Is my data private?",
        a: "Yes. Your data is stored securely and is only accessible to you. We do not sell your personal information. See our Privacy Policy for full details.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact us at privacy@settlecan.ca with your account email and a deletion request. We will remove all your data within 30 days.",
      },
    ],
  },
];

export default function FAQs() {
  const [open, setOpen] = useState({});

  function toggle(cat, i) {
    const key = `${cat}-${i}`;
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">❓</div>
        <div>
          <div className="info-hero__eyebrow">Resources</div>
          <h1 className="info-hero__title">Frequently Asked Questions</h1>
          <p className="info-hero__sub">
            Answers to the most common questions about using SettleCAN and navigating your Canadian settlement journey.
          </p>
        </div>
      </div>

      {FAQS.map(section => (
        <div key={section.category} className="fp-section">
          <h2 className="fp-section__title">{section.category}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {section.items.map((faq, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = !!open[key];
              return (
                <div key={i} className="fp-card" style={{ padding: "0", overflow: "hidden" }}>
                  <button
                    onClick={() => toggle(section.category, i)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none",
                      padding: "1rem 1.25rem", cursor: "pointer", display: "flex",
                      justifyContent: "space-between", alignItems: "center", gap: "1rem",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1a0d10", flex: 1 }}>{faq.q}</span>
                    <span style={{ fontSize: "1.1rem", color: "#8E0002", flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 1.25rem 1rem", fontSize: "0.88rem", color: "#4a3a40", lineHeight: 1.7, borderTop: "1px solid #f0e8ea" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fp-section">
        <div className="fp-card fp-card--accent" style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 0.5rem", color: "#1a0d10" }}>Still have a question?</h3>
          <p style={{ color: "#6b5a61", fontSize: "0.88rem", margin: "0 0 1rem" }}>
            Our team is happy to help. Reach out and we'll get back to you within 2 business days.
          </p>
          <a href="/contact" className="fp-btn fp-btn--primary" style={{ textDecoration: "none", display: "inline-block" }}>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
