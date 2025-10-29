
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ContactPage.css";
import "./Dashboard.css";

export default function ContactPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { from, requestedCredits, isLoggedIn } = location.state || {};
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: from === 'buyCredits' ? `Enterprise Pricing Request - ${requestedCredits?.toLocaleString() || 'Custom'} Credits` : "",
    message: from === 'buyCredits' ? `I'm interested in purchasing ${requestedCredits?.toLocaleString() || 'custom amount of'} credits for enterprise use. Please contact me with pricing details.` : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just reset form (UI only)
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    alert("Your message has been submitted! (UI only)");
    
    // If logged in and came from Buy Credits, redirect back to dashboard
    if (isLoggedIn && from === 'buyCredits') {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const credits = Number(localStorage.getItem("credits") || 0);
  const displayName = localStorage.getItem("name") || null;

  return (
    <div className="contact-page" style={isLoggedIn ? { background: '#f5f5f5', minHeight: '100vh' } : {}}>
      {/* Dashboard Header (only shows when logged in) */}
      {isLoggedIn && (
        <header className="dashboard-header" style={{ background: '#000', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="header-left">
            <div className="dashboard-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="60" width="140" height="100" fill="#fffdfdff" rx="8" />
                <path
                  d="M 30 60 L 100 110 L 170 60"
                  stroke="#000000ff"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="150" cy="50" r="25" fill="#5d1590ff" />
                <path
                  d="M 140 50 L 147 57 L 160 44"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="logo-text">AI Email Verifier</span>
            </div>

            <div style={{ marginLeft: '40px', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
              {from === 'buyCredits' && '/ Enterprise Pricing Request'}
            </div>
          </div>

          <div className="dashboard-actions">
            <div className="user-toggle relative">
              <div className="user-toggle-btn flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <div className="user-avatar bg-[#000000] text-white" style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: '#7c4dff', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {userInitial}
                </div>
                <div style={{ color: '#fff', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600' }}>{displayName || userEmail}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>Credits: {credits}</div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <section className="contact-section" style={isLoggedIn ? { paddingTop: '40px' } : {}}>
        <div className="container contact-container">
          {/* Left Side */}
          <div className="contact-left">
            <h2>Get in Touch</h2>
            <p>
              We're AI Email Verifier your trusted partner for accurate email
              validation. Whether you're a developer, marketer, or business
              owner, we'd love to hear from you. Have questions, feedback, or
              partnership ideas? Drop us a message!
            </p>

            {/* <div className="location-box">
              <h3>Vadodara, Gujarat</h3>
              <p>
                5th Floor, Royal House, Atlantis Ln, Vadiwadi, Vadodara,
                Gujarat 390017
              </p>
              <p className="phone">+91 99999 99999</p>
            </div> */}
          </div>

          {/* Right Side */}
          <div className="contact-right">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="send-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}