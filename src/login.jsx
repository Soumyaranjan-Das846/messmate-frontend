
import { useState } from 'react';
import { loginAdmin } from './services/api';
import './login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* Background grid */}
      <div className="login-grid" aria-hidden="true" />

      {/* Original glow layers */}
      <div
        className="login-glow login-glow-blue"
        aria-hidden="true"
      />
      <div
        className="login-glow login-glow-purple"
        aria-hidden="true"
      />

      {/* Animated neon atmosphere */}
      <div
        className="login-energy login-energy-blue"
        aria-hidden="true"
      />
      <div
        className="login-energy login-energy-purple"
        aria-hidden="true"
      />
      <div
        className="login-sparkles"
        aria-hidden="true"
      />

      {/* Crystal decoration layers */}
      <div
        className="login-crystal crystal-one"
        aria-hidden="true"
      />
      <div
        className="login-crystal crystal-two"
        aria-hidden="true"
      />
      <div
        className="login-crystal crystal-three"
        aria-hidden="true"
      />
      <div
        className="login-crystal crystal-four"
        aria-hidden="true"
      />
      <div
        className="login-crystal crystal-five"
        aria-hidden="true"
      />

      {/* Main login content */}
      <div className="login-main">

        {/* Official IIIT Bhubaneswar branding */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <img
              src="/iiit-bhubaneswar-logo.png"
              alt="IIIT Bhubaneswar Logo"
              className="iiit-login-logo"
            />
          </div>

          <div className="login-brand-copy">
            <strong>MessMate</strong>
            <small>IIIT BHUBANESWAR</small>
          </div>
        </div>

        {/* Login card */}
        <div className="login-card">
          <div className="login-card-topline" />

          <div className="login-card-header">
            <div className="login-status">
              <span className="login-status-dot" />
              YOUR CAMPUS. YOUR SPACE.
            </div>

            <h1>
              Welcome Back <span>✦</span>
            </h1>

            <p>
              Sign in to your campus dining workspace.
            </p>
          </div>

          <div className="login-divider">
            <span />
            <small>SECURE ACCESS</small>
            <span />
          </div>

          {/* Login form */}
          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">
                EMAIL ADDRESS
              </label>

              <div className="login-input-wrap">
                <span className="login-input-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@iiit-bh.ac.in"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">
                PASSWORD
              </label>

              <div className="login-input-wrap">
                <span className="login-input-icon">
                  ♧
                </span>

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="login-error"
                role="alert"
              >
                <span>!</span>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? 'SIGNING IN...'
                  : 'ENTER WORKSPACE'}
              </span>

              <span className="login-arrow">
                ↗
              </span>
            </button>
          </form>

          {/* Security note */}
          <div className="login-security-note">
            <span>◇</span>
            <p>
              Protected access for authorized
              campus members
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="login-bottom">
          
          <span>
            MADE FOR IIIT BHUBANESWAR ✦
          </span>
        </div>

      </div>
    </div>
  );
}
