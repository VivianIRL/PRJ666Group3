// PolicyUpdates.jsx — live IRCC newsroom feed (Government of Canada's own
// public news API — the same feed canada.ca's RSS page serves). Fetched
// through the backend (see backend/src/services/policyFeedService.js) so
// there's no fabricated/mock news content: if the feed is unreachable, the
// page says so rather than showing stale or invented items.
import { useState, useEffect, useCallback } from "react";
import { fetchPolicyUpdates } from "../service/taskService";
import "../scss/FeaturePages.scss";

const CATEGORY_META = {
  "news releases": { bg: "#fdeaed", text: "var(--color-primary)" },
  "notices":       { bg: "#e8f0fe", text: "#1d4ed8" },
  "backgrounders": { bg: "#f3e8ff", text: "#7c3aed" },
  "speeches":      { bg: "#e6f9ef", text: "#15803d" },
  "statements":    { bg: "#fff3e0", text: "#c2410c" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default function PolicyUpdates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetchPolicyUpdates()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="fp-page">
      <div className="fp-header">
        <span className="fp-header__eyebrow">📰 Policy</span>
        <h1 className="fp-header__title">Updated With Policy Changes</h1>
        <p className="fp-header__subtitle">
          Live from IRCC's official newsroom feed — the same announcements published on canada.ca.
        </p>
      </div>

      <div className="fp-alert fp-alert--info">
        <span className="fp-alert__icon">🔗</span>
        <span className="fp-alert__text">
          Every item below is pulled directly from Immigration, Refugees and Citizenship Canada's public news feed.
          Click any headline to read the full official release on canada.ca.
        </span>
      </div>

      {loading ? (
        <p style={{ color: "#9a8a90", marginTop: "1rem" }}>Loading the latest updates…</p>
      ) : loadError ? (
        <div className="fp-alert fp-alert--danger" style={{ marginTop: "1rem" }}>
          <span className="fp-alert__icon">⚠️</span>
          <span className="fp-alert__text">
            <strong className="fp-alert__title">Couldn't load the latest updates</strong>
            The IRCC news feed didn't respond. <button className="fp-btn fp-btn--ghost" style={{ marginLeft: "0.5rem" }} onClick={load}>Retry</button>
          </span>
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: "#9a8a90", marginTop: "1rem" }}>No updates available right now.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
          {items.map((u) => {
            const cat = CATEGORY_META[u.category] ?? { bg: "#f3f0f1", text: "#6b5a61" };
            return (
              <a
                key={u.link}
                href={u.link}
                target="_blank"
                rel="noreferrer"
                className="fp-card"
                style={{ borderLeft: `4px solid ${cat.text}`, textDecoration: "none" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  {u.category && (
                    <span style={{ background: cat.bg, color: cat.text, fontSize: "0.68rem", fontWeight: 700, borderRadius: "999px", padding: "0.18rem 0.6rem", textTransform: "capitalize" }}>
                      {u.category}
                    </span>
                  )}
                  <span style={{ fontSize: "0.72rem", color: "#9a8a90" }}>{formatDate(u.publishedAt)}</span>
                </div>

                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a0d10", margin: 0 }}>{u.title}</h3>
                {u.summary && <p style={{ fontSize: "0.85rem", color: "#5a4a50", lineHeight: 1.6, margin: 0 }}>{u.summary}</p>}

                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  Read official source →
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
