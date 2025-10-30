 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './pricing.css';
import { USD_TO_INR_RATE } from './config';
 
function Pricing() {
  const [selectedCredits, setSelectedCredits] = useState(5000);
  const [isMonthly, setIsMonthly] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [conversionRate] = useState(USD_TO_INR_RATE); // Hardcoded exchange rate from config
  const [isFetchingRate] = useState(false); // No longer fetching from API
 
  // 🌍 Detect user's location to set currency
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code === 'IN') {
          setCurrency('INR');
        } else {
          setCurrency('USD');
        }
      })
      .catch(() => setCurrency('USD'));
  }, []);
 
  // 💱 Using hardcoded exchange rate (no API call needed)
  // Rate is managed in src/config.js for easy updates
  // Current rate: 1 USD = ${USD_TO_INR_RATE} INR (includes buffer)
 
  // 💰 Credit package options
  const creditOptions = [
    { amount: 5000, price: 11, perCreditPayg: 0.0021, perCreditMonthly: 0.001785 },
    { amount: 10000, price: 15, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 20000, price: 31, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 40000, price: 60, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 80000, price: 80, perCreditPayg: 0.0010, perCreditMonthly: 0.00085 },
    { amount: 100000, price: 100, perCreditPayg: 0.0010, perCreditMonthly: 0.00085 },
    { amount: 200000, price: 180, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
    { amount: 1000000, price: 900, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
  ];
 
  const calculatePrice = () => {
    if (selectedCredits < 5000) {
      const minOption = creditOptions[0];
      const price = isMonthly ? minOption.price * 0.85 : minOption.price;
      return price;
    }
    const option = creditOptions.find(o => o.amount === selectedCredits);
    const base = option ? option.price : selectedCredits * 0.01;
    return isMonthly ? base * 0.85 : base;
  };
 
  const getPerCreditPrice = () => {
    const price = calculatePrice();
    const perCredit = price / selectedCredits;
    const displayPrice = currency === 'INR' ? perCredit * conversionRate : perCredit;
 
    if (displayPrice >= 0.01) {
      return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(2)}`;
    } else if (displayPrice >= 0.001) {
      return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(4)}`;
    } else {
      return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(6)}`;
    }
  };
 
  const handleToggle = () => setIsMonthly(!isMonthly);
  const handleSelect = (amt) => setSelectedCredits(amt);
 
  const formatPrice = (p) => {
    const converted = currency === 'INR' ? p * conversionRate : p;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${Math.round(converted)}`;
  };
 
  const option = creditOptions.find(o => o.amount === selectedCredits);
  const basePrice = selectedCredits < 5000
    ? creditOptions[0].price
    : (option ? option.price : selectedCredits * 0.01);
  const discounted = basePrice * 0.85;
  const exceedsMax = selectedCredits > 1000000;
 
  return (
    <div className="main-container">
      <div className="pricing-hero">
        <h1>Flexible Pricing Options</h1>
        <p>Choose the plan that's perfect for your business needs</p>
        <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
          {isFetchingRate && currency === 'INR' && 'Fetching live exchange rate...'}
        </p>
      </div>
 
      <div className="pricing-container">
        {/* Left Panel - Credit Selection */}
        <div className="credit-selector">
          <h2 className="section-title">CHOOSE A PACKAGE</h2>
 
          <div className="credit-grid">
            {creditOptions.map((option) => (
              <div
                key={option.amount}
                className={`credit-card ${selectedCredits === option.amount ? 'active' : ''}`}
                onClick={() => handleSelect(option.amount)}
              >
                {selectedCredits === option.amount && (
                  <div className="checkmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
                <div className="credit-amount">{option.amount.toLocaleString()}</div>
                <div className="credit-text">Credits</div>
              </div>
            ))}
          </div>
 
          <div className="custom-amount-section">
            <p className="custom-label">OR ENTER AN AMOUNT OF CREDITS</p>
            <input
              type="number"
              className="custom-input"
              placeholder="5,000"
              min="1"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0) setSelectedCredits(val);
              }}
            />
          </div>
        </div>
 
        {/* Right Panel - Pricing Card */}
        {!exceedsMax && (
          <div className="pricing-card">
            <div className="toggle-container">
              <span className={`toggle-label ${!isMonthly ? 'active' : ''}`}>Pay-As-You-Go</span>
              <div className={`toggle-switch ${isMonthly ? 'monthly' : ''}`} onClick={handleToggle}>
                <div className="toggle-slider"></div>
              </div>
              <span className={`toggle-label ${isMonthly ? 'active' : ''}`}>Subscription</span>
            </div>
 
            <div className="price-display">
              {isMonthly && (
                <>
                  <div className="old-price">{formatPrice(basePrice)}</div>
                  <div className="save-badge">
                    SAVE {formatPrice(basePrice - discounted)}
                  </div>
                </>
              )}
              <div className="new-price">
                {formatPrice(isMonthly ? discounted : basePrice)}
                {isMonthly && <span className="per-month">/month</span>}
              </div>
 
              <div className="per-credit">
                COST PER CREDIT
                <div className="per-credit-value">{getPerCreditPrice()}</div>
              </div>
            </div>
 
            <div className="price-breakdown">
              <div className="breakdown-row">
                <span>{selectedCredits.toLocaleString()} credits</span>
                <span>{formatPrice(isMonthly ? discounted : basePrice)}</span>
              </div>
              <div className="breakdown-row total">
                <span>Total</span>
                <span>{formatPrice(isMonthly ? discounted : basePrice)}</span>
              </div>
            </div>
 
            <Link to="/signup">
              <button className="cta-button">Get Started</button>
            </Link>
 
            <ul className="benefits">
              <li>Real-time email validation</li>
              <li>Bulk verification support</li>
              <li>API access included</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
        )}
      </div>
 
      {/* Modal for exceeding credit limit */}
      {exceedsMax && (
        <div className="modal-overlay active">
          <div className="contact-modal">
            <button className="modal-close" onClick={() => setSelectedCredits(1000000)}>×</button>
            <h2>Need more than<br />1,000,000 credits?</h2>
            <p>Contact our sales team for enterprise pricing</p>
            <Link to="/contact">
              <button className="contact-button">Contact Us</button>
            </Link>
          </div>
        </div>
      )}
 
      {/* Included Section */}
      <div className="included-section">
        <h2>Included with your account</h2>
        <p className="subtitle">Everything you need to verify emails at scale</p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/accuracy 1.png" alt="Adaptive Validation" />
            </div>
            <h3>Adaptive Validation</h3>
            <p>Smartly adjusts verification intensity based on email type and risk profile</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/optimization 1.png" alt="Continuous Optimization" />
            </div>
            <h3>Continuous Optimization</h3>
            <p>System performance and accuracy improve automatically with every verification</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/insight 1.png" alt="Activity Insights" />
            </div>
            <h3>Activity Insights</h3>
            <p>Track verification trends, usage, and team activity to optimize performance</p>
          </div>
        </div>
      </div>
 
      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <div className="faq-question">
              <h3>1. How accurate are your verification results?</h3>
            </div>
            <div className="faq-answer">
              Our system uses advanced validation layers and AI-driven logic to deliver up to 99% accuracy, minimizing false positives and keeping your sender reputation strong.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>2. What happens to my unused credits?</h3>
            </div>
            <div className="faq-answer">
              Credits never expire and roll over to the next billing cycle, so you never lose what you've paid for.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>3. Does your tool detect temporary or disposable emails?</h3>
            </div>
            <div className="faq-answer">
            Absolutely. Our system flags disposable, fake, and role-based email addresses to help you maintain a clean, high-quality mailing list.
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>4. Is there a free trial available?</h3>
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
 
 