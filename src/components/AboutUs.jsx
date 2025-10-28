
import React from "react";
import { Navbar } from "../App"; // Import the Navbar from App.jsx
import { Footer } from "../App"; // ADD THIS - Import Footer
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-us">
      {/* Use the imported Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">The team behind the email verification tool you've been waiting for.</h1>
          <p className="hero-description">
            We're a team of marketers and developers creating products that we actually want to use. 
            AI Email Verifier was built because we understand that email verification is important, it shouldn't be 
            expensive and hard to manage. It should be an essential step in any email marketing strategy. 
            We wanted a more affordable, faster, and user-friendly email verification solution for ourselves, 
            so we built it for you.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">🏁</div>
              <div className="stat-number">2024</div>
              <div className="stat-label">Year established</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📧</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Emails Verified</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">0/5</div>
              <div className="stat-label">Average rating</div>
            </div>
          </div>
        </div>
      </section>



      {/* Global Team */}
      <section className="global-team-section">
        <div className="global-team-container">
          <h2 className="global-team-title">A global team creating global solutions.</h2>
          <p className="global-team-description">
            We're building platforms and products we would love to use. We are a robust and diverse team 
            formed of curious and creative professionals who work towards a common goal: make email validation 
            affordable and straightforward. Headquartered in New York with offices in Miami, Los Angeles, and 
            São Paulo, AI Email Verifier is a global team spread across Europe, South America, and Asia.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Join the companies that will rely on AI Email Verifier to protect their sender reputation.</h2>
          <a href="/signup">
            <button className="cta-button">Get Started Free</button>
          </a>
          <p className="cta-subtext">Includes 250 free credits</p>
        </div>
      </section>

      {/* ADD FOOTER HERE */}
      <Footer />

    </div>
  );
}
