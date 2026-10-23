import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Check } from 'lucide-react';
import { IN_CART_UPSELLS } from '../data/upsells';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    shippingCost,
    total,
    amountToFreeShipping,
    freeShippingProgress,
    hasFreeShipping,
    formatPrice,
    couponCode,
    couponMessage,
    applyCoupon,
    removeCoupon,
    discountAmount,
    navigateToCheckout,
    addToCart
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [upsellAdded, setUpsellAdded] = useState({});

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon) return;
    applyCoupon(inputCoupon);
  };

  const handleAddUpsell = (item) => {
    addToCart({
      id: item.id,
      handle: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      selectedColor: item.color,
      thumbnailImage: item.thumbnail
    }, {
      color: item.color,
      size: item.size,
      quantity: 1,
      thumbnail: item.thumbnail
    });
    setUpsellAdded((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setUpsellAdded((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <div className="alo-cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="alo-cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="alo-cart-header">
          <div className="alo-cart-header-title">
            <ShoppingBag size={20} />
            <span>YOUR BAG ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <button
            className="alo-icon-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Shopping Bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="alo-cart-shipping-bar-box">
          <div className="alo-shipping-status-row">
            {hasFreeShipping ? (
              <span className="alo-shipping-status-unlocked">
                🎉 Congratulations! You unlocked <strong>FREE U.S. Priority Shipping</strong>!
              </span>
            ) : (
              <span className="alo-shipping-status-pending">
                Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for <strong>FREE U.S. Priority Shipping</strong>!
              </span>
            )}
          </div>
          <div className="alo-progress-track">
            <div
              className={`alo-progress-fill ${hasFreeShipping ? 'unlocked' : ''}`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="alo-cart-items-scroll">
          {cart.length === 0 ? (
            <div className="alo-cart-empty">
              <ShoppingBag size={48} strokeWidth={1} className="alo-empty-bag-icon" />
              <h3>Your bag is currently empty</h3>
              <p>Discover our viral softsculpt collection and sculpting dresses.</p>
              <button
                className="alo-btn alo-btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="alo-cart-items-list">
              {cart.map((item) => (
                <div key={item.cartItemId} className="alo-cart-item">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="alo-cart-item-img"
                  />
                  <div className="alo-cart-item-info">
                    <div className="alo-cart-item-top">
                      <h4 className="alo-cart-item-name">{item.name}</h4>
                      <button
                        className="alo-cart-remove-btn"
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="alo-cart-item-meta">
                      <span>Color: {item.color}</span>
                      <span className="sep">·</span>
                      <span>Size: {item.size}</span>
                    </div>

                    <div className="alo-cart-item-bottom">
                      <div className="alo-cart-item-stepper">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="alo-cart-stepper-btn"
                        >
                          -
                        </button>
                        <span className="alo-cart-stepper-val">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="alo-cart-stepper-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="alo-cart-item-price-box">
                        <span className="alo-cart-item-price">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 1-Click In-Cart Upsells Carousel */}
              <div className="alo-cart-upsells-wrapper">
                <span className="alo-cart-upsell-heading">COMPLETE YOUR LOOK</span>
                <div className="alo-cart-upsell-list">
                  {IN_CART_UPSELLS.map((up) => (
                    <div key={up.id} className="alo-cart-upsell-card">
                      <img src={up.thumbnail} alt={up.name} className="alo-cart-upsell-img" />
                      <div className="alo-cart-upsell-info">
                        <span className="alo-cart-upsell-badge">{up.tag}</span>
                        <h5 className="alo-cart-upsell-title">{up.name}</h5>
                        <div className="alo-cart-upsell-price-row">
                          <span className="alo-cart-upsell-price">{formatPrice(up.price)}</span>
                          <span className="alo-cart-upsell-old">{formatPrice(up.originalPrice)}</span>
                        </div>
                      </div>
                      <button
                        className={`alo-cart-upsell-add-btn ${upsellAdded[up.id] ? 'added' : ''}`}
                        onClick={() => handleAddUpsell(up)}
                        aria-label={`Add ${up.name} to bag`}
                      >
                        {upsellAdded[up.id] ? <Check size={14} /> : <Plus size={14} />}
                        <span>{upsellAdded[up.id] ? 'ADDED' : 'ADD'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout Summary */}
        {cart.length > 0 && (
          <div className="alo-cart-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="alo-cart-coupon-form">
              <div className="alo-coupon-input-wrap">
                <Tag size={15} className="alo-coupon-icon" />
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder="Promo code (try 'ALOVIP')"
                  className="alo-coupon-input"
                />
                <button type="submit" className="alo-coupon-btn">
                  APPLY
                </button>
              </div>
              {couponMessage && (
                <div className={`alo-coupon-msg ${couponMessage.type}`}>
                  <span>{couponMessage.text}</span>
                  {couponCode && (
                    <button type="button" onClick={removeCoupon} className="alo-coupon-remove">
                      Remove
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="alo-cart-breakdown">
              <div className="alo-breakdown-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal + discountAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="alo-breakdown-row discount">
                  <span>VIP Discount ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="alo-breakdown-row">
                <span>USPS Priority Tracked Shipping</span>
                <span>{hasFreeShipping ? <strong className="text-green-600">FREE</strong> : formatPrice(shippingCost)}</span>
              </div>
              <div className="alo-breakdown-row total">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Direct Checkout CTA Button */}
            <button
              onClick={navigateToCheckout}
              className="alo-btn alo-btn-primary alo-cart-checkout-btn"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={18} />
            </button>

            {/* Security Guarantee Badges */}
            <div className="alo-cart-security-row">
              <div className="alo-security-badge">
                <ShieldCheck size={13} />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <span className="sep">·</span>
              <div className="alo-security-badge">
                <span>30-Day Free U.S. Returns</span>
              </div>
            </div>

            <div className="alo-payment-methods-strip">
              <span>Accepted: Visa, Mastercard, AMEX, Discover, Apple Pay, Shop Pay, PayPal, Klarna</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
