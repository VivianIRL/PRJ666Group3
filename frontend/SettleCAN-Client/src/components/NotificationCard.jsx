export default function NotificationCard({ title, description, urgency, cta }) {
  return (
    <div className={`nd-card nd-card--${urgency}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="nd-action">{cta}</button>
    </div>
  );
}
