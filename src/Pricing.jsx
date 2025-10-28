 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './pricing.css';
 
function Pricing() {
  const [selectedCredits, setSelectedCredits] = useState(5000);
  const [isMonthly, setIsMonthly] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [conversionRate, setConversionRate] = useState(83); // Default USD→INR fallback
  const [isFetchingRate, setIsFetchingRate] = useState(true);
 
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
 
  // 💱 Fetch live USD→INR exchange rate using free API
  useEffect(() => {
    if (currency === 'INR') {
      const fetchExchangeRate = async () => {
        try {
          const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR');
          const data = await response.json();
          if (data?.rates?.INR) {
            setConversionRate(data.rates.INR);
          }
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
          setConversionRate(83);
        } finally {
          setIsFetchingRate(false);
        }
      };
      fetchExchangeRate();
    } else {
      setIsFetchingRate(false);
    }
  }, [currency]);
 
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
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Verify thousands of emails in seconds with our optimized infrastructure</p>
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
 
 