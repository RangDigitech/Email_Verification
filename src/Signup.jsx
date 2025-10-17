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
  import { register } from "./api"; // UPDATED: Import the real register function from your api.js

  export default function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // NEW: Added loading state

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // UPDATED: The entire function is now async to handle the backend API call
    async function handleSubmit(e) {
      e.preventDefault();
      setError("");

      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") || "").trim();
      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();
      const password = String(form.get("password") || "");

      // --- Input Validation ---
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 3) {
        setError("Password must be at least 8 characters.");
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
            <button className="social-btn" title="Sign up with Google"><FaGoogle /></button>
            <button className="social-btn" title="Sign up with GitHub"><FaGithub /></button>
            <button className="social-btn" title="Sign up with LinkedIn"><FaLinkedinIn /></button>
            <button className="social-btn" title="Sign up with Facebook"><FaFacebookF /></button>
            <button className="social-btn" title="Sign up with Apple"><FaApple /></button>
          </div>

          <p className="divider">OR SIGN UP USING EMAIL</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <input name="firstName" type="text" placeholder="First Name" required />
              <input name="lastName" type="text" placeholder="Last Name" required />
            </div>
            <input name="email" type="email" placeholder="Email Address" required />
            <input name="password" type="password" placeholder="Password" required />
            {error && <div className="auth-error">{error}</div>}
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

