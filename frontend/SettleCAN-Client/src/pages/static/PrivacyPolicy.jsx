import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

export default function PrivacyPolicy() {
  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">🔒</div>
        <div>
          <div className="info-hero__eyebrow">Legal</div>
          <h1 className="info-hero__title">Privacy Policy</h1>
          <p className="info-hero__sub">Last updated: January 2026</p>
        </div>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">1. Information We Collect</h2>
        <p>
          SettleCAN collects information you provide directly when you create an account — including your name,
          email address, immigration status, province, and arrival date. We also collect checklist progress,
          task completion data, and any notes you add to your profile. This information is stored securely and
          used solely to personalise your settlement experience.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">2. How We Use Your Information</h2>
        <p>
          We use the information you provide to deliver personalised checklists, task reminders, and content
          relevant to your immigration status. We do not sell, rent, or share your personal information with
          third parties for marketing purposes. Anonymised, aggregated data may be used to improve the platform.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">3. Data Storage & Security</h2>
        <p>
          Your data is stored using Supabase, a secure cloud database provider with encryption at rest and
          in transit. Row-level security policies ensure your data is only accessible to you. We follow
          industry-standard security practices and review them regularly.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">4. Cookies & Local Storage</h2>
        <p>
          SettleCAN uses browser localStorage to save your checklist progress and session preferences locally
          on your device. We do not use third-party tracking cookies or analytics services that share data
          externally.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">5. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time by contacting
          us at <a href="mailto:privacy@settlecan.ca">privacy@settlecan.ca</a>. Account deletion removes all
          personal data from our systems within 30 days.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">6. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Significant changes will be communicated via
          in-app notification. Continued use of SettleCAN after changes are posted constitutes acceptance of
          the updated policy.
        </p>
      </div>

      <div className="fp-section">
        <h2 className="fp-section__title">7. Contact</h2>
        <p>
          For privacy inquiries, contact us at <a href="mailto:privacy@settlecan.ca">privacy@settlecan.ca</a>.
        </p>
      </div>
    </div>
  );
}
