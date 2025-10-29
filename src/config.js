/**
 * Application Configuration
 * 
 * Centralized place for all app-wide constants
 */

// 💱 Exchange Rates
// Current market rate: 1 USD = 88.23 INR (as of your last update)
// We add a small buffer to handle short-term fluctuations
export const USD_TO_INR_RATE = 90;

// 📝 Update Instructions:
// To update the exchange rate:
// 1. Check current rate at: https://www.google.com/search?q=usd+to+inr
// 2. Add 1-3% buffer for safety
// 3. Update USD_TO_INR_RATE above
// 4. Save this file - changes will apply everywhere automatically!

// Last Updated: 2025-10-29
// Next Review: Check monthly or when rate changes significantly (±5%)

export default {
  USD_TO_INR_RATE,
};

