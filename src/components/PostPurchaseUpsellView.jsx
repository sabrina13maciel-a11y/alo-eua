import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { POST_PURCHASE_UPSELL } from '../data/upsells';
import { Sparkles, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export default function PostPurchaseUpsellView({ onAcceptUpsell, onDeclineUpsell }) {
  const { formatPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onAcceptUpsell(POST_PURCHASE_UPSELL);
    }, 900);
  };

  return (
    <div className="alo-upsell-root">
      <div className="alo-upsell-container">
        {/* Warning Urgency Banner */}
        <div className="alo-upsell-urgent-box">
          <Clock size={16} className="text-amber-500 animate-pulse" />
          <span>DO NOT CLOSE OR REFRESH: YOUR INITIAL ORDER IS CONFIRMED!</span>
        </div>

        <div className="alo-upsell-card">
          <div className="alo-upsell-header">
            <span className="alo-upsell-badge">
              <Sparkles size={13} />
              <span>EXCLUSIVE POST-PURCHASE UNLOCK</span>
            </span>
            <h1 className="alo-upsell-title">
              COMPLETE YOUR LOOK WITH 60% OFF
            </h1>
            <p className="alo-upsell-sub">
              As a thank you for your order today, we're giving you a one-time opportunity to add our viral outerwear staple to your package with <strong>zero additional shipping fees</strong>.
            </p>
          </div>

          <div className="alo-upsell-body">
            <div className="alo-upsell-image-box">
              <img
                src={POST_PURCHASE_UPSELL.image}
                alt={POST_PURCHASE_UPSELL.name}
                className="alo-upsell-img"
              />
              <span className="alo-upsell-img-discount">
                {POST_PURCHASE_UPSELL.discountPercent}
              </span>
            </div>

            <div className="alo-upsell-details">
              <h2 className="alo-upsell-prod-name">{POST_PURCHASE_UPSELL.name}</h2>
              
              <div className="alo-upsell-pricing">
                <span className="alo-upsell-special-price">
                  {formatPrice(POST_PURCHASE_UPSELL.discountPrice)}
                </span>
                <span className="alo-upsell-old-price">
                  {formatPrice(POST_PURCHASE_UPSELL.originalPrice)}
                </span>
                <span className="alo-upsell-savings-tag">
                  Save {formatPrice(POST_PURCHASE_UPSELL.originalPrice - POST_PURCHASE_UPSELL.discountPrice)}
                </span>
              </div>

              <p className="alo-upsell-desc">{POST_PURCHASE_UPSELL.description}</p>

              <ul className="alo-upsell-features">
                {POST_PURCHASE_UPSELL.features.map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="alo-btn alo-btn-primary alo-upsell-accept-btn"
              >
                {isProcessing ? (
                  <span className="alo-btn-loader" />
                ) : (
                  <span>YES! ADD TO MY ORDER WITH 1-CLICK ({formatPrice(POST_PURCHASE_UPSELL.discountPrice)})</span>
                )}
              </button>

              <button
                onClick={onDeclineUpsell}
                className="alo-upsell-decline-link"
              >
                No thank you, I understand this 60% offer will never be shown again.
              </button>

              <div className="alo-upsell-footer-note">
                <ShieldCheck size={14} className="text-neutral-500" />
                <span>Charged directly to your initial payment method · No re-entering details</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
