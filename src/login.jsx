
import { useState } from 'react';
import { loginAdmin, registerUser } from './services/api';
import './login.css';

const emptyForm = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  rollNumber: '',
  department: '',
  hostel: '',
  roomNumber: '',
  address: '',
  adminCode: '',
};

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSignup = mode === 'signup';

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateForm(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.role === 'admin' && !form.adminCode.trim()) {
      setError('Admin registration code is required.');
      return;
    }

    setLoading(true);

    try {
      await registerUser(form);

      setEmail(form.email.trim().toLowerCase());
      setPassword('');
      setForm({ ...emptyForm });
      setMode('signin');

      setSuccess('Account created successfully! Please sign in.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  function signupField(name, label, placeholder, options = {}) {
    const {
      type = 'text',
      required = false,
      autoComplete,
    } = options;

    return (
      <div className="login-field" key={name}>
        <label htmlFor={`signup-${name}`}>
          {label}
        </label>

        <div className="login-input-wrap">
          <input
            id={`signup-${name}`}
            name={name}
            type={type}
            value={form[name]}
            onChange={updateForm}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`login-page ${isSignup ? 'signup-page' : ''}`}>
      <div className="login-main">

        {/* Branding */}
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

        {/* Main Card */}
        <div className="login-card">
          <div className="login-card-topline" />

          <div className="login-card-header">
            <div className="login-status">
              <span className="login-status-dot" />
              YOUR CAMPUS. YOUR SPACE.
            </div>

            <h1>
              {isSignup ? 'Join MessMate' : 'Welcome Back'}
              {' '}
              <span>✦</span>
            </h1>

            <p>
              {isSignup
                ? 'Create your campus dining account.'
                : 'Sign in to your campus dining workspace.'}
            </p>
          </div>

          <div className="login-divider">
            <span />
            <small>
              {isSignup ? 'CREATE ACCOUNT' : 'SECURE ACCESS'}
            </small>
            <span />
          </div>

          {/* Login Form */}
          {!isSignup && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="login-email">
                  EMAIL ADDRESS
                </label>

                <div className="login-input-wrap">
                  <span className="login-input-icon">✉</span>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@iiit-bh.ac.in"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  PASSWORD
                </label>

                <div className="login-input-wrap">
                  <span className="login-input-icon">♧</span>

                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-show-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="login-success" role="status">
                  {success}
                </div>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading ? 'SIGNING IN...' : 'ENTER WORKSPACE'}
                </span>
                <span className="login-arrow">↗</span>
              </button>
            </form>
          )}

          {/* Compact Registration Form */}
          {isSignup && (
            <form className="login-form signup-form" onSubmit={handleSignup}>
              <div className="login-field">
                <label htmlFor="signup-role">
                  REGISTER AS
                </label>

                <div className="login-input-wrap">
                  <select
                    id="signup-role"
                    name="role"
                    value={form.role}
                    onChange={updateForm}
                    required
                  >
                    <option value="user">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="signup-fields-grid">
                {signupField(
                  'username',
                  'FULL NAME',
                  'Enter full name',
                  { required: true, autoComplete: 'name' }
                )}

                {signupField(
                  'email',
                  'EMAIL ADDRESS',
                  'you@iiit-bh.ac.in',
                  {
                    type: 'email',
                    required: true,
                    autoComplete: 'email',
                  }
                )}

                {signupField(
                  'phone',
                  'CONTACT NUMBER',
                  'Enter phone number',
                  {
                    type: 'tel',
                    required: true,
                    autoComplete: 'tel',
                  }
                )}

                {signupField(
                  'password',
                  'CREATE PASSWORD',
                  'Minimum 8 characters',
                  {
                    type: 'password',
                    required: true,
                    autoComplete: 'new-password',
                  }
                )}

                {signupField(
                  'confirmPassword',
                  'CONFIRM PASSWORD',
                  'Re-enter password',
                  {
                    type: 'password',
                    required: true,
                    autoComplete: 'new-password',
                  }
                )}

                {form.role === 'user' && (
                  <>
                    {signupField(
                      'rollNumber',
                      'ROLL NUMBER',
                      'Enter roll number',
                      { required: true }
                    )}

                    {signupField(
                      'department',
                      'DEPARTMENT',
                      'IT / CSE / ECE / EEE',
                      { required: true }
                    )}

                    {signupField(
                      'hostel',
                      'HOSTEL',
                      'Enter hostel name',
                      { required: true }
                    )}

                    {signupField(
                      'roomNumber',
                      'ROOM NUMBER',
                      'Enter room number',
                      { required: true }
                    )}
                  </>
                )}

                {form.role === 'admin' && (
                  <>
                    {signupField(
                      'address',
                      'OFFICE / ADDRESS',
                      'Enter office or address'
                    )}

                    {signupField(
                      'adminCode',
                      'ADMIN REGISTRATION CODE',
                      'Enter authorized code',
                      {
                        type: 'password',
                        required: true,
                      }
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </span>
                <span className="login-arrow">↗</span>
              </button>
            </form>
          )}

          {/* Sign Up / Sign In Link */}
          <div className="login-switch-mode">
            {isSignup ? (
              <>
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  disabled={loading}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <span>Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Security Note */}
          <div className="login-security-note">
            <span>◇</span>
            <p>
              Protected access for authorized campus members
            </p>
          </div>
        </div>

        <div className="login-bottom">
          <span>MADE FOR IIIT BHUBANESWAR ✦</span>
        </div>
      </div>
    </div>
  );
}
