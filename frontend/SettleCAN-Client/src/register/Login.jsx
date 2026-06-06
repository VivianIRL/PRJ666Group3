import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../state/AuthContext';
import '../scss/Auth.scss';

function Login() {
  const { login, loading } = useContext(AuthContext);
  const navigate           = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    const ok = await login(email, password);
    if (!ok) { setError('Invalid email or password. Please try again.'); return; }
    navigate('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">settle<em>CAN</em></div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Get back to your settlement task list.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-forgot"><Link to="/">Forgot password?</Link></div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
