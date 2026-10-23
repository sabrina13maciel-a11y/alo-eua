import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Mail, CheckCircle2, Award, Truck, Lock, Phone } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 4000);
  };

  return (
    <footer className="alo-footer-root">
      <div className="alo-footer-container">
        {/* Newsletter Subscription Strip */}
        <div className="alo-footer-newsletter-box">
          <div className="alo-newsletter-text">
            <span className="alo-newsletter-badge">BECOME AN ALO VIP MEMBER</span>
            <h3 className="alo-newsletter-title">UNLOCK EXTRA 20% OFF YOUR FIRST ORDER</h3>
            <p className="alo-newsletter-desc">
              Subscribe to receive exclusive early access to limited color drops, private flash sales, and California studio styling guides.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="alo-newsletter-form">
            {subscribed ? (
              <div className="alo-newsletter-success">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>You're in! Use VIP coupon code <strong>ALOVIP</strong> at checkout for 20% off.</span>
              </div>
            ) : (
              <div className="alo-newsletter-input-wrap">
                <Mail size={16} className="alo-newsletter-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="alo-newsletter-input"
                />
                <button type="submit" className="alo-newsletter-btn">
                  <span>JOIN</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="alo-footer-columns">
          {/* Brand & California Headquarters */}
          <div className="alo-footer-col brand-col">
            <div className="alo-footer-logo">
              <svg viewBox="0 0 71 48" width="60" height="40" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#FFFFFF"
                  d="M22.826 19.591h5.771v27.43h-5.77v-1.928A13.973 13.973 0 0114.298 48C6.414 48 0 41.409 0 33.306c0-8.103 6.414-14.694 14.299-14.694 3.193 0 6.145 1.082 8.527 2.907zm-.145 13.715c0-4.861-3.76-8.816-8.382-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.76 8.816 8.382 8.816s8.382-3.954 8.382-8.816zM39.434 47.02h-5.906V0h5.906zm2.969-13.714c0-8.103 6.414-14.694 14.298-14.694C64.586 18.612 71 25.203 71 33.306 71 41.41 64.586 48 56.701 48c-7.884 0-14.298-6.59-14.298-14.694zm22.451 0c0-4.861-3.76-8.816-8.153-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.759 8.816 8.382 8.816 4.393 0 8.153-3.954 8.153-8.816z"
                />
              </svg>
            </div>
            <p className="alo-footer-brand-bio">
              Mindful movement. Inspiring wellness. Elevating activewear from Beverly Hills studio to street with unparalleled Softsculpt™ fabric technology.
            </p>
            <div className="alo-footer-trust-pills">
              <div className="alo-footer-guarantee-pill">
                <Award size={14} className="text-amber-400" />
                <span>BBB Accredited Business · A+ Rating</span>
              </div>
              <div className="alo-footer-guarantee-pill mt-1">
                <Truck size={14} />
                <span>USPS Priority Domestic Dispatch</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="alo-footer-col">
            <h4 className="alo-footer-col-title">COLLECTIONS</h4>
            <ul className="alo-footer-links">
              <li>
                <button onClick={() => onSelectCategory('bestsellers')}>Best Sellers (70% Off)</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Dresses & Rompers')}>Viral Sculpt Dresses</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Bras & Tops')}>Bras & Crop Tops</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Leggings & Bottoms')}>Sculpt Leggings & Shorts</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Hoodies & Jackets')}>Hoodies & Sweatshirts</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Accessories')}>Accessories & Bags</button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="alo-footer-col">
            <h4 className="alo-footer-col-title">U.S. CUSTOMER CARE</h4>
            <ul className="alo-footer-links">
              <li><a href="#reviews">Verified U.S. Buyer Reviews</a></li>
              <li><a href="#faq">U.S. Size & Fit Guide</a></li>
              <li><a href="#faq">Track Your USPS Package</a></li>
              <li><a href="#faq">30-Day Risk-Free Returns & Exchanges</a></li>
              <li><a href="#faq">Shipping Rates & Transit Times</a></li>
              <li><a href="#faq">Fabric Care & Longevity Guide</a></li>
            </ul>
          </div>

          {/* U.S. Headquarters & Fulfillment */}
          <div className="alo-footer-col">
            <h4 className="alo-footer-col-title">CALIFORNIA FULFILLMENT</h4>
            <p className="alo-footer-text-block">
              <strong>U.S. Distribution Center:</strong><br />
              9600 Wilshire Blvd, Beverly Hills, CA 90212, United States
            </p>
            <p className="alo-footer-text-block mt-2">
              <strong>Customer Support Hours:</strong><br />
              Monday – Friday: 9:00 AM – 6:00 PM PST<br />
              Toll-Free: 1 (800) 410-YOGA<br />
              Email: support@alo-outlet.com
            </p>
            <p className="alo-footer-text-block mt-2 text-neutral-400">
              Orders dispatched within 24 hours via USPS Priority Mail with real-time GPS tracking.
            </p>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="alo-footer-bottom">
          <div className="alo-footer-copy">
            <p>© {new Date().getFullYear()} Alo Yoga Outlet Store. All Rights Reserved. Beverly Hills, CA, USA.</p>
          </div>

          {/* 100% US Domestic & Accepted Payment Methods */}
          <div className="alo-footer-payment-icons">
            <span className="alo-pay-tag">VISA</span>
            <span className="alo-pay-tag">MASTERCARD</span>
            <span className="alo-pay-tag">AMEX</span>
            <span className="alo-pay-tag">DISCOVER</span>
            <span className="alo-pay-tag">APPLE PAY</span>
            <span className="alo-pay-tag">GOOGLE PAY</span>
            <span className="alo-pay-tag">STRIPE SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
