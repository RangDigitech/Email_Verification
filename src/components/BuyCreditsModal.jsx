import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BuyCreditsModal.css';

function BuyCreditsModal({ onClose }) {
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
    onClose(); // Close modal after submission
  };

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

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
      </div>
    </div>
  );
}

export default BuyCreditsModal;
