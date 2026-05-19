import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button } from 'react-bootstrap';

export default function TopNavbar() {
  return (
      <Navbar className="bg-body-tertiary" sticky="top">
      <Container>
        <Navbar.Brand href="#home" >settle</Navbar.Brand>
        <Navbar.Brand href="#home" style={{ "margin-left": "-15px", "color": "#8F0004" }} >CAN</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" style={{ "margin-left": "37px" }} >
          <Nav className="me-auto">
            <Nav.Link href="#resources" style={{ "margin-right": "17px" }}>Resources</Nav.Link>
                <Navbar.Brand style={{ "padding-top": "4.5px", "color": "#ECEBED" }}>●</Navbar.Brand>
            <Nav.Link href="#about" style={{ "margin-right": "17px" }}>About</Nav.Link>
                <Navbar.Brand style={{ "padding-top": "4.5px", "color": "#ECEBED" }}>●</Navbar.Brand>
            <Nav.Link href="#contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse id="basic-navbar-nav-2" class="nav navbar-right">
            <Button as="a" variant="primary"  style={{ "margin-right": "17px" }}>
                Sign-up
            </Button>
            <Button as="a" variant="light">
                Log-in
            </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}