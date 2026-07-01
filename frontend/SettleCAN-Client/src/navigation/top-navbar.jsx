import { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "../scss/TopNavbar.scss";
import { Button } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../state/AuthContext";
import { NotificationsContext } from "../state/NotificationsContext";

export default function TopNavbar() {
  const navigate   = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext) ?? {};
  const notifCtx   = useContext(NotificationsContext);
  const unreadCount = notifCtx?.notifications?.length ?? 0;

  function handleLogin(e)    { e.preventDefault(); navigate("/login"); }
  function handleRegister(e) { e.preventDefault(); navigate("/register"); }
  function handleSignOut(e)  { e.preventDefault(); navigate("/logout"); }
  return (
    <Navbar data-testid="top-navbar" sticky="top" className="top-navbar" style={{ zIndex: 100 }}>
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/" className="brand">
          <span className="brand-text">
            settle<span className="brand-highlight">CAN</span>
          </span>
        </Navbar.Brand>

        <Nav className="nav-links">
          <Nav.Link as={NavLink} to="/about" data-testid="top-navbar-about-btn">About</Nav.Link>
          <Nav.Link as={NavLink} to="/contact" data-testid="top-navbar-contact-btn">Contact</Nav.Link>
          {isAuthenticated && <Nav.Link as={NavLink} to="/dashboard" data-testid="top-navbar-dashboard-btn">Dashboard</Nav.Link>}
        </Nav>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              {user?.name && (
                <span className="navbar-greeting me-3 d-none d-md-inline" data-testid="top-navbar-hi-user-span" style={{ fontWeight: 500, color: "#5a4a50" }}>
                  Hi, {user.name}
                </span>
              )}
              <Link to="/notifications-dashboard" className="notif-bell" title="Notifications" data-testid="top-navbar-notifications-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </Link>
              <Button className="signin-btn" onClick={handleSignOut} data-testid="top-navbar-sign-out-btn">Sign out</Button>
            </>
          ) : (
            <>
              <Button className="signup-btn" onClick={handleRegister} data-testid="top-navbar-sign-up-btn">Sign up</Button>
              <Button className="signin-btn"  onClick={handleLogin} data-testid="top-navbar-sign-in-btn">Sign in</Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
