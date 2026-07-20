import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../state/AuthContext';
import '../scss/Auth.scss';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    console.log(result.success);
    if (result) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="auth-page" data-testid="login">
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
              data-testid="login-email-address-input"
            />
          </div>

          <div className="auth-field password-field">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                data-testid="login-password-input"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="auth-forgot"><a href="/forgot-password">Forgot password?</a></div>

          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" data-testid="login-sign-up-btn">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
