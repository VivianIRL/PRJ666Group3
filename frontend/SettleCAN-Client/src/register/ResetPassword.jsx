import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../service/authService";
import "../scss/Auth.scss";

function recoveryToken() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("access_token") || new URLSearchParams(window.location.search).get("access_token") || "";
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const token = useMemo(() => recoveryToken(), []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { state: { message: "Password reset successfully. You can now sign in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">settle<em>CAN</em></div>
        <h2 className="auth-title">Set a new password</h2>
        <p className="auth-sub">Choose a new password for your account.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading || !token}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
        <p className="auth-footer"><Link to="/login">← Back to sign in</Link></p>
      </div>
    </div>
  );
}
