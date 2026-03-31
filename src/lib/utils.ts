/**
 * Apply the 1% phone verification discount to a price.
 * Returns Math.round(price * 0.99).
 */
export function applyPhoneDiscount(price: number): number {
  return Math.round(price * 0.99);
}

/**
 * Format a number as Indian Rupees (INR) with the ₹ symbol
 * and Indian number grouping (lakhs / crores).
 *
 * Examples:
 *   formatINR(500000)    → "₹5,00,000"
 *   formatINR(10000000)  → "₹1,00,00,000"
 */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
}
