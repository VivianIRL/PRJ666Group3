// Register.jsx — Step 1: basic account info
// Passes firstName, lastName, email to ImmigrationDetails via router state
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import "../scss/Auth.scss";

function Register() {
  const navigate = useNavigate();
  const { clearAuthError } = useContext(AuthContext);

  // Clear any stale auth error from a previous login attempt
  useEffect(() => { clearAuthError(); }, []);

  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", email: "", password: "", confirm: "",
  });
  const [error, setError] = useState("");

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.email.trim())     { setError("Email is required."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setError("");
    // Pass collected data to step 2
    navigate("/immigration", { state: { firstName: form.firstName, lastName: form.lastName, email: form.email, dob: form.dob, password: form.password } });
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-brand">settle<em>CAN</em></div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Your journey to Canada, simplified.</p>

        {/* Step indicator */}
        <div className="auth-steps">
          <span className="auth-step auth-step--active">1 Account</span>
          <span className="auth-step-divider">→</span>
          <span className="auth-step">2 Immigration Details</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <div className="auth-field">
              <label>First Name <span className="req">*</span></label>
              <input type="text" placeholder="Maria" value={form.firstName} onChange={set("firstName")} />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input type="text" placeholder="Smith" value={form.lastName} onChange={set("lastName")} />
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Email address <span className="req">*</span></label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="auth-field">
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={set("dob")} />
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Password <span className="req">*</span></label>
              <input type="password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} />
            </div>
            <div className="auth-field">
              <label>Confirm Password <span className="req">*</span></label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} />
            </div>
          </div>

          <button type="submit" className="auth-btn">
            Next: Immigration Details →
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Register;
