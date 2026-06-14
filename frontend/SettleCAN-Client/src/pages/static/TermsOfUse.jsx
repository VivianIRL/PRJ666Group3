import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

export default function TermsOfUse() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">📄</div>
        <div>
          <div className="info-hero__eyebrow">Legal</div>
          <h1 className="info-hero__title">Terms of Use</h1>
          <p className="info-hero__sub">Last updated: January 2026</p>
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">1. Acceptance of Terms</h2>
        <p>
          By creating an account or using SettleCAN, you agree to these Terms of Use. If you do not agree,
          please do not use the platform. SettleCAN is a student project built to assist newcomers to Canada
          and is not a substitute for professional legal or immigration advice.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">2. Use of the Platform</h2>
        <p>
          SettleCAN is provided for personal, non-commercial use. You agree not to misuse the platform,
          attempt to access other users' data, reverse-engineer any part of the service, or use it for
          any unlawful purpose. You are responsible for maintaining the security of your account credentials.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">3. Information Accuracy</h2>
        <p>
          The information provided on SettleCAN is for general guidance only. Immigration rules, deadlines,
          and program requirements change frequently. Always verify information with official government
          sources such as IRCC (Immigration, Refugees and Citizenship Canada) at canada.ca or consult a
          Regulated Canadian Immigration Consultant (RCIC) or immigration lawyer.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">4. No Legal Advice</h2>
        <p>
          Nothing on SettleCAN constitutes legal advice. The checklists, guides, and resources are
          educational tools intended to help newcomers organise their settlement journey — they do not
          create a lawyer-client relationship of any kind.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">5. Intellectual Property</h2>
        <p>
          All content on SettleCAN, including text, design, and code, is the property of the SettleCAN
          development team unless otherwise noted. Government resources linked from the platform belong
          to their respective copyright holders.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">6. Limitation of Liability</h2>
        <p>
          SettleCAN is provided "as is" without warranties of any kind. We are not liable for any damages
          arising from your use of the platform or reliance on information provided. Use of SettleCAN is
          at your own risk.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">7. Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of SettleCAN after changes
          constitutes acceptance of the revised terms.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">8. Contact</h2>
        <p>
          Questions about these terms? Email us at <a href="mailto:legal@settlecan.ca">legal@settlecan.ca</a>.
        </p>
      </div>
    </div>
  );
}
