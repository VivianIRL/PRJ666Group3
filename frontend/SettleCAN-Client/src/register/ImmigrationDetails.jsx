// ImmigrationDetails.jsx — Step 2: immigration profile
// Reads firstName/lastName/email from router state (passed by Register.jsx)
// Calls register() on AuthContext then navigates to /dashboard
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../state/AuthContext";
import "../scss/Auth.scss";

const PROVINCES = [
  "Ontario","Quebec","Nova Scotia","New Brunswick","Manitoba",
  "British Columbia","Prince Edward Island","Saskatchewan",
  "Alberta","Newfoundland and Labrador",
];

const STATUSES = [
  "International Student",
  "Work Permit Holder",
  "Permanent Resident",
  "Refugee / Protected Person",
  "Visitor",
  "Canadian Citizen",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bangladesh","Belgium","Bolivia","Brazil","Bulgaria","Cambodia",
  "Cameroon","Canada","Chile","China","Colombia","Croatia","Cuba","Cyprus",
  "Czechia","Denmark","Ecuador","Egypt","Ethiopia","Finland","France","Georgia",
  "Germany","Ghana","Greece","Guatemala","Hungary","Iceland","India","Indonesia",
  "Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Lebanon","Libya","Malaysia","Mexico","Morocco",
  "Myanmar (Burma)","Nepal","Netherlands","New Zealand","Nigeria","Norway",
  "Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia",
  "Saudi Arabia","Senegal","Serbia","Singapore","South Africa","South Korea",
  "Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Tanzania",
  "Thailand","Turkey","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Venezuela","Vietnam","Zambia","Zimbabwe",
];

const LANG_TESTS = ["None","IELTS","CELPIP","TEF Canada","TCF Canada","TOEFL"];

function ImmigrationDetails() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { register, loading, authError, clearAuthError } = useContext(AuthContext);

  // Clear any stale auth error from a previous login attempt
  useEffect(() => { clearAuthError(); }, []);

  // Data passed from step 1
  const step1 = location.state ?? {};

  const [form, setForm] = useState({
    immigrationStatus: "International Student",
    province: "Ontario",
    country: "India",
    permitExpiry: "",
    arrivalDate: "",
    languageTest: "IELTS",
    rememberMe: false,
    agreeTerms: false,
  });
  const [error, setError] = useState("");

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.agreeTerms) { setError("Please agree to the terms and conditions."); return; }
    if (!step1.firstName)  { setError("Missing account info — please go back to step 1."); return; }
    setError("");

    const ok = await register({
      firstName:         step1.firstName,
      lastName:          step1.lastName   ?? "",
      email:             step1.email      ?? "",
      password:          step1.password   ?? "",
      dob:               step1.dob        ?? "",
      immigrationStatus: form.immigrationStatus,
      province:          form.province,
      country:           form.country,
      permitExpiry:      form.permitExpiry,
      arrivalDate:       form.arrivalDate,
      languageTest:      form.languageTest,
    });

    if (ok) navigate("/getting-started");
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-brand">settle<em>CAN</em></div>

        <h2 className="auth-title">Immigration Details</h2>
        <p className="auth-sub">
          {step1.firstName ? `Welcome, ${step1.firstName}! ` : ""}
          Help us personalise your settlement journey.
        </p>

        {/* Step indicator */}
        <div className="auth-steps">
          <span className="auth-step auth-step--done">✓ Account</span>
          <span className="auth-step-divider">→</span>
          <span className="auth-step auth-step--active">2 Immigration Details</span>
        </div>

        {(error || authError) && <div className="auth-error">{error || authError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <div className="auth-field">
              <label>Canadian Immigration Status</label>
              <select value={form.immigrationStatus} onChange={set("immigrationStatus")}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="auth-field">
              <label>Intended Province</label>
              <select value={form.province} onChange={set("province")}>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Country of Origin</label>
              <select value={form.country} onChange={set("country")}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="auth-field">
              <label>Language Test Taken</label>
              <select value={form.languageTest} onChange={set("languageTest")}>
                {LANG_TESTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Permit Expiry Date</label>
              <input type="date" value={form.permitExpiry} onChange={set("permitExpiry")} />
            </div>
            <div className="auth-field">
              <label>Expected / Actual Arrival in Canada</label>
              <input type="date" value={form.arrivalDate} onChange={set("arrivalDate")} />
            </div>
          </div>

          <div className="auth-checks">
            <label className="auth-check">
              <input type="checkbox" checked={form.rememberMe} onChange={set("rememberMe")} />
              Remember me
            </label>
            <label className="auth-check">
              <input type="checkbox" checked={form.agreeTerms} onChange={set("agreeTerms")} />
              I agree to the <Link to="/about">terms and conditions</Link>
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create my account"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/register">← Back to step 1</Link>
        </p>
      </div>
    </div>
  );
}

export default ImmigrationDetails;
