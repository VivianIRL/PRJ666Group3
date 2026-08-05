// AppSidebar.jsx — persistent sidebar shown on all authenticated pages

import { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";
import "../scss/AppSidebar.scss";

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { to: "/getting-started",         icon: "🗺️", label: "Get Started"   },
  { to: "/dashboard",               icon: "🏠", label: "Dashboard"     },

  { to: "/pr-pathway",              icon: "🍁", label: "PR Pathway"    },
  { to: "/tasks",                   icon: "✅", label: "My Tasks"      },
  { to: "/notifications-dashboard", icon: "🔔", label: "Notifications" },
  { to: "/features",                icon: "🌐", label: "Resources"     },
  { to: "/articles",               icon: "📰", label: "Articles"      },
  { to: "/community",               icon: "💬", label: "Community"     },
  { to: "/compliance",              icon: "📋", label: "Compliance"    },
  { to: "/document-alerts",         icon: "⏰", label: "Doc Alerts"    },
  { to: "/housing",                 icon: "🏠", label: "Housing"       },
];

export default function AppSidebar({ collapsed, onToggle }) {
  const { user } = useContext(AuthContext);
  const notifCtx         = useContext(NotificationsContext);
  const navigate         = useNavigate();
  const location          = useLocation();
  const unread           = notifCtx?.notifications?.length ?? 0;

  // Mobile off-canvas drawer state — independent of the desktop
  // expanded/collapsed toggle above. Below the sidebar's mobile breakpoint
  // (see AppSidebar.scss) the sidebar is hidden by default and this hamburger
  // slides it in as an overlay instead of squeezing the page content.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer automatically on navigation so it doesn't stay open
  // over the new page.
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  function handleSignOut() { navigate("/logout"); }

  // The desktop icon-only "collapsed" rail and the mobile off-canvas drawer
  // are independent toggles, but both end up hiding labels via conditional
  // rendering below — so while the drawer is open on mobile, always render
  // full content regardless of whatever the desktop collapse toggle is set
  // to (a CSS override alone can't do this, since the collapsed elements
  // aren't in the DOM to begin with).
  const showFull = !collapsed || mobileOpen;

  return (
    <>
      {/* Only rendered while closed — once the drawer is open, the backdrop
          (tap outside) and navigating to a page are the only ways to
          dismiss it; no explicit close button competing with the nav
          items for space at the top of the drawer. */}
      {!mobileOpen && (
        <button
          className="asb-mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={false}
        >
          ☰
        </button>
      )}

      {mobileOpen && <div className="asb-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`app-sidebar ${collapsed ? "app-sidebar--collapsed" : ""} ${mobileOpen ? "app-sidebar--mobile-open" : ""}`}>

        {/* Desktop-only: collapse/expand rail toggle. Hidden on the mobile
            drawer (see AppSidebar.scss) — the drawer itself has no header,
            nav items start immediately at the top instead. */}
        <div className="asb-brand">
          <button className="asb-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User greeting — the whole block opens Profile settings, not just
            the avatar. Desktop-only, same as .asb-brand above — hidden on
            the mobile drawer to keep nav items as the very first content. */}
        {showFull && user && (
          <NavLink to="/profile" className="asb-user" aria-label="Open profile settings" title="Profile settings">
            <span className="asb-avatar">{user.name[0]}</span>
            <div>
              <div className="asb-user__name">{user.fullName || user.name}</div>
              <div className="asb-user__status">{user.immigrationStatus}</div>
            </div>
          </NavLink>
        )}

        {/* Navigation */}
        <nav className="asb-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `asb-nav__item ${isActive ? "asb-nav__item--active" : ""}`}
              title={showFull ? undefined : item.label}
            >
              <span className="asb-nav__icon">{item.icon}</span>
              {showFull && <span className="asb-nav__label">{item.label}</span>}
              {showFull && item.to === "/notifications-dashboard" && unread > 0 && (
                <span className="asb-badge">{unread > 9 ? "9+" : unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="asb-bottom">
          {showFull ? (
            <button className="asb-logout" onClick={handleSignOut}>
              ↩ Sign out
            </button>
          ) : (
            <button className="asb-logout asb-logout--icon" onClick={handleSignOut} title="Sign out">↩</button>
          )}
        </div>
      </aside>
    </>
  );
}
