  import React, { useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import {
    FaGoogle,
    FaGithub,
    FaLinkedinIn,
    FaFacebookF,
    FaApple,
  } from "react-icons/fa";
  import "./Auth.css";
import { register, checkEmailDisposable } from "./api";
 // UPDATED: Import the real register function from your api.js
  import { oauthStartUrl } from "./api"; // <-- ADD THIS


  export default function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // NEW: Added loading state
    const [emailWarning, setEmailWarning] = useState("");   // disposable/temp warning
    const [lastCheckedEmail, setLastCheckedEmail] = useState("");

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    async function validateEmailDisposableInline(email) {
      setEmailWarning("");
      if (!email) return false;

      try {
        const res = await checkEmailDisposable(email);
        // If backend had trouble, don't block — just log
        if (!res?.ok) return false;

        if (res.syntax_ok === false) {
          setEmailWarning("Please enter a valid email address.");
          return true; // treat as 'has issue' to stop submit
        }
        if (res.disposable === true) {
          setEmailWarning("Disposable / temporary email addresses are not allowed.");
          return true; // issue found
        }
        // good email
        return false;
      } catch {
        // On network error, allow user to continue (backend will also enforce server-side rules)
        return false;
      }
    }

    // UPDATED: The entire function is now async to handle the backend API call
    async function handleSubmit(e) {
      e.preventDefault();
      setError("");

      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") || "").trim();
      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();
      const password = String(form.get("password") || "");
        
      const hasIssue = await validateEmailDisposableInline(email);
      if (hasIssue) {
        return; // emailWarning already shown
      }
      // --- Input Validation ---
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
            // --- Password Validation ---
      const minLength = /.{8,}/;
      const upperCase = /[A-Z]/;
      const lowerCase = /[a-z]/;
      const number = /[0-9]/;
      const special = /[@$!%*?&]/;

      if (!minLength.test(password)) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (!upperCase.test(password)) {
        setError("Password must contain at least one uppercase letter.");
        return;
      }
      if (!lowerCase.test(password)) {
        setError("Password must contain at least one lowercase letter.");
        return;
      }
      if (!number.test(password)) {
        setError("Password must contain at least one number.");
        return;
      }
      if (!special.test(password)) {
        setError("Password must contain at least one special character (@, $, !, %, *, ?, &).");
        return;
      }

      if (!firstName || !lastName) {
        setError("First and last name are required.");
        return;
      }

      setLoading(true);
      try {
        // --- API Call ---
        // This calls the '/register' endpoint on your Python backend
        // In the handleSubmit function, update the register call:
        await register({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password
        });

        // --- Success Handling ---
        alert("Registration successful! Please log in to continue.");
        navigate("/login");

      } catch (err) {
        // --- Error Handling ---
        // This will display errors from the backend, like "Email already registered"
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="signup-logo">
            <img
              src="/src/assets/email_logo.png"
              alt="Email Verifier Logo"
              className="auth-logo"
            />
          </div>

          <h2>Create Your Account</h2>
          <p>Join Verifier and get 250 free credits instantly</p>

          <div className="social-login">
            <button
              className="social-btn"
              onClick={() => { window.location.href = oauthStartUrl("google"); }}
              title="Continue with Google"
            >
              <FaGoogle />
            </button>
  
            <button
              className="social-btn"
              onClick={() => { window.location.href = oauthStartUrl("github"); }}
              title="Continue with GitHub"
            >
              <FaGithub />
            </button>
            {/* <button className="social-btn" title="Sign in with LinkedIn" disabled><FaLinkedinIn /></button>
            <button className="social-btn" title="Sign in with Facebook" disabled><FaFacebookF /></button>
            <button className="social-btn" title="Sign in with Apple" disabled><FaApple /></button> */}
          </div>

          <p className="divider">OR SIGN UP USING EMAIL</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <input name="firstName" type="text" placeholder="First Name" required />
              <input name="lastName" type="text" placeholder="Last Name" required />
            </div>
            {/* <input name="email" type="email" placeholder="Email Address" required /> */}
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              onChange={(e) => {
                setError("");
                setEmailWarning("");
              }}
              onBlur={async (e) => {
                const email = String(e.target.value || "").trim();
                if (email && email !== lastCheckedEmail) {
                  const blocked = await validateEmailDisposableInline(email);
                  setLastCheckedEmail(email);
                  // Optionally: you could auto-focus password or submit button if not blocked
                }
              }}
            />

            <input name="password" type="password" placeholder="Password" required />
            {/* {error && <div className="auth-error">{error}</div>} */}
            {(error || emailWarning) && (
              <div className="auth-error">{error || emailWarning}</div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    );
  }

