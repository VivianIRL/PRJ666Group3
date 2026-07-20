// LastUpdatedBadge.jsx — reusable pill showing "Last updated [date] (X days ago)"
// Shows nothing if loading or no date exists.
export default function LastUpdatedBadge({ dateStr, loading }) {
  if (loading || !dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  const daysAgo = Math.floor((Date.now() - date.getTime()) / 86400000);
  const relative = daysAgo === 0 ? "today"
    : daysAgo === 1 ? "1 day ago"
    : `${daysAgo} days ago`;

  const formatted = date.toLocaleDateString("en-CA", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
      fontSize: "0.72rem",
      fontWeight: 600,
      color: "#6b5a61",
      background: "#f5f0f2",
      border: "1px solid #e8e0e2",
      borderRadius: "999px",
      padding: "0.2rem 0.7rem",
      marginTop: "0.6rem",
    }}>
      🕐 Last updated {formatted} ({relative})
    </span>
  );
}
