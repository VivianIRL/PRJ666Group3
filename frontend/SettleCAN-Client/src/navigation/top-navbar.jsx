import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar() {
  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault();
    navigate('/login');
  }

  function handleRegister(e) {
    e.preventDefault();
    navigate('/register');
  }

  return (
      <Navbar className="bg-body-tertiary" sticky="top">
      <Container>
        <Navbar.Brand href="/" >settle</Navbar.Brand>
        <Navbar.Brand href="/" style={{ "marginLeft": "-15px", "color": "#8F0004" }} >CAN</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" style={{ "marginLeft": "37px" }} >
          <Nav className="me-auto">
            <Nav.Link href="#resources" style={{ "marginRight": "17px" }}>Resources</Nav.Link>
                <Navbar.Brand style={{ "paddingTop": "4.5px", "color": "#ECEBED" }}>●</Navbar.Brand>
            <Nav.Link href="#about" style={{ "marginRight": "17px" }}>About</Nav.Link>
                <Navbar.Brand style={{ "paddingTop": "4.5px", "color": "#ECEBED" }}>●</Navbar.Brand>
            <Nav.Link href="#contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse id="basic-navbar-nav-2" class="nav navbar-right">
            <Button as="a" variant="primary"  style={{ "marginRight": "17px" }} onClick={handleRegister}>
                Sign-up
            </Button>
            <Button as="a" variant="light" onClick={handleLogin}>
                Log-in
            </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}