import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Button } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";

import "../scss/TopNavbar.scss";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function TopNavbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext)

  function handleLogin(e) {
    e.preventDefault();
    navigate("/login");
  }

  function handleRegister(e) {
    e.preventDefault();
    navigate("/register");
  }

  function handleSignout(e) {
    e.preventDefault();
    setUser(null)
    navigate("/");
  }

  return (
    <Navbar sticky="top" className="top-navbar">
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/" className="brand">
          <span className="brand-text">
            settle<span className="brand-highlight">CAN</span>
          </span>
        </Navbar.Brand>

        <Nav className="nav-links">
          <Nav.Link href="#resources">Resources</Nav.Link>
          <Nav.Link as={NavLink} to="/about">
            About
          </Nav.Link>
          <Nav.Link href="#contact">Contact</Nav.Link>
        </Nav>

        <div className="auth-buttons">
          {user ?
          <>
              Hello, {user.firstName}
            <Button className="signup-btn" onClick={handleSignout}>
              Sign out
            </Button>
          </> :
          <>
            <Button className="signup-btn" onClick={handleRegister}>
              Sign up
            </Button>
            <Button className="signin-btn" onClick={handleLogin}>
              Sign in
            </Button>
          </>}
          
        </div>
      </Container>
    </Navbar>
  );
}
