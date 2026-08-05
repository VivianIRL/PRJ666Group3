import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../state/AuthContext";
import SmartDateInput from "../components/SmartDateInput";
import "../scss/Auth.scss";

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
  "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
  "Quebec", "Saskatchewan", "Yukon",
];

// The 5 canonical statuses the rest of the app (task generation, guide
// content) actually recognizes — see backend/src/services/templateService.js.
// Picking anything else here would leave a user with no My Tasks content.
const STATUSES = [
  "International Student",
  "Work Permit Holder",
  "Permanent Resident",
  "Refugee / Protected Person",
  "Visitor / Tourist",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  immigrationStatus: STATUSES[0],
  province: PROVINCES[0],
  arrivalDate: "",
};

function Profile() {
  const { user, updateProfile, loading, authError, clearAuthError } = useContext(AuthContext);
  const [form, setForm] = useState(emptyForm);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // `user` from AuthContext is already the single source of truth — it's
  // set directly from updateProfile()'s response, no re-fetch needed. This
  // used to also call GET /api/profile/:user_id, which reads a *different*
  // backend store (the `profiles` table) than PATCH /api/profile writes to
  // (Supabase Auth user_metadata) — that second, unsynced fetch was what
  // made the form (and, by extension, anything relying on this page)
  // revert to stale values right after a successful save.
  useEffect(() => {
    if (!user) return;
    setError("");
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      immigrationStatus: user.immigrationStatus || STATUSES[0],
      province: user.province || PROVINCES[0],
      arrivalDate: user.arrivalDate ?? "",
    });
    setLoadingProfile(false);
  }, [user]);

  function set(field) {
    return event => setForm(current => ({ ...current, [field]: event.target.value }));
  }

  function setArrivalDate(value) {
    setForm(current => ({ ...current, arrivalDate: value }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    clearAuthError();
    const success = await updateProfile(form);
    if (success) setMessage("Profile updated successfully.");
  }

  return (
    <div className="auth-page" data-testid="profile-settings">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">settle<em>CAN</em></div>
        <h2 className="auth-title">Profile Settings</h2>
        <p className="auth-sub">Keep your personal and settlement information up to date.</p>

        {(message || error || authError) && (
          <div className={message ? "auth-success" : "auth-error"} role="status">
            {message || error || authError}
          </div>
        )}

        <form onSubmit={handleUpdate} className="auth-form">
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="profile-first-name">First Name</label>
              <input id="profile-first-name" type="text" value={form.firstName} onChange={set("firstName")} maxLength={100} required />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-last-name">Last Name</label>
              <input id="profile-last-name" type="text" value={form.lastName} onChange={set("lastName")} maxLength={100} required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" type="email" value={form.email} readOnly aria-readonly="true" />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="profile-immigration-status">Immigration Status</label>
              <select id="profile-immigration-status" value={form.immigrationStatus} onChange={set("immigrationStatus")}>
                {STATUSES.map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="auth-field">
              <label htmlFor="profile-province">Province or Territory</label>
              <select id="profile-province" value={form.province} onChange={set("province")}>
                {PROVINCES.map(province => <option key={province}>{province}</option>)}
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label>Arrival Date</label>
            <SmartDateInput value={form.arrivalDate} onChange={setArrivalDate} id="profile-arrival-date" />
          </div>

          <button type="submit" className="auth-btn" disabled={loading || loadingProfile} data-testid="profile-save-btn">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
