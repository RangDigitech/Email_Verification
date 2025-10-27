import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BuyCreditsModal.css';

function BuyCreditsModal({ onClose }) {
  const [selectedCredits, setSelectedCredits] = useState(5000);
  const [isMonthly, setIsMonthly] = useState(false);
  const [email, setEmail] = useState('');

  const creditOptions = [
    { amount: 5000, price: 10.00, perCreditPayg: 0.0021, perCreditMonthly: 0.001785 },
    { amount: 10000, price: 15.00, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 20000, price: 30.00, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 40000, price: 60.00, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 80000, price: 80.00, perCreditPayg: 0.0010, perCreditMonthly: 0.00085 },
    { amount: 100000, price: 100.00, perCreditPayg: 0.0010, perCreditMonthly: 0.000765 },
    { amount: 200000, price: 180.00, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
    { amount: 1000000, price: 900.00, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
  ];

  const calculatePrice = () => {
    const option = creditOptions.find(o => o.amount === selectedCredits);
    const base = option ? option.price : selectedCredits * 0.01;
    return isMonthly ? base * 0.85 : base; // 15% monthly discount
  };

  const getPerCreditPrice = () => {
    const option = creditOptions.find(o => o.amount === selectedCredits);
    
    if (option) {
      // Use the fixed per-credit rate from the CSV data
      const perCredit = isMonthly ? option.perCreditMonthly : option.perCreditPayg;
      
      if (perCredit >= 0.01) {
        return `$${perCredit.toFixed(2)}`;
      } else if (perCredit >= 0.001) {
        return `$${perCredit.toFixed(4)}`;
      } else {
        return `$${perCredit.toFixed(6)}`;
      }
    } else {
      // For custom amounts, calculate dynamically
      const totalPrice = calculatePrice();
      const perCredit = totalPrice / selectedCredits;
      
      if (perCredit >= 0.01) {
        return `$${perCredit.toFixed(2)}`;
      } else if (perCredit >= 0.001) {
        return `$${perCredit.toFixed(4)}`;
      } else {
        return `$${perCredit.toFixed(6)}`;
      }
    }
  };

  const handleToggle = () => setIsMonthly(!isMonthly);
  const handleSelect = (amt) => setSelectedCredits(amt);
  const formatPrice = (p) => `$${p.toFixed(2)}`;

  const option = creditOptions.find(o => o.amount === selectedCredits);
  const basePrice = option ? option.price : selectedCredits * 0.01;
  const discounted = basePrice * 0.85;
  const save = (basePrice - discounted).toFixed(2);

  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-header">
          <h1>Buy Credits</h1>
        </div>

        <div className="pricing-container">
          {/* LEFT SIDE – PACKAGE GRID */}
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

          {/* RIGHT SIDE – PRICE CARD */}
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
                  <div className="save-badge">SAVE ${save}</div>
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
              <button className="cta-button">NEXT</button>
            </Link>

            <ul className="benefits">
              <li>Real-time email validation</li>
              <li>Bulk verification support</li>
              <li>API access included</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyCreditsModal;