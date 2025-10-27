
import React, { useState } from "react";
import "./ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
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
  };

  return (
    <div className="contact-page">
      <section className="contact-section">
        <div className="container contact-container">
          {/* Left Side */}
          <div className="contact-left">
            <h2>Get in Touch</h2>
            <p>
              We're AI Email Verifier — your trusted partner for accurate email
              validation. Whether you're a developer, marketer, or business
              owner, we’d love to hear from you. Have questions, feedback, or
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