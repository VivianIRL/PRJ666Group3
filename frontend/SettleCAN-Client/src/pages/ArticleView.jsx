// ArticleView.jsx — article-style reading layout for settlement guides & content
// Route: /articles  (list) and /articles/:id (single)
// Pulls from GET /api/content; falls back to curated static articles when offline.
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchContent, fetchContentById } from "../service/taskService";
import "../scss/ArticleView.scss";

// ── Static fallback articles (shown when API is offline) ──────────────────────
const STATIC_ARTICLES = [
  {
    id: "sin-guide",
    title: "How to Apply for a Social Insurance Number (SIN)",
    category: "Employment",
    status: "Published",
    readTime: 4,
    summary: "Your SIN is required to work legally in Canada, file taxes, and access government benefits. Here's everything you need to know.",
    sections: [
      {
        heading: "What is a SIN?",
        body: "A Social Insurance Number (SIN) is a 9-digit number issued by Service Canada. It is required to work in Canada, file income taxes, and access government programs and benefits such as Employment Insurance (EI) and the Canada Pension Plan (CPP).",
      },
      {
        heading: "Who Can Apply?",
        body: "Canadian citizens, permanent residents, and temporary residents with a valid work permit or study permit with off-campus work authorization can apply. Visitors without work authorization cannot get a SIN.",
      },
      {
        heading: "What Documents Do You Need?",
        body: "You will need a primary document such as a passport, study permit, or work permit. Service Canada will accept original documents only — no photocopies.",
      },
      {
        heading: "How to Apply",
        body: "Visit any Service Canada Centre in person. Applications can also be submitted by mail, but in-person is faster. You will receive your SIN immediately at the counter.",
      },
      {
        heading: "Important Notes",
        body: "Temporary SINs (starting with the digit 9) expire when your immigration document expires. If your status changes to permanent resident, update your SIN. Keep your SIN confidential — only share it when legally required.",
      },
    ],
    links: [
      { label: "Service Canada — SIN Application", url: "https://www.canada.ca/en/employment-social-development/services/sin.html" },
      { label: "Find a Service Canada Centre", url: "https://www.canada.ca/en/employment-social-development/corporate/portfolio/service-canada/offices.html" },
    ],
    relatedPaths: [
      { label: "SIN Info Page", path: "/info/sin" },
      { label: "Work Eligibility", path: "/work-eligibility" },
      { label: "Tax Return Guide", path: "/guides/tax-return" },
    ],
  },
  {
    id: "health-card",
    title: "Registering for Provincial Health Insurance",
    category: "Health",
    status: "Published",
    readTime: 5,
    summary: "Provincial health insurance covers most medical services — but the 3-month waiting period means you need private coverage first.",
    sections: [
      {
        heading: "Why Register Early?",
        body: "Most provinces impose a 3-month waiting period before coverage begins. The clock starts from the date you register — not your arrival date. Register on day one to minimize your uninsured window.",
      },
      {
        heading: "Coverage by Province",
        body: "Ontario (OHIP), BC (MSP/HIBC), Alberta (AHCIP), and Quebec (RAMQ) all have separate programs. Eligibility and documents vary. International students in Ontario are often covered through their school's insurance plan during the waiting period.",
      },
      {
        heading: "Documents Required",
        body: "You typically need: a valid government-issued photo ID, proof of immigration status (study or work permit, PR card), and proof of Ontario residency (e.g. lease agreement or utility bill).",
      },
      {
        heading: "During the Waiting Period",
        body: "Purchase private travel/visitor health insurance to cover the gap. Many newcomer packages from TD, RBC, and Manulife include temporary coverage. Your school or employer may also provide interim coverage.",
      },
      {
        heading: "After Registration",
        body: "You will receive your health card in the mail. Keep it with you at all times. Present it at clinics and hospitals to avoid being billed.",
      },
    ],
    links: [
      { label: "OHIP — Ontario Health Insurance", url: "https://www.ontario.ca/page/apply-ohip-and-get-health-card" },
      { label: "BC Health Insurance (HIBC)", url: "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol" },
    ],
    relatedPaths: [
      { label: "Health Info Page", path: "/info/health" },
      { label: "Settlement Checklist", path: "/checklist" },
      { label: "Document Alerts", path: "/document-alerts" },
    ],
  },
  {
    id: "study-permit-extension",
    title: "How to Apply for a Study Permit Extension",
    category: "Immigration",
    status: "Published",
    readTime: 6,
    summary: "If your study program continues beyond your current permit expiry, you must apply to extend. Apply at least 90 days before expiry.",
    sections: [
      {
        heading: "When to Apply",
        body: "IRCC recommends applying at least 90 days before your current study permit expires. If you apply before expiry, you receive 'implied status' and can continue studying while your application is processed.",
      },
      {
        heading: "Implied Status",
        body: "Implied status allows you to continue under the same conditions as your original permit while renewal is pending. You cannot travel outside Canada and re-enter under implied status.",
      },
      {
        heading: "Documents Required",
        body: "You will need: a valid passport (extending at least 3 months beyond your requested permit end date), proof of enrolment from your DLI (Designated Learning Institution), proof of financial support, and any previous permits.",
      },
      {
        heading: "How to Apply Online",
        body: "Log in to your IRCC secure account. Select 'Apply to change conditions, extend my stay or remain in Canada as a student.' Complete the application, pay the $150 CAD fee, and submit.",
      },
      {
        heading: "Processing Times",
        body: "Processing currently takes 5–8 weeks for inside-Canada applications. Check IRCC's processing time tool for the most up-to-date estimate. Apply well in advance.",
      },
    ],
    links: [
      { label: "IRCC — Extend Your Study Permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html" },
      { label: "IRCC Processing Times", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html" },
    ],
    relatedPaths: [
      { label: "Permit Renewal Guide", path: "/guides/permit-renewal" },
      { label: "Compliance Tracking", path: "/compliance" },
      { label: "Document Alerts", path: "/document-alerts" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function estimateReadTime(sections = []) {
  const words = sections.reduce((acc, s) => acc + (s.body ?? "").split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 200));
}

function categoryColor(cat) {
  const MAP = {
    Employment: "#2563eb", Health: "#15803d", Immigration: "#8E0002",
    Finance: "#d97706", Housing: "#7c3aed", General: "#475569",
  };
  return MAP[cat] ?? "#475569";
}

// ── Article list ──────────────────────────────────────────────────────────────
function ArticleList({ articles }) {
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const cats = ["All", ...new Set(articles.map(a => a.category))];
  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All" || a.category === catFilter;
    return matchSearch && matchCat && a.status === "Published";
  });

  return (
    <div className="av-list-page">
      <div className="av-list-header">
        <h1 className="av-list-title">Settlement Guides & Articles</h1>
        <p className="av-list-sub">Expert guidance for every step of your Canadian immigration journey.</p>
      </div>

      {/* Filters */}
      <div className="av-list-toolbar">
        <input
          className="av-list-search"
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="av-list-cats">
          {cats.map(c => (
            <button
              key={c}
              className={`av-list-cat${catFilter === c ? " av-list-cat--active" : ""}`}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="av-list-empty">No articles match your search.</p>
      ) : (
        <div className="av-list-grid">
          {filtered.map(a => (
            <Link key={a.id} to={`/articles/${a.id}`} className="av-card">
              <div className="av-card__tag" style={{ background: categoryColor(a.category) }}>
                {a.category}
              </div>
              <h2 className="av-card__title">{a.title}</h2>
              {a.summary && <p className="av-card__summary">{a.summary}</p>}
              <div className="av-card__meta">
                <span>📖 {a.readTime ?? estimateReadTime(a.sections)} min read</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single article ────────────────────────────────────────────────────────────
function ArticlePage({ article }) {
  const navigate    = useNavigate();
  const contentRef  = useRef(null);
  const readTime    = article.readTime ?? estimateReadTime(article.sections);

  // Scroll spy — highlight active section in TOC
  const [activeSection, setActiveSection] = useState(0);
  useEffect(() => {
    const headings = contentRef.current?.querySelectorAll(".av-section__heading") ?? [];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = [...headings].indexOf(e.target);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [article]);

  return (
    <div className="av-page">
      {/* Back */}
      <button className="av-back" onClick={() => navigate("/articles")}>
        ← Back to Articles
      </button>

      {/* Hero */}
      <header className="av-hero">
        <span className="av-hero__cat" style={{ background: categoryColor(article.category) }}>
          {article.category}
        </span>
        <h1 className="av-hero__title">{article.title}</h1>
        {article.summary && <p className="av-hero__summary">{article.summary}</p>}
        <div className="av-hero__meta">
          <span>📖 {readTime} min read</span>
          {article.last_updated && (
            <span>Updated {new Date(article.last_updated).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
          )}
        </div>
      </header>

      <div className="av-body">
        {/* Table of contents */}
        {article.sections?.length > 1 && (
          <aside className="av-toc">
            <h3 className="av-toc__title">Contents</h3>
            <ol className="av-toc__list">
              {article.sections.map((s, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className={`av-toc__link${activeSection === i ? " av-toc__link--active" : ""}`}
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>

            {/* Related links */}
            {article.relatedPaths?.length > 0 && (
              <div className="av-toc__related">
                <h4 className="av-toc__related-title">Related</h4>
                {article.relatedPaths.map((r, i) => (
                  <Link key={i} to={r.path} className="av-toc__related-link">
                    {r.label} →
                  </Link>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* Article content */}
        <article className="av-content" ref={contentRef}>
          {article.sections?.map((s, i) => (
            <section key={i} id={`section-${i}`} className="av-section">
              <h2 className="av-section__heading">{s.heading}</h2>
              <p className="av-section__body">{s.body}</p>
            </section>
          ))}

          {/* External links */}
          {article.links?.length > 0 && (
            <div className="av-links">
              <h3 className="av-links__title">Official Resources</h3>
              <ul className="av-links__list">
                {article.links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="av-links__link">
                      🔗 {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

// ── Route root ────────────────────────────────────────────────────────────────
export default function ArticleView() {
  const { id }      = useParams();
  const [articles, setArticles] = useState(STATIC_ARTICLES);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchContent()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API articles (add readTime estimate if missing)
          const api = data
            .filter(a => a.status === "Published")
            .map(a => ({
              ...a,
              id:       String(a.content_id ?? a.id),
              sections: a.sections ?? [],
              readTime: a.readTime ?? estimateReadTime(a.sections ?? []),
            }));
          // Keep static articles that don't have an API counterpart
          const apiIds = new Set(api.map(a => a.id));
          const merged = [...api, ...STATIC_ARTICLES.filter(s => !apiIds.has(s.id))];
          setArticles(merged);
        }
      })
      .catch(() => { /* offline — keep static */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: "#888" }}>Loading articles…</div>;

  if (id) {
    const article = articles.find(a => String(a.id) === id);
    if (!article) return (
      <div style={{ padding: "2rem" }}>
        <p>Article not found.</p>
        <Link to="/articles">← Back to Articles</Link>
      </div>
    );
    return <ArticlePage article={article} />;
  }

  return <ArticleList articles={articles} />;
}
