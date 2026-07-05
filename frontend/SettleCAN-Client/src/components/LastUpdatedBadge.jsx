// LastUpdatedBadge.jsx — displays when content was last updated
// Shows nothing while loading or if no date is available.
//
// Usage:
//   <LastUpdatedBadge date={apiContent?.last_updated} loading={loading} />

function timeAgo(dateStr) {
  const diffDays = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

export default function LastUpdatedBadge({ date, loading }) {
  if (loading || !date) return null;

  const formatted = new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.78rem",
        color: "#7a6a70",
        background: "#f9f5f6",
        border: "1px solid #ecdfe2",
        borderRadius: "999px",
        padding: "0.3rem 0.75rem",
        marginTop: "0.6rem",
      }}
    >
      <span style={{ fontSize: "0.85rem" }}>🕓</span>
      <span>
        Last updated <strong style={{ color: "#5a4a50" }}>{formatted}</strong> (
        {timeAgo(date)})
      </span>
    </div>
  );
}
