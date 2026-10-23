import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "How does Alo Yoga sizing run?",
    a: "Our activewear is engineered to fit true to size. Our signature Softsculpt and Airlift fabrics offer gentle, contouring compression that hugs your curves without pinching. If you are between sizes and prefer a tighter performance sculpt, size down. For relaxed studio lounging, choose your usual size. Check our interactive Size Guide on any product page for exact measurements."
  },
  {
    q: "What countries do you ship to, and how fast is international delivery?",
    a: "We ship express worldwide to over 80 countries, including the United States, Canada, United Kingdom, Australia, Brazil, Europe, and Asia. All orders are packed and dispatched within 24-48 hours. Express transit typically delivers in 3 to 5 business days via tracked DHL/FedEx."
  },
  {
    q: "Are the leggings and dresses 100% squat-proof and non-sheer?",
    a: "Yes! Every single fabric formulation in the Airlift, Alosoft, and Softsculpt lines undergoes rigorous bend and stretch testing under bright studio lights to ensure 100% opacity, squat-proof coverage, and zero camel-toe."
  },
  {
    q: "What is your return & exchange policy?",
    a: "We offer a 30-Day Risk-Free Trial on all orders. If you need a different size, color, or style, you can initiate a complimentary exchange with zero restocking fees. Garments must be unworn and in original condition."
  },
  {
    q: "How should I wash and care for my Softsculpt activewear?",
    a: "To maintain the buttery softness and elasticity of the fabric, we recommend machine washing on cold inside out with similar athletic fabrics. Hang dry or tumble dry on the lowest heat setting. Avoid fabric softeners and bleach."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="alo-faq-section" id="faq">
      <div className="alo-faq-container">
        <div className="alo-faq-header">
          <div className="alo-faq-badge">
            <HelpCircle size={14} />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="alo-faq-title">EVERYTHING YOU NEED TO KNOW</h2>
          <p className="alo-faq-sub">Have questions before purchasing? We have answers.</p>
        </div>

        <div className="alo-faq-list">
          {FAQS.map((item, idx) => (
            <div key={idx} className={`alo-faq-card ${openIndex === idx ? 'open' : ''}`}>
              <button
                className="alo-faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="alo-faq-q-text">{item.q}</span>
                {openIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openIndex === idx && (
                <div className="alo-faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
