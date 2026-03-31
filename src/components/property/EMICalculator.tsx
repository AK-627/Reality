"use client";

import { useState, useMemo } from "react";
import { formatINR } from "@/lib/utils";

interface EMICalculatorProps {
  propertyPrice: number;
}

export default function EMICalculator({ propertyPrice }: EMICalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [downPayment, setDownPayment] = useState(Math.round(propertyPrice * 0.2));
  const [tenure, setTenure] = useState(20);
  const [annualRate, setAnnualRate] = useState(8.5);

  const emi = useMemo(() => {
    const principal = price - downPayment;
    if (principal <= 0 || annualRate <= 0 || tenure <= 0) return 0;
    const r = annualRate / 12 / 100;
    const n = tenure * 12;
    const emiValue = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emiValue);
  }, [price, downPayment, tenure, annualRate]);

  const loanAmount = Math.max(0, price - downPayment);

  return (
    <section aria-labelledby="emi-heading">
      <h2 id="emi-heading" className="text-xl font-semibold text-black mb-4">
        EMI Calculator
      </h2>

      <div className="bg-grey-50 border border-grey-200 rounded-lg p-5 space-y-4">
        {/* Property Price */}
        <div>
          <label htmlFor="emi-price" className="block text-sm font-medium text-black mb-1">
            Property Price (₹)
          </label>
          <input
            id="emi-price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Down Payment */}
        <div>
          <label htmlFor="emi-down" className="block text-sm font-medium text-black mb-1">
            Down Payment (₹)
          </label>
          <input
            id="emi-down"
            type="number"
            min={0}
            max={price}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Tenure */}
        <div>
          <label htmlFor="emi-tenure" className="block text-sm font-medium text-black mb-1">
            Loan Tenure (years)
          </label>
          <input
            id="emi-tenure"
            type="number"
            min={1}
            max={30}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label htmlFor="emi-rate" className="block text-sm font-medium text-black mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            id="emi-rate"
            type="number"
            min={0.1}
            max={30}
            step={0.1}
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Result */}
        <div className="pt-3 border-t border-grey-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-grey-600">Loan Amount</span>
            <span className="text-sm font-medium text-black">{formatINR(loanAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-black">Estimated EMI</span>
            <span className="text-xl font-bold text-black">
              {emi > 0 ? formatINR(emi) + "/mo" : "—"}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-grey-500 leading-relaxed">
          * This is an indicative estimate only. Actual EMI may vary based on the lender&apos;s
          terms, processing fees, and applicable taxes. Please consult a financial advisor
          before making any decisions.
        </p>
      </div>
    </section>
  );
}
