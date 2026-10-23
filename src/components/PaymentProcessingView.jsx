import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function PaymentProcessingView({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    "Establishing secure 256-bit encrypted banking session...",
    "Authorizing payment & verifying fraud protection...",
    "Allocating warehouse inventory & generating priority packing slip...",
    "Payment approved! Finalizing your order receipt..."
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2200);
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="alo-processing-root">
      <div className="alo-processing-card">
        {/* Animated Ring Loader */}
        <div className="alo-processing-loader-box">
          <div className="alo-processing-spinner" />
          <Lock size={20} className="alo-processing-lock-icon" />
        </div>

        <h2 className="alo-processing-title">PROCESSING YOUR ORDER</h2>
        <p className="alo-processing-sub">Please do not refresh or close this browser window.</p>

        {/* Steps List */}
        <div className="alo-processing-steps">
          {steps.map((text, idx) => (
            <div
              key={idx}
              className={`alo-step-item ${idx < step ? 'completed' : idx === step ? 'active' : 'pending'}`}
            >
              <div className="alo-step-bullet">
                {idx < step ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span className="alo-step-text">{text}</span>
            </div>
          ))}
        </div>

        <div className="alo-processing-footer">
          <ShieldCheck size={14} className="text-green-600" />
          <span>Verified Merchant · Alo Yoga Official Fulfillment Center</span>
        </div>
      </div>
    </div>
  );
}
