// src/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
import "./Auth.css";
// import { login, oauthStartUrl, getMe, RECAPTCHA_SITE_KEY } from "./api";
import { login, oauthStartUrl, getMe, RECAPTCHA_SITE_KEY, apiUrl, refreshCredits } from "./api";
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

    // setLoading(true);
    // try {
    //   await login(email, password, captchaToken);
    //   const me = await getMe();
    //   if (me && typeof me.is_admin === "boolean") {
    //     localStorage.setItem("is_admin", me.is_admin ? "true" : "false");
    //   } else {
    //     localStorage.removeItem("is_admin");
    //   }
    //   localStorage.setItem("userEmail", email);
    //   navigate("/dashboard");
    // } catch (err) {
    //   setError(err.message || "Login failed");
    // } finally {
    //   setLoading(false);
    // }
    setLoading(true);
    try {
      // Call login and capture token if provided
      const loginResp = await login(email, password, captchaToken);
      console.log("[Login] loginResp:", loginResp);

      // Try to extract token from common shapes returned by various backends
      const token =
        (loginResp && (loginResp.access_token || loginResp.token)) ||
        (loginResp && loginResp.data && (loginResp.data.access_token || loginResp.data.token));

      console.log("[Login] extracted token:", token && token.slice ? token.slice(0, 40) + "..." : token);

      // If we found a token, persist it and set global headers for axios if present
      if (token) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("access_token", token);
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
        console.log("[Login] saved auth_token to localStorage");

        try {
          if (typeof window !== "undefined" && window.axios) {
            window.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            console.log("[Login] set axios default Authorization");
          }
        } catch (e) { console.warn("[Login] axios set failed", e); }
        // window.__auth_token = token;
      } else {
        console.warn("[Login] no token found in login response");
      }

      // Try your normal getMe() helper first (it may already read localStorage or axios defaults)
      let me;
      try {
        me = await getMe();
        console.log("[Login] getMe() returned:", me);
        if (!me) throw new Error("empty getMe response");
      } catch (e) {
        console.warn("[Login] getMe failed, attempting fetch fallback:", e && e.message);
        // Fallback: call /me/credits directly with Authorization header using token (if we have it)
        if (token) {
          const resp = await fetch(apiUrl("/me/credits"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            },
            credentials: "include"
          });
          console.log("[Login] fallback /me/credits status:", resp.status);
          if (resp.ok) {
            me = await resp.json();
            console.log("[Login] fallback /me json:", me);
          } else {
            throw new Error("fallback /me failed with status " + resp.status);
          }
        } else {
          throw e;
        }
      }

      // proceed with the old logic using the resolved `me`
      if (me && typeof me.is_admin === "boolean") {
        localStorage.setItem("is_admin", me.is_admin ? "true" : "false");
        console.log("[Login] is_admin saved:", me.is_admin);
      } else {
        localStorage.removeItem("is_admin");
        console.log("[Login] is_admin removed or unavailable");
      }
      localStorage.setItem("userEmail", email);
      try {
        // update credits immediately so dashboard shows correct balance
        if (typeof refreshCredits === "function") await refreshCredits();
      } catch (e) {
        console.warn("refreshCredits failed after login", e);
      }
      console.log("[Login] userEmail saved, navigating to /dashboard");
      // navigate("/dashboard");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("[Login] error:", err);
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
