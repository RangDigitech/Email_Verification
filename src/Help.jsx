import React, { useState } from "react";
import "./Help.css";
 
const faqs = [
  {
    category: "1. Getting Started",
    questions: [
      {
        q: "What is your email verification service and who is it for?",
        a: "AI Email Verifier is designed for businesses, marketers, and developers who want to clean, verify, and maintain accurate email lists for better deliverability."
      },
      {
        q: "How does the verification process work?",
        a: "Our system checks each email using multiple validation layers — syntax, domain, MX, and SMTP verification — to ensure it's valid and deliverable."
      },
      {
        q: "Do I need to create an account to use the service?",
        a: "You can test single emails without an account, but bulk verification and saved results require signing up for a free account."
      },
      {
        q: "Can I try it for free?",
        a: "Yes. New users receive 250 free credits to test the platform before purchasing."
      }
    ]
  },
  {
    category: "2. Uploading & Verifying Emails",
    questions: [
      {
        q: "How do I upload an email list for verification?",
        a: "You can upload your email list in the dashboard. Just drag and drop a CSV, TXT, or XLSX file to begin verification."
      },
      {
        q: "Which file formats are supported?",
        a: "We currently support CSV, TXT, and XLSX formats for bulk uploads."
      },
      {
        q: "Can I verify a single email manually?",
        a: "Yes. Use the verification box on our homepage for quick one-by-one checks."
      },
      {
        q: "How long does the process take?",
        a: "Processing speed depends on list size, but our servers verify up to 30,000+ emails per minute."
      }
    ]
  },
  {
    category: "3. Results Explained",
    questions: [
      {
        q: "What do the verification results mean?",
        a: "Each email is categorized as Valid, Invalid, Risky, Catch-all, or Unknown based on SMTP responses and domain behavior."
      },
      {
        q: "What is a catch-all domain?",
        a: "A catch-all domain accepts all incoming emails, making it difficult to confirm if specific addresses are valid. We mark these as Risky."
      },
      {
        q: "What's the difference between disposable and role-based emails?",
        a: "Disposable emails are temporary addresses (like from TempMail). Role-based emails (like info@ or sales@) belong to teams rather than individuals."
      },
      {
        q: "Can I download my results?",
        a: "Yes. You can download verified results in CSV or XLSX format once processing is complete."
      }
    ]
  },
  {
    category: "4. Pricing, Credits & Billing",
    questions: [
      {
        q: "How is pricing structured?",
        a: "Our plans are based on credits. Each email verification uses one credit. You can choose between pay-as-you-go or monthly subscriptions."
      },
      {
        q: "Do credits expire?",
        a: "No. Your purchased credits never expire and can be used anytime."
      },
      {
        q: "Is there a free plan?",
        a: "Yes. All new users start with 250 free credits."
      },
      {
        q: "What happens if a verification fails?",
        a: "If the verification process fails due to a temporary server issue, credits are automatically refunded for that email."
      }
    ]
  },
  {
    category: "5. API & Integration",
    questions: [
      {
        q: "Do you offer an API for real-time verification?",
        a: "Yes. Our REST API allows developers to integrate real-time verification into their websites, signup forms, and CRMs."
      },
      {
        q: "How do I integrate the API?",
        a: "You can generate API keys from your dashboard and connect via simple HTTP requests. Full documentation is available on our Developer page."
      },
      {
        q: "What programming languages are supported?",
        a: "The API is language-agnostic and works with any platform that supports HTTPS requests (Node.js, Python, PHP, etc.)."
      },
      {
        q: "Are there rate limits?",
        a: "We have soft limits to ensure fair usage. Enterprise customers can request higher API throughput."
      }
    ]
  },
  {
    category: "6. Data Privacy, Security & Compliance",
    questions: [
      {
        q: "How do you protect my data?",
        a: "All data is encrypted in transit (SSL) and at rest. We never share or sell your data to any third party."
      },
      {
        q: "Do you keep my uploaded lists?",
        a: "No. Uploaded lists are automatically deleted from our servers after 24 hours."
      },
      {
        q: "Are you GDPR/CCPA compliant?",
        a: "Yes. We comply fully with GDPR and CCPA regulations to ensure your data privacy."
      },
      {
        q: "What happens if someone uploads emails without consent?",
        a: "We advise users to verify only contacts who have given consent. Violations may lead to account suspension."
      }
    ]
  },
  {
    category: "7. Best Practices & Troubleshooting",
    questions: [
      {
        q: "What should I do before uploading a list?",
        a: "Remove duplicates and ensure your list is formatted correctly. Clean data leads to faster and more accurate results."
      },
      {
        q: "Why are some emails marked as 'unknown'?",
        a: "Some mail servers temporarily block verification (greylisting). Retrying later often resolves these cases."
      },
      {
        q: "Why am I seeing many catch-all results?",
        a: "Catch-all domains accept all emails; this is normal for corporate or secure domains. Treat them as Risky."
      },
      {
        q: "How can I improve deliverability?",
        a: "Use verified emails only, authenticate your domain with SPF/DKIM/DMARC, and avoid spammy content."
      }
    ]
  },
  {
    category: "8. Account & Support",
    questions: [
      {
        q: "How do I manage my account or subscription?",
        a: "You can upgrade, downgrade, or cancel anytime from your dashboard settings."
      },
      {
        q: "How do I reset my password?",
        a: "Go to the Login page, click 'Forgot Password', and follow the reset instructions."
      },
      {
        q: "What types of support do you offer?",
        a: "We provide 24/7 support via email and live chat. Phone support is available for enterprise clients."
      },
      {
        q: "Where can I find documentation?",
        a: "Our API documentation and user tutorials are available on the Developer page."
      }
    ]
  }
];
 
export default function Help() {
  const [open, setOpen] = useState(null);
  const toggle = (index) => setOpen(open === index ? null : index);
 
  return (
    <div className="help-container">
      <div className="help-header">
        <h1>Frequently Asked Questions</h1>
      </div>
 
      <div className="faq-list">
        {faqs.map((section, i) => (
          <div key={i} className="faq-section">
            <h2 className="category-title">{section.category}</h2>
            {section.questions.map((item, j) => {
              const idx = `${i}-${j}`;
              const isOpen = open === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? "open" : ""}`}>
                  <div className="faq-question" onClick={() => toggle(idx)}>
                    <span className="faq-text">{item.q}</span>
                    <button className="faq-toggle-btn">
                      <span className={`arrow ${isOpen ? "up" : "down"}`}>▼</span>
                    </button>
                  </div>
                  <div
                    className="faq-answer"
                    style={{
                      maxHeight: isOpen ? "300px" : "0",
                      opacity: isOpen ? 1 : 0,
                      paddingTop: isOpen ? "16px" : "0"
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
 