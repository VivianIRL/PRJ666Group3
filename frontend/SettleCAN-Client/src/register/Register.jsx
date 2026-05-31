import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../service/authService";

function ImmigrationDetails() {
  const navigate = useNavigate();

  async function handleFormSubmit(formData) {
    await formData;
    var firstName = formData.get("firstName");
    if (!firstName) {
      alert("ERROR: First name is empty.");
      return;
    }
    var lastName = formData.get("lastName");
    if (!lastName) {
      alert("ERROR: Last name is empty.");
      return;
    }
    var email = formData.get("email");
    if (!email) {
      alert("ERROR: Email is required");
      return;
    }
    var dateOB = new Date(formData.get("dateOfBirth"));
    if (!formData.get("dateOfBirth")) {
      alert("ERROR: Date of birth is empty.");
      return;
    }
    var password = formData.get("password");
    if (!password) {
      alert("ERROR: Password is empty.");
      return;
    }
    var emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
    var phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/g;
    if (!(emailRegex.test(email) || phoneRegex.test(email))) {
      alert("ERROR: No valid email was given.");
      return;
    }
    var now = new Date();
    if (dateOB > now) {
      alert("ERROR: Date of birth is not in the past.");
      return;
    }
    if (password != formData.get("confirmPassword")) {
      alert("ERROR: Passwords do not match");
      return;
    }
    var registeringUser = {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOB,
      email: email,
      password: password,
    };
    await registerUser(registeringUser);
    
    navigate("/login");
  }

  return (
    <>
      <h2 style={{ "margin-top": "67px" }}>
        <b>
          Create account with settle
          <span style={{ color: "#8F0004" }}>CAN</span>
        </b>
      </h2>
      <div style={{ "font-size": "12.5px" }}>
        Your Journey to Canada, Simplified
      </div>
      <Form action={handleFormSubmit}>
        <div
          className="row"
          style={{
            marginTop: "67px",
            paddingLeft: "50px",
            paddingRight: "50px",
            gap: "10%",
          }}
        >
          {/* Left Column */}
          <div
            className="column"
            style={{
              textAlign: "left",
              inlineSize: "45%",
            }}
          >
            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                defaultValue="Suganya"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                defaultValue={`test${Date.now()}@gmail.com`}
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                defaultValue="OMGfml123!"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>
          </div>

          {/* Right Column */}
          <div
            className="column"
            style={{
              textAlign: "left",
              inlineSize: "45%",
            }}
          >
            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                defaultValue="Maheswaran"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDateOfBirth">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                defaultValue="1990-09-27"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPasswordConfirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                defaultValue="OMGfml123!"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>
          </div>
        </div>

        <br />
        <br />
        <br />

        <section id="center">
          <Button
            variant="danger"
            type="submit"
            style={{
              "--bs-btn-bg": "#830C10",
              display: "block",
              width: "67%",
            }}
          >
            Immigration Details
          </Button>

          <div>
            Have an account? <Link to="/login">Log in</Link>
          </div>
        </section>
      </Form>
    </>
  );
}

export default ImmigrationDetails;
