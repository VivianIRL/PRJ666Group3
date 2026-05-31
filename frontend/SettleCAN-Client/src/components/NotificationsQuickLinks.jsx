import { Link } from "react-router-dom";

export default function NotificationsQuickLinks({ links }) {
  return (
    <aside className="nd2__links">
      <h4 className="nd2__links-title">Quick Links</h4>
      <ul className="nd2__links-list">
        {links.map((l, index) => (
          <li key={index}>
            <Link to={l.url} className="nd2__link-item">{l.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
