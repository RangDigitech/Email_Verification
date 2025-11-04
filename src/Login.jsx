// src/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "./Auth.css";
import { login, oauthStartUrl, getMe, RECAPTCHA_SITE_KEY } from "./api";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Password is required."); return; }
    if (!captchaToken) { setError("Please complete the captcha."); return; }

    setLoading(true);
    try {
      await login(email, password, captchaToken);
      const me = await getMe();
      if (me && typeof me.is_admin === "boolean") {
        localStorage.setItem("is_admin", me.is_admin ? "true" : "false");
      } else {
        localStorage.removeItem("is_admin");
      }
      localStorage.setItem("userEmail", email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/"><img src="/logo_login1.png" alt="Verifier Logo" className="auth-logo" /></Link>
        <h2>Welcome Back</h2>
        <p>Sign in to continue your journey with Verifier</p>

        <div className="social-login">
          <button className="social-btn" onClick={() => { window.location.href = oauthStartUrl("google"); }} title="Continue with Google"><FaGoogle /></button>
          <button className="social-btn" onClick={() => { window.location.href = oauthStartUrl("github"); }} title="Continue with GitHub"><FaGithub /></button>
        </div>

        <p className="divider">OR SIGN IN USING EMAIL</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email Address" required />
          <input name="password" type="password" placeholder="Password" required />

          {/* NEW: reCAPTCHA */}
          <div style={{ margin: "10px 0" }}>
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={setCaptchaToken} />
          </div>

          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading || !captchaToken}>
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
