import { useState } from "react";
import "../../scss/FeaturePages.scss";
import "../../scss/InfoPage.scss";

export default function ContactUs() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // In production this would POST to a backend endpoint or email service
    setSent(true);
  }

  return (
    <div className="fp-page info-page">
      <div className="info-hero info-hero--blue">
        <div className="info-hero__icon">✉️</div>
        <div>
          <div className="info-hero__eyebrow">Support</div>
          <h1 className="info-hero__title">Contact Us</h1>
          <p className="info-hero__sub">
            Have a question, found an issue, or want to suggest a resource? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="fp-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

        {/* Contact form */}
        <div>
          <h2 className="fp-section__title">Send us a message</h2>
          {sent ? (
            <div className="fp-card fp-card--accent" style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
              <h3 style={{ color: "#15803d" }}>Message sent!</h3>
              <p style={{ color: "#6b5a61", fontSize: "0.9rem" }}>
                Thanks for reaching out. We'll get back to you within 2 business days.
              </p>
              <button className="fp-btn fp-btn--ghost" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} style={{ marginTop: "1rem" }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Your Name", name: "name", type: "text", placeholder: "Jane Smith" },
                { label: "Email Address", name: "email", type: "email", placeholder: "jane@example.com" },
                { label: "Subject", name: "subject", type: "text", placeholder: "e.g. Question about checklists" },
              ].map(f => (
                <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#4a3a40" }}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    style={{ padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #d4c5ca", fontSize: "0.9rem", outline: "none" }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#4a3a40" }}>Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  required
                  rows={5}
                  style={{ padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #d4c5ca", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <button type="submit" className="fp-btn fp-btn--primary" style={{ alignSelf: "flex-start" }}>Send Message</button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 className="fp-section__title">Other ways to reach us</h2>
          {[
            { icon: "📧", label: "General Inquiries", value: "hello@settlecan.ca", href: "mailto:hello@settlecan.ca" },
            { icon: "🔒", label: "Privacy Questions", value: "privacy@settlecan.ca", href: "mailto:privacy@settlecan.ca" },
            { icon: "🐛", label: "Report a Bug", value: "bugs@settlecan.ca", href: "mailto:bugs@settlecan.ca" },
          ].map(item => (
            <div key={item.label} className="fp-card" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#8E0002", marginBottom: "0.15rem" }}>{item.label}</div>
                <a href={item.href} style={{ color: "#1a0d10", fontSize: "0.9rem", textDecoration: "none", fontWeight: 600 }}>{item.value}</a>
              </div>
            </div>
          ))}

          <div className="fp-card fp-card--accent" style={{ marginTop: "0.5rem" }}>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "#1a0d10" }}>📌 Response times</h4>
            <p style={{ fontSize: "0.83rem", color: "#6b5a61", margin: 0, lineHeight: 1.6 }}>
              We typically respond within 2 business days. For urgent immigration questions, please contact IRCC
              directly at <a href="https://www.canada.ca/en/immigration-refugees-citizenship" target="_blank" rel="noreferrer">canada.ca</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
