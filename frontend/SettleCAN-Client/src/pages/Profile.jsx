import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../state/AuthContext";
import SmartDateInput from "../components/SmartDateInput";
import { getProfile } from "../service/authService";
import { getAccessToken } from "../service/tokenService";
import "../scss/Auth.scss";

// Reusing constants from ImmigrationDetails
const PROVINCES = ["Ontario","Quebec","Nova Scotia","New Brunswick","Manitoba","British Columbia","Prince Edward Island","Saskatchewan","Alberta","Newfoundland and Labrador"];
const STATUSES = ["International Student","Work Permit Holder","Permanent Resident","Refugee / Protected Person","Visitor / Tourist"];
const COUNTRIES = ["Afghanistan","Albania","Algeria","India","Canada", /* ... rest of your countries list */];
const LANG_TESTS = ["None","IELTS","CELPIP","TEF Canada","TCF Canada","TOEFL"];

function Profile() {
  const { user, updateProfile, loading, authError } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    immigrationStatus: "",
    province: "",
    country: "",
    permitExpiry: "",
    arrivalDate: "",
    languageTest: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const populateForm = profile => setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      immigrationStatus: profile.immigrationStatus || STATUSES[0],
      province: profile.province || PROVINCES[0],
      country: profile.country || COUNTRIES[0],
      permitExpiry: profile.permitExpiry || "",
      arrivalDate: profile.arrivalDate || "",
      languageTest: profile.languageTest || LANG_TESTS[0],
    });

    populateForm(user);

    let active = true;
    getProfile(getAccessToken())
      .then(profile => {
        if (active) populateForm(profile);
      })
      .catch(() => {});

    return () => { active = false; };
  }, [user]);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }
  function setDate(field) { return val => setForm(f => ({ ...f, [field]: val })); }

  async function handleUpdate(e) {
    e.preventDefault();
    const success = await updateProfile(form);
    setMessage(success ? "Profile updated successfully!" : "Could not update profile.");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <h2 className="auth-title">My Profile</h2>
        {message && <div className="auth-success">{message}</div>}
        {authError && <div className="auth-error">{authError}</div>}

        <form onSubmit={handleUpdate} className="auth-form">
          <div className="auth-row">
            <div className="auth-field">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={set("firstName")} />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input type="text" value={form.lastName} onChange={set("lastName")} />
            </div>
          </div>

          {/* Reusing the logic structure from ImmigrationDetails */}
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
                {COUNTRIES.map(country => <option key={country}>{country}</option>)}
              </select>
            </div>
            <div className="auth-field">
              <label>Language Test</label>
              <select value={form.languageTest} onChange={set("languageTest")}>
                {LANG_TESTS.map(test => <option key={test}>{test}</option>)}
              </select>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label>Permit / Stay Expiry Date</label>
              <SmartDateInput value={form.permitExpiry} onChange={setDate("permitExpiry")} />
            </div>
            <div className="auth-field">
              <label>Arrival Date</label>
              <SmartDateInput value={form.arrivalDate} onChange={setDate("arrivalDate")} />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
