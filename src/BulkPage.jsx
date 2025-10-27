// src/BulkPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./BulkPage.css";

export default function BulkPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "What is bulk email verification?",
      answer:
        "Bulk email verification is a process that checks large lists of emails for validity, ensuring you only send campaigns to active and valid addresses.",
    },
    {
      question: "How secure is my data?",
      answer:
        "All files and email data are encrypted during upload and deleted automatically after verification for your privacy and safety.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Verification speed depends on your list size. Our AI-based engine can process thousands of emails per second.",
    },
    {
      question: "Can I integrate this with my CRM or ESP?",
      answer:
        "Yes, we offer seamless integrations with major CRMs, ESPs, and marketing platforms through our API or Zapier.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes, you can start verifying emails for free with our ‘Get Started Free’ plan. No credit card required.",
    },
  ];

  return (
    <div className="bulk-page">
      {/* ================= HERO ================= */}
      <section className="bulk-hero">
        <div className="container">
          <h1>Verify email lists with the most accurate AI checker</h1>
          <p>
            Clean, validate, and analyze your entire email list instantly.
            Reduce bounces, protect your sender reputation, and improve campaign
            performance.
          </p>
          <Link to="/signup">
            <button className="white-btn">Get Started Free</button>
          </Link>
        </div>
      </section>

      {/* ================= STEP SECTION ================= */}
      <section className="bulk-steps">
        <div className="container">
          <h2>Import • Verify • Analyze • Export</h2>
          <p>
            Upload your email lists, let our AI verification engine clean and
            validate every address, and download your verified list instantly.
          </p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📥</div>
              <h3>Import</h3>
              <p>Upload your CSV or connect directly from your CRM or ESP.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">⚙</div>
              <h3>Verify</h3>
              <p>AI-driven checks validate syntax, domain, MX, and SMTP status.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📊</div>
              <h3>Analyze</h3>
              <p>
                Review in-depth reports showing valid, risky, and invalid emails.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">📤</div>
              <h3>Export</h3>
              <p>
                Download your clean list or export results directly to your
                integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ANALYTICS SECTION ================= */}
      <section className="bulk-analytics">
        <div className="container">
          <h2>View your results in real time</h2>
          <p>
            Get detailed breakdowns of your email quality — valid, invalid,
            risky, and unknown — to help you make smarter marketing decisions.
          </p>
          <div className="chart-placeholder">
            <div className="chart">📈</div>
            <p className="chart-text">
              Real-time analytics that visualize list health instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ================= BENEFITS SECTION ================= */}
      <section className="bulk-benefits">
        <div className="container">
          <h2>9 strategic benefits of bulk email verification</h2>
          <div className="benefits-grid">
            {[
              ["⚡", "Faster Campaigns"],
              ["📈", "Higher Deliverability"],
              ["🧠", "AI-Powered Accuracy"],
              ["🔒", "Data Protection"],
              ["📊", "Real-time Reports"],
              ["🤝", "CRM Integrations"],
              ["💸", "Save on Email Costs"],
              ["📬", "Reduce Bounces"],
              ["🏆", "Improve Sender Score"],
            ].map(([icon, title], i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">{icon}</div>
                <h3>{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MARKETING SECTION ================= */}
      <section className="bulk-marketing">
        <div className="container">
          <h2>An essential component of digital marketing</h2>
          <p>
            Every successful email campaign starts with a clean list. Our AI
            verification ensures your messages reach real inboxes — improving
            engagement and ROI across your marketing channels.
          </p>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="bulk-faq">
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

      {/* ================= FINAL CTA ================= */}
      <section className="bulk-final-cta">
        <div className="container">
          <h2>Join thousands of companies using AI Email Verifier</h2>
          <Link to="/signup">
            <button className="white-btn">Get Started Free</button>
          </Link>
        </div>
      </section>
    </div>
  );
}