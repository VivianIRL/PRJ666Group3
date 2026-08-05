// ComplianceTracking.jsx — a filtered view over My Tasks. Compliance rules
// are real task_nodes (task_category === "COMPLIANCE", generated per the
// user's immigration status — see backend/db/init/004_task_hierarchy_compliance.sql)
// so checking one off here updates the exact same record My Tasks shows,
// with the same dates/notifications/status roll-up as any other task.
import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { fetchTaskTree, updateTaskNode, generateOnboardingTasks } from "../service/taskService";
import "../scss/FeaturePages.scss";

const SEVERITY_META = {
  HIGH:   { label: "High priority", cls: "fp-tag--red" },
  NORMAL: { label: "Standard",      cls: "fp-tag--blue" },
  LOW:    { label: "Standard",      cls: "fp-tag--blue" },
};

export default function ComplianceTracking() {
  const { user } = useContext(AuthContext);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeGroup, setActiveGroup] = useState("All");
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setLoadError(false);
    try {
      await generateOnboardingTasks(user.id).catch(() => {});
      const data = await fetchTaskTree();
      setTree(Array.isArray(data) ? data : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const groups = tree.filter((t) => t.category === "COMPLIANCE");
  const rules = groups.flatMap((g) =>
    (g.children ?? []).map((c) => ({ ...c, groupTitle: g.title }))
  );
  const visible = activeGroup === "All" ? rules : rules.filter((r) => r.groupTitle === activeGroup);
  const checkedCount = rules.filter((r) => r.status === "COMPLETED").length;
  const criticalPending = rules.filter((r) => r.priority === "HIGH" && r.status !== "COMPLETED").length;

  async function toggle(rule) {
    const next = rule.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    setTree((prev) => applyStatus(prev, rule.id, next)); // optimistic
    try {
      const updated = await updateTaskNode(rule.id, { status: next });
      if (Array.isArray(updated)) setTree(updated);
    } catch {
      setTree((prev) => applyStatus(prev, rule.id, rule.status)); // revert
    }
  }

  if (loading) return <div className="fp-page fp-page--narrow"><p style={{ color: "#9a8a90" }}>Loading your compliance checklist…</p></div>;

  if (loadError) {
    return (
      <div className="fp-page fp-page--narrow">
        <p style={{ color: "#9a8a90" }}>Couldn't load your compliance checklist. Check your connection and try again.</p>
        <button className="fp-btn fp-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="fp-page fp-page--narrow">
      <div className="fp-header">
        <span className="fp-header__eyebrow">📋 Stay Compliant</span>
        <h1 className="fp-header__title">Compliance Tracking</h1>
        <p className="fp-header__subtitle">
          Track your permit conditions, work-hour limits, enrollment requirements, and legal obligations —
          the same checklist that shows up under <Link to="/tasks">My Tasks</Link>.
        </p>
      </div>

      <div className="fp-alert fp-alert--danger">
        <span className="fp-alert__icon">🚨</span>
        <span className="fp-alert__text">
          <strong className="fp-alert__title">Non-compliance is serious</strong>
          Violating permit conditions can result in your permit being cancelled, removal from Canada, or a finding of inadmissibility that affects future applications for PR or citizenship.
        </span>
      </div>

      {rules.length === 0 ? (
        <div className="fp-alert" style={{ marginTop: "1rem" }}>
          <span className="fp-alert__icon">✅</span>
          <span className="fp-alert__text">
            <strong className="fp-alert__title">Nothing to review yet</strong>
            We couldn't generate a compliance checklist for your profile — make sure your immigration status is set on your{" "}
            <Link to="/profile">profile page</Link>.
          </span>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="fp-stats">
            <div className="fp-stat">
              <span className="fp-stat__num">{checkedCount}</span>
              <span className="fp-stat__label">Reviewed</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat__num">{rules.length - checkedCount}</span>
              <span className="fp-stat__label">To Review</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat__num">{criticalPending}</span>
              <span className="fp-stat__label">High-Priority Pending</span>
            </div>
          </div>

          <div className="fp-progress" style={{ marginBottom: "1.5rem" }}>
            <div className="fp-progress__bar" style={{ width: `${(checkedCount / rules.length) * 100}%` }} />
          </div>

          {/* Group filters */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button
              onClick={() => setActiveGroup("All")}
              className={`fp-btn ${activeGroup === "All" ? "fp-btn--primary" : "fp-btn--ghost"}`}
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
            >
              📋 All
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.title)}
                className={`fp-btn ${activeGroup === g.title ? "fp-btn--primary" : "fp-btn--ghost"}`}
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
              >
                {g.title}
              </button>
            ))}
          </div>

          {/* Compliance checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {visible.map((rule) => {
              const meta = SEVERITY_META[rule.priority] ?? SEVERITY_META.NORMAL;
              const isOpen = openId === rule.id;
              const isDone = rule.status === "COMPLETED";

              return (
                <div
                  key={rule.id}
                  style={{
                    background: isDone ? "#f6fff9" : "#fff",
                    borderRadius: "0.85rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    border: rule.priority === "HIGH" && !isDone ? "1.5px solid #fca5a5" : "1.5px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem" }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggle(rule)}
                      style={{ width: 17, height: 17, accentColor: "var(--color-primary)", cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: isDone ? "#9a8a90" : "#1a0d10", textDecoration: isDone ? "line-through" : "none" }}>
                          {rule.title}
                        </span>
                        <span className={`fp-tag ${meta.cls}`} style={{ fontSize: "0.65rem" }}>{meta.label}</span>
                        <span className="fp-tag fp-tag--gray" style={{ fontSize: "0.65rem" }}>{rule.groupTitle}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpenId(isOpen ? null : rule.id)}
                      style={{ background: "none", border: "none", color: "#9a8a90", cursor: "pointer", fontSize: "0.75rem", flexShrink: 0 }}
                    >
                      {isOpen ? "▲" : "▼"} Details
                    </button>
                  </div>
                  {isOpen && rule.description && (
                    <div style={{ padding: "0 1rem 0.85rem 3rem", fontSize: "0.85rem", color: "#5a4a50", lineHeight: "1.6", borderTop: "1px solid #f5eff2" }}>
                      {rule.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Updates one node's status inside the (possibly nested) tree, without a
// round-trip — used for the optimistic toggle and its rollback on failure.
function applyStatus(nodes, id, status) {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, status };
    if (n.children?.length) return { ...n, children: applyStatus(n.children, id, status) };
    return n;
  });
}
