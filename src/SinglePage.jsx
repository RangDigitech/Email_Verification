
// src/SinglePage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SinglePage.css";

export default function SinglePage() {
  const [email, setEmail] = useState("");

  const faqs = [
    {
      question: "What is the Email Verifier?",
      answer:
        "The Email Verifier checks whether an email address is valid and active before you send a message to it.",
    },
    {
      question: "How does the email verification process work?",
      answer:
        "Our system performs multiple real-time checks including syntax, domain, MX records, and SMTP response.",
    },
    {
      question: "Is the Email Verifier free?",
      answer:
        "Yes, you can verify a limited number of emails for free. For larger needs, we offer affordable paid plans.",
    },
    {
      question: "Does the Email Verifier send emails?",
      answer:
        "No, it only simulates a connection with the recipient's mail server — no emails are actually sent.",
    },
  ];

  const [activeFAQ, setActiveFAQ] = useState(null);
  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="single-page">
      {/* HERO */}
      <section className="single-hero">
        <div className="container">
          <h1>Verify an email address with the most accurate AI checker</h1>
          <p>
            Enter an email address to check its validity. Ensure your messages
            reach real inboxes and protect your sender reputation.
          </p>

          <div className="email-check-box">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button>Verify</button> 
            <span>
            </span>

          </div>

          <p className="trusted-text">
            Trusted by 200,000+ businesses across 185+ countries
          </p>
        </div>
      </section>

      {/* GUARANTEE SECTION */}
      <section className="single-guarantee">
        <div className="container">
          <h2>Guarantee deliverability with the AI Email Verifier</h2>
          <p>
            The fastest and most accurate verification engine in the industry.
            Using AI and real-time checks, we help marketers, developers, and
            enterprises improve deliverability and reduce bounce rates.
          </p>

        </div>
      </section>

      {/* OTHER WAYS TO VERIFY */}
      <section className="single-otherways">
        <div className="container">
          <h2>Other ways to verify</h2>
          <p>
            Explore different ways to use AI Email Verifier for your business
            and enhance your deliverability.
          </p>
          <div className="otherways-grid">
            <div className="other-card">
              <div className="icon">📦</div>
              <h3>Bulk Email Verifier</h3>
              <p>
                Verify large lists of emails with ease. Upload, clean, and
                download your results instantly.
              </p>
              <Link to="/bulk" className="learn-more">
                Explore Bulk Verifier →
              </Link>
            </div>

            <div className="other-card">
              <div className="icon">⚙</div>
              <h3>Email Verification API</h3>
              <p>
                Integrate real-time verification into your platform with our
                developer-friendly API.
              </p>
              <span className="learn-more">Coming Soon</span>
            </div>

            <div className="other-card">
              <div className="icon">💡</div>
              <h3>Email Verification Widget</h3>
              <p>
                Add a widget to your site and validate emails right at the point
                of signup.
              </p>
              <span className="learn-more">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="single-faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${
                  activeFAQ === index ? "active" : ""
                }`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span>{activeFAQ === index ? "−" : "+"}</span>
                </div>
                {activeFAQ === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      {/* <section className="single-testimonial">
        <div className="container">
          <blockquote>
            “Being a smaller company, every email send is crucial to us. This
            verifier helped ensure every email reached valid addresses. Our
            campaigns now perform 40% better.”
          </blockquote>
          <p className="author">— R. Rajendra, Marketing Director</p>
        </div>
      </section> */}

      {/* FINAL CTA */}
      <section className="single-final">
        <div className="container">
          <h2>Join companies that trust AI Email Verifier</h2>
          <Link to="/signup">
            <button className="white-btn">Get Started Free</button>
          </Link>
        </div>
      </section>
    </div>
  );
}