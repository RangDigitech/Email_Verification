
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

      {/* Market Positioning */}
      <section className="market-section">
        <div className="market-container">
          <h2 className="market-title">We are setting new standards and raising the bar for the email validation market.</h2>
          <div className="market-chart">
            <div className="chart-area">
              <div className="chart-line others">Others</div>
              <div className="chart-line buzz">AI Email Verifier</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="problem-container">
          <h2 className="problem-title">$20+ billion in sales opportunities are lost each year.</h2>
          <p className="problem-description">
            According to SendGrid, about 20% of emails never end up reaching their intended recipients, 
            resulting in tens of billions of dollars in estimated revenue loss opportunities globally each year.
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-container">
          <h2 className="trust-title">Coming soon to businesses worldwide</h2>
          <div className="trust-logos">
            <div className="logo-placeholder">Partner 1</div>
            <div className="logo-placeholder">Partner 2</div>
            <div className="logo-placeholder">Partner 3</div>
            <div className="logo-placeholder">Partner 4</div>
            <div className="logo-placeholder">Partner 5</div>
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

      {/* Our Team */}
      <section className="team-section">
        <div className="team-container">
          <h2 className="team-title">Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">John Smith</div>
              <div className="member-title">Chief Executive Officer</div>
            </div>
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">Sarah Johnson</div>
              <div className="member-title">Chief Technology Officer</div>
            </div>
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">Mike Chen</div>
              <div className="member-title">VP of Engineering</div>
            </div>
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">Lisa Rodriguez</div>
              <div className="member-title">VP of Operations</div>
            </div>
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">David Kim</div>
              <div className="member-title">Head of Marketing</div>
            </div>
            <div className="team-member">
              <div className="member-avatar"></div>
              <div className="member-name">Emma Wilson</div>
              <div className="member-title">Lead Software Engineer</div>
            </div>
          </div>
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
