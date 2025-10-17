import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub, FaLinkedinIn, FaFacebookF, FaApple } from "react-icons/fa";
import "./Auth.css";
import { login } from "./api"; // UPDATED: Import the real login function from your api.js

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // UPDATED: Renamed to handleSubmit and made async to call the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    // --- Input Validation ---
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      // --- API Call ---
      // This calls the '/login' endpoint on your backend.
      // The login function in api.js saves the JWT token to localStorage.
      await login(email, password);

      // --- Success Handling ---
      localStorage.setItem("userEmail", email); // Store email for display on dashboard
      navigate("/dashboard");

    } catch (err) {
      // --- Error Handling ---
      // This will display errors from the backend, like "Incorrect email or password"
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/src/assets/email_logo.png" alt="Verifier Logo" className="auth-logo" />
        <h2>Welcome Back</h2>
        <p>Sign in to continue your journey with Verifier</p>

        <div className="social-login">
          <button className="social-btn" title="Sign in with Google"><FaGoogle /></button>
          <button className="social-btn" title="Sign in with GitHub"><FaGithub /></button>
          <button className="social-btn" title="Sign in with LinkedIn"><FaLinkedinIn /></button>
          <button className="social-btn" title="Sign in with Facebook"><FaFacebookF /></button>
          <button className="social-btn" title="Sign in with Apple"><FaApple /></button>
        </div>

        <p className="divider">OR SIGN IN USING EMAIL</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email Address" required />
          <input name="password" type="password" placeholder="Password" required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="switch-auth">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

