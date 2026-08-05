import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../service/authService";
import "../scss/Auth.scss";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
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
        <h2 className="auth-title">Forgot your password?</h2>
        <p className="auth-sub">Enter your email and we’ll send you a secure reset link.</p>
        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="forgot-email">Email address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="auth-footer"><Link to="/login">← Back to sign in</Link></p>
      </div>
    </div>
  );
}
