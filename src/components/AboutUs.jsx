
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
          <h1 className="hero-title">Transforming email verification with smart AI solutions.</h1>
          <p className="hero-description">
          We’re a passionate team of developers and marketers driven by innovation and practicality. At AI Email Verifier, we believe that AI should simplify email verification, not make it harder or more expensive. Our platform uses intelligent automation to ensure accuracy, speed, and reliability without the usual complexity or high costs. We understand that verifying emails is a crucial step in every marketing and communication strategy. That’s why we built a smarter, AI-driven solution that’s efficient, affordable, and effortless to use. AI Email Verifier leverages smart automation to keep your email data clean, valid, and ready to perform.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon"><img src="/generative.png" alt="AI-Powered" /></div>
              <div className="stat-number">AI-Powered Engine</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><img src="/time-check-symbol.png" alt="Real-Time" /></div>
              <div className="stat-number">Real-Time Verification</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><img src="/secure-shield.png" alt="Bounce Protection" /></div>
              <div className="stat-number">Bounce Protection</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><img src="/payment.png" alt="Payment" /></div>
              <div className="stat-number">Smart Credit Management</div>
            </div>
          </div>
        </div>
      </section>



      {/* Global Team */}
      <section className="global-team-section">
        <div className="global-team-container">
          <h2 className="global-team-title">An AI-driven team building smarter global solutions.</h2>
          <p className="global-team-description">
          At AI Email Verifier, we create intelligent tools that simplify and enhance email verification for businesses worldwide. Our diverse team of thinkers, developers, and creators share one vision to make verification faster, more accurate, and effortless through the power of AI.
          We’re committed to innovation, collaboration, and delivering reliable solutions that help users maintain clean and verified data with confidence.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Protect your sender reputation with the accuracy and reliability of AI Email Verifier.</h2>
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
