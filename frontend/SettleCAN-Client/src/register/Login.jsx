import "bootstrap/dist/css/bootstrap.min.css";
import { useContext } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { loginUser } from "../service/authService";
import { setAccessToken } from "../service/tokenService";
function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    var email = formData.get("email");
    if (!email) {
      alert("ERROR: Email is empty.");
      return;
    }
    var password = formData.get("password");
    if (!password) {
      alert("ERROR: Password is empty.");
      return;
    }

    console.log(`Submitted form email: ${email}`);
    console.log(`Submitted form password: ${password}`);

    /*
            TODO:
            Connect to backend Supabase database
            Query for the email and password
            On the first match, return that user
            Convert that user as JSON, put it in setUser

            JSON Example:
            {"firstName":"Ron","lastName":"Agady","dateOfBirth":"2003-05-20T00:00:00.000Z","email":"ronagady@gmail.com","password":"12345","immigrationStatus":"establishedimmigrant","toProvince":"ontario","permitExpiry":"2036-09-05T00:00:00.000Z","countryOfOrigin":"australia","expectedArrival":"2026-09-05T00:00:00.000Z","languageTestsTaken":"3"}
        */

    try {
      const result = await loginUser(email, password);

      setAccessToken(result.accessToken);
      setUser(result.user);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={{ "text-align": "center" }}>
      <div
        style={{
          display: "inline-block",
          "text-align": "left",
          "margin-top": "120px",
          "inline-size": "40%",
        }}
      >
        <h2>
          <b>Welcome back</b>
        </h2>
        <div style={{ "font-size": "12.5px" }}>
          Get back to your task list!
          <br />
          <br />
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>
                <b>Email address</b>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Example@email.com"
                style={{ background: "#F8FBFF" }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>
                <b>Password</b>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="At least 8 characters"
                style={{ background: "#F8FBFF" }}
              />
              <Form.Text style={{ "text-align": "right" }}>
                <Link to="/">Forgot password?</Link>
              </Form.Text>
            </Form.Group>
            <Button
              variant="danger"
              type="submit"
              style={{
                "--bs-btn-bg": "#830C10",
                display: "block",
                width: "100%",
              }}
            >
              Log in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
