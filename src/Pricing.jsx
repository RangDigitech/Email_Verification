import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './pricing.css';

function Pricing() {
  const [selectedCredits, setSelectedCredits] = useState(1000);
  const [isMonthly, setIsMonthly] = useState(true);
  const [email, setEmail] = useState('');

  const creditOptions = [
    { amount: 100, label: '100 Credits', price: 2.99, perCredit: 0.0299 },
    { amount: 500, label: '500 Credits', price: 9.99, perCredit: 0.0199 },
    { amount: 1000, label: '1K Credits', price: 15.99, perCredit: 0.0159 },
    { amount: 2500, label: '2.5K Credits', price: 29.99, perCredit: 0.0119 },
    { amount: 5000, label: '5K Credits', price: 49.99, perCredit: 0.0099 },
    { amount: 10000, label: '10K Credits', price: 79.99, perCredit: 0.0079 },
    { amount: 25000, label: '25K Credits', price: 149.99, perCredit: 0.0059 },
    { amount: 50000, label: '50K Credits', price: 249.99, perCredit: 0.0049 }
  ];

  const calculatePrice = () => {
    const selectedOption = creditOptions.find(option => option.amount === selectedCredits);
    const basePrice = selectedOption ? selectedOption.price : selectedCredits * 0.01;
    return isMonthly ? basePrice : basePrice * 0.8; // 20% discount for yearly
  };

  const getPerCreditPrice = () => {
    const selectedOption = creditOptions.find(option => option.amount === selectedCredits);
    return selectedOption ? selectedOption.perCredit : 0.01;
  };

  const formatPrice = (price) => {
    return price < 1 ? `$${price.toFixed(2)}` : `$${Math.round(price)}`;
  };

  const handleCreditSelect = (amount) => {
    setSelectedCredits(amount);
  };

  const handleToggle = () => {
    setIsMonthly(!isMonthly);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Email:', email, 'Credits:', selectedCredits, 'Billing:', isMonthly ? 'Monthly' : 'Yearly');
  };

  return (
    <div className="main-container">
      <div className="pricing-container">
        {/* Left Panel - Credit Selection */}
        <div className="credit-selector">
          <h2>Choose Your Credits</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="email-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="selector-label">Select credit package:</div>
            <div className="credit-grid">
              {creditOptions.map((option) => (
                <div
                  key={option.amount}
                  className={`credit-option ${selectedCredits === option.amount ? 'active' : ''}`}
                  onClick={() => handleCreditSelect(option.amount)}
                >
                  <span className="amount">{option.amount.toLocaleString()}</span>
                  <span className="label">{option.label}</span>
                  <span className="price">${option.price}</span>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Right Panel - Pricing Card */}
        <div className="pricing-card">
          <div className="toggle-container">
            <span className={`toggle-label ${!isMonthly ? 'active' : ''}`}>Yearly</span>
            <div className={`toggle-switch ${isMonthly ? '' : 'monthly'}`} onClick={handleToggle}></div>
            <span className={`toggle-label ${isMonthly ? 'active' : ''}`}>Monthly</span>
          </div>

          <div className="price-display">
            <div className="price-value">{formatPrice(getPerCreditPrice())}</div>
            <div className="price-details">
              <div className="price-detail">
                <span className="value">{formatPrice(calculatePrice())}</span>
                <span className="label">Total Price</span>
              </div>
              <div className="price-detail">
                <span className="value">{selectedCredits.toLocaleString()}</span>
                <span className="label">Credits</span>
              </div>
            </div>
          </div>

          <Link to="/signup">
            <button className="cta-button">
              Get Started
            </button>
          </Link>
          <div className="free-credits">250 free credits included</div>

          <ul className="benefits">
            <li>Real-time email validation</li>
            <li>Bulk verification support</li>
            <li>API access included</li>
            <li>99.9% accuracy guarantee</li>
            <li>24/7 customer support</li>
          </ul>
        </div>
      </div>

      {/* Included Section */}
      <div className="included-section">
        <h2>Everything You Need</h2>
        <p className="subtitle">Powerful features included with every plan</p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Verify thousands of emails in seconds with our optimized infrastructure</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>High Accuracy</h3>
            <p>99.9% accuracy rate with advanced validation algorithms</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Enterprise-grade security with data encryption and privacy protection</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Detailed Reports</h3>
            <p>Comprehensive analytics and insights for your email campaigns</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <div className="faq-question">
              <div className="faq-icon">?</div>
              <h3>How does email verification work?</h3>
            </div>
            <div className="faq-answer">
              Our system checks email addresses against multiple validation criteria including syntax, domain, and deliverability to ensure accuracy.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <div className="faq-icon">?</div>
              <h3>What happens to my unused credits?</h3>
            </div>
            <div className="faq-answer">
              Credits never expire and roll over to the next billing cycle, so you never lose what you've paid for.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <div className="faq-icon">?</div>
              <h3>Can I integrate with my existing tools?</h3>
            </div>
            <div className="faq-answer">
              Yes! We offer API access and integrations with popular platforms like Zapier, Mailchimp, and more.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <div className="faq-icon">?</div>
              <h3>Is there a free trial available?</h3>
            </div>
            <div className="faq-answer">
              Yes! Every new account comes with 250 free credits to get you started with no credit card required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
