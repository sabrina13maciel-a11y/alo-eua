import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import {
  STRIPE_PUBLISHABLE_KEY,
  createStripePaymentIntent,
  submitCheckoutOrder,
  trackFunnelEvent
} from '../config/endpoints';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Lock,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Tag,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Check,
  ShoppingBag,
  Smartphone,
  Edit2
} from 'lucide-react';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'AA', name: 'Armed Forces Americas' },
  { code: 'AE', name: 'Armed Forces Europe' },
  { code: 'AP', name: 'Armed Forces Pacific' }
];

const stripeElementStyles = {
  style: {
    base: {
      fontSize: '15px',
      color: '#111111',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      '::placeholder': {
        color: '#8e8e93',
      },
    },
    invalid: {
      color: '#e53e3e',
      iconColor: '#e53e3e',
    },
  },
};

function CheckoutFormInner({ onBackToStore, onOrderSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const {
    cart,
    subtotal,
    shippingCost,
    total,
    formatPrice,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  // Multi-step state: 1 = Information, 2 = Shipping, 3 = Payment
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Device detection: iOS vs Android vs Desktop
  const [device, setDevice] = useState({ isIOS: false, isAndroid: false, isMobile: false });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = navigator.userAgent || '';
      const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);
      const isMobile = isIOS || isAndroid || /Mobi|Mobile/i.test(ua);
      setDevice({ isIOS, isAndroid, isMobile });
    }
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'CA',
    zip: '',
    country: 'United States',
    shippingMethod: 'standard', // 'standard' | 'express'
    paymentMethod: 'card', // 'card' | 'paypal' | 'klarna'
    cardName: '',
    billingSameAsShipping: true,
    saveInfo: true,
  });

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [inputCoupon, setInputCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [stripeError, setStripeError] = useState(null);

  const expressShippingExtra = formData.shippingMethod === 'express' ? 12.95 : 0;
  const finalTotal = total + expressShippingExtra;

  // Initialize Native Apple Pay / Google Pay PaymentRequest via Stripe
  useEffect(() => {
    if (!stripe) return;

    try {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Alo Yoga Total',
          amount: Math.round(finalTotal * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        try {
          setIsSubmitting(true);
          const { clientSecret } = await createStripePaymentIntent({
            total: finalTotal,
            customer: {
              email: ev.payerEmail || formData.email,
              firstName: ev.payerName?.split(' ')[0] || formData.firstName || 'Valued',
              lastName: ev.payerName?.split(' ').slice(1).join(' ') || formData.lastName || 'Customer',
              phone: ev.payerPhone || formData.phone,
            },
            items: cart,
            shippingMethod: formData.shippingMethod,
          });

          const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete('fail');
            setStripeError(confirmError.message);
            setIsSubmitting(false);
          } else {
            ev.complete('success');
            const result = await submitCheckoutOrder({
              paymentIntentId: paymentIntent.id,
              total: finalTotal,
              customer: {
                email: ev.payerEmail || formData.email,
                firstName: ev.payerName?.split(' ')[0] || 'Valued',
              },
              items: cart,
              shippingMethod: formData.shippingMethod,
            });
            clearCart();
            if (onOrderSuccess) onOrderSuccess(result);
          }
        } catch (err) {
          ev.complete('fail');
          setStripeError(err.message);
          setIsSubmitting(false);
        }
      });
    } catch (e) {
      console.warn('PaymentRequest initialization error:', e);
    }
  }, [stripe, finalTotal, cart, formData.shippingMethod]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (stripeError) setStripeError(null);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCoupon(inputCoupon.trim());
  };

  // Step 1 Validation: Information
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      newErrors.phone = 'Mobile phone is required for delivery SMS alerts';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation: Shipping
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.zip || formData.zip.replace(/\D/g, '').length < 5) {
      newErrors.zip = 'Valid 5-digit US ZIP code is required (e.g. 90210)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleProceedToShipping = (e) => {
    e?.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProceedToPayment = (e) => {
    e?.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToInformation = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToShipping = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger Apple Pay or Google Pay 1-click
  const triggerMobilePayment = () => {
    if (paymentRequest && canMakePayment) {
      paymentRequest.show();
    } else {
      // If paymentRequest not natively ready, smoothly focus card input
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' }));
      const cardEl = document.getElementById('alo-card-input-anchor');
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Step 3: Final Card / Order Submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setStripeError(null);

    if (formData.paymentMethod === 'card' && !formData.cardName.trim()) {
      setErrors((prev) => ({ ...prev, cardName: 'Name on card is required' }));
      return;
    }

    if (formData.paymentMethod === 'paypal') {
      setIsSubmitting(true);
      setTimeout(async () => {
        const result = await submitCheckoutOrder({
          paymentMethod: 'paypal',
          total: finalTotal,
          customer: formData,
          items: cart,
          shippingMethod: formData.shippingMethod
        });
        clearCart();
        if (onOrderSuccess) onOrderSuccess(result);
      }, 1200);
      return;
    }

    if (formData.paymentMethod === 'klarna') {
      setIsSubmitting(true);
      setTimeout(async () => {
        const result = await submitCheckoutOrder({
          paymentMethod: 'klarna',
          total: finalTotal,
          customer: formData,
          items: cart,
          shippingMethod: formData.shippingMethod
        });
        clearCart();
        if (onOrderSuccess) onOrderSuccess(result);
      }, 1200);
      return;
    }

    // Process Credit Card with Stripe Elements
    if (!stripe || !elements) {
      setStripeError('Stripe security module is loading. Please wait a second.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setStripeError('Please enter your card number.');
      return;
    }

    setIsSubmitting(true);
    trackFunnelEvent('AddPaymentInfo', {
      payment_type: 'card',
      value: finalTotal,
      currency: 'USD'
    });

    try {
      // 1. Create live Stripe PaymentIntent via secure backend
      const { clientSecret, paymentIntentId } = await createStripePaymentIntent({
        total: finalTotal,
        customer: formData,
        items: cart,
        shippingMethod: formData.shippingMethod
      });

      // 2. Confirm card payment with Stripe client
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: formData.cardName,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address,
                line2: formData.apartment || undefined,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zip,
                country: 'US',
              }
            }
          }
        }
      );

      if (confirmError) {
        console.error('[Stripe Card Error]', confirmError);
        setStripeError(confirmError.message || 'Your card could not be charged. Please verify details.');
        setIsSubmitting(false);
        return;
      }

      // 3. Record order & advance funnel
      trackFunnelEvent('Purchase', {
        value: finalTotal,
        currency: 'USD',
        transaction_id: paymentIntent.id
      });

      const orderResult = await submitCheckoutOrder({
        paymentIntentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        customer: formData,
        items: cart,
        shippingMethod: formData.shippingMethod,
        total: finalTotal,
        discount: discountAmount
      });

      clearCart();
      if (onOrderSuccess) {
        onOrderSuccess(orderResult);
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      setStripeError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="alo-checkout-root">
      {/* Top Header with Logo & SSL Security */}
      <header className="alo-checkout-header">
        <div className="alo-checkout-header-container">
          <button onClick={onBackToStore} className="alo-back-link" title="Return to shopping bag">
            <ArrowLeft size={16} />
            <span className="hidden-sm">Return to Bag</span>
          </button>

          <div className="alo-checkout-logo">
            <svg viewBox="0 0 71 48" width="58" height="38" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M22.826 19.591h5.771v27.43h-5.77v-1.928A13.973 13.973 0 0114.298 48C6.414 48 0 41.409 0 33.306c0-8.103 6.414-14.694 14.299-14.694 3.193 0 6.145 1.082 8.527 2.907zm-.145 13.715c0-4.861-3.76-8.816-8.382-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.76 8.816 8.382 8.816s8.382-3.954 8.382-8.816zM39.434 47.02h-5.906V0h5.906zm2.969-13.714c0-8.103 6.414-14.694 14.298-14.694C64.586 18.612 71 25.203 71 33.306 71 41.41 64.586 48 56.701 48c-7.884 0-14.298-6.59-14.298-14.694zm22.451 0c0-4.861-3.76-8.816-8.153-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.759 8.816 8.382 8.816 4.393 0 8.153-3.954 8.153-8.816z"
              />
            </svg>
          </div>

          <div className="alo-checkout-secure-pill">
            <Lock size={13} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Trust Credibility Banner (US Standards) */}
      <div className="alo-checkout-trust-strip">
        <div className="alo-checkout-trust-container">
          <div className="alo-trust-item">
            <Award size={15} className="text-amber-500" />
            <span>BBB Accredited Business <strong>A+ Rating</strong></span>
          </div>
          <span className="sep hidden-mobile">·</span>
          <div className="alo-trust-item">
            <Truck size={15} />
            <span>Dispatched from <strong>Los Angeles, CA</strong> via USPS</span>
          </div>
          <span className="sep hidden-mobile">·</span>
          <div className="alo-trust-item">
            <ShieldCheck size={15} className="text-green-600" />
            <span>30-Day Risk-Free Money Back Guarantee</span>
          </div>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE ORDER SUMMARY (Shopify US Standard) */}
      <div className="alo-mobile-order-summary-bar">
        <button
          type="button"
          className="alo-mobile-summary-btn"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          aria-expanded={mobileSummaryOpen}
        >
          <div className="alo-mobile-summary-left">
            <ShoppingBag size={17} />
            <span>{mobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            {mobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <div className="alo-mobile-summary-right">
            <span className="alo-mobile-summary-total">{formatPrice(finalTotal)}</span>
          </div>
        </button>

        {mobileSummaryOpen && (
          <div className="alo-mobile-summary-drawer">
            <div className="alo-summary-items">
              {cart.map((item) => (
                <div key={item.cartItemId} className="alo-summary-item">
                  <div className="alo-summary-item-media">
                    <img src={item.thumbnail} alt={item.name} />
                    <span className="alo-summary-item-badge">{item.quantity}</span>
                  </div>
                  <div className="alo-summary-item-desc">
                    <h4 className="alo-summary-item-title">{item.name}</h4>
                    <span className="alo-summary-item-variant">{item.color} / {item.size}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="alo-summary-item-saved">
                        70% OFF (Saved {formatPrice((item.originalPrice - item.price) * item.quantity)})
                      </span>
                    )}
                  </div>
                  <div className="alo-summary-item-price">
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Promo Form */}
            <form onSubmit={handleApplyPromo} className="alo-summary-promo-form mt-3">
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                placeholder="Discount code (try 'ALOVIP')"
                className="alo-summary-promo-input"
              />
              <button type="submit" className="alo-summary-promo-btn">
                APPLY
              </button>
            </form>

            {couponCode && (
              <div className="alo-summary-coupon-tag">
                <Tag size={13} />
                <span>{couponCode} (-{formatPrice(discountAmount)})</span>
                <button type="button" onClick={removeCoupon}>×</button>
              </div>
            )}

            {/* Mobile Breakdown */}
            <div className="alo-summary-breakdown mt-3">
              <div className="alo-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal + discountAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="alo-summary-row discount">
                  <span>VIP Extra Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="alo-summary-row">
                <span>
                  Shipping {formData.shippingMethod === 'express' ? '(FedEx 2-Day Air)' : '(USPS Priority)'}
                </span>
                <span>
                  {shippingCost === 0 && expressShippingExtra === 0
                    ? <strong className="text-green-600">FREE</strong>
                    : formatPrice(shippingCost + expressShippingExtra)}
                </span>
              </div>
              <div className="alo-summary-row total">
                <div>
                  <span className="alo-summary-total-label">Total</span>
                  <span className="alo-summary-currency-note">USD (All US taxes included)</span>
                </div>
                <span className="alo-summary-total-val">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="alo-checkout-container">
        {/* TIMELINE / STEPPER (Credibility & Progress) */}
        <div className="alo-checkout-stepper-wrap">
          <nav className="alo-checkout-stepper" aria-label="Checkout Progress">
            {/* Step 1 Pill */}
            <button
              type="button"
              className={`alo-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
              onClick={() => {
                if (currentStep > 1) setCurrentStep(1);
              }}
              disabled={currentStep < 1}
            >
              <span className="alo-step-indicator">
                {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
              </span>
              <span className="alo-step-label">Information</span>
            </button>

            <div className={`alo-step-divider ${currentStep > 1 ? 'completed' : ''}`} />

            {/* Step 2 Pill */}
            <button
              type="button"
              className={`alo-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
              onClick={() => {
                if (currentStep > 2 || (currentStep === 1 && validateStep1())) setCurrentStep(2);
              }}
              disabled={currentStep < 2 && !validateStep1}
            >
              <span className="alo-step-indicator">
                {currentStep > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
              </span>
              <span className="alo-step-label">Shipping</span>
            </button>

            <div className={`alo-step-divider ${currentStep > 2 ? 'completed' : ''}`} />

            {/* Step 3 Pill */}
            <button
              type="button"
              className={`alo-step-item ${currentStep === 3 ? 'active' : ''}`}
              onClick={() => {
                if (currentStep < 3 && validateStep1() && validateStep2()) setCurrentStep(3);
              }}
              disabled={currentStep < 3}
            >
              <span className="alo-step-indicator">3</span>
              <span className="alo-step-label">Payment</span>
            </button>
          </nav>
        </div>

        <div className="alo-checkout-grid">
          {/* LEFT COLUMN: MULTI-STEP CHECKOUT FORM */}
          <div className="alo-checkout-form-col">
            {/* ============================================================ */}
            {/* STEP 1: CONTACT INFORMATION */}
            {/* ============================================================ */}
            {currentStep === 1 && (
              <div className="alo-step-card animate-fade-in">
                <div className="alo-step-card-header">
                  <div>
                    <h2 className="alo-step-title">Contact Information</h2>
                    <p className="alo-step-subtitle">We will send your order receipt and live USPS tracking link here.</p>
                  </div>
                  <span className="alo-guest-badge">Guest Checkout</span>
                </div>

                <div className="alo-form-fields">
                  <div className="alo-input-group">
                    <label htmlFor="checkout-email">Email Address *</label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. sarah.miller@gmail.com"
                      autoComplete="email"
                      className={`alo-text-input ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="alo-input-error">{errors.email}</span>}
                  </div>

                  <div className="alo-form-row two-col mt-3">
                    <div className="alo-input-group">
                      <label htmlFor="checkout-firstname">First Name *</label>
                      <input
                        id="checkout-firstname"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="e.g. Sarah"
                        autoComplete="given-name"
                        className={`alo-text-input ${errors.firstName ? 'error' : ''}`}
                      />
                      {errors.firstName && <span className="alo-input-error">{errors.firstName}</span>}
                    </div>

                    <div className="alo-input-group">
                      <label htmlFor="checkout-lastname">Last Name *</label>
                      <input
                        id="checkout-lastname"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="e.g. Miller"
                        autoComplete="family-name"
                        className={`alo-text-input ${errors.lastName ? 'error' : ''}`}
                      />
                      {errors.lastName && <span className="alo-input-error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="alo-input-group mt-3">
                    <label htmlFor="checkout-phone">Mobile Phone (for USPS Delivery SMS) *</label>
                    <div className="alo-phone-input-wrap">
                      <span className="alo-phone-prefix">🇺🇸 +1</span>
                      <input
                        id="checkout-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 234-5678"
                        autoComplete="tel-national"
                        className={`alo-text-input alo-phone-field ${errors.phone ? 'error' : ''}`}
                      />
                    </div>
                    {errors.phone ? (
                      <span className="alo-input-error">{errors.phone}</span>
                    ) : (
                      <span className="alo-input-help">Automated SMS notifications when package is dispatched and out for delivery.</span>
                    )}
                  </div>

                  <label className="alo-checkbox-label mt-3">
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleChange}
                    />
                    <span>Email me with exclusive Alo VIP private flash sales and private restocks</span>
                  </label>
                </div>

                <div className="alo-step-action-row">
                  <button
                    type="button"
                    onClick={handleProceedToShipping}
                    className="alo-btn alo-btn-primary alo-btn-step-next"
                  >
                    <span>Continue to Shipping Address</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={onBackToStore}
                    className="alo-btn-step-back"
                  >
                    <ArrowLeft size={15} />
                    <span>Return to Shopping Bag</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: SHIPPING ADDRESS & METHOD */}
            {/* ============================================================ */}
            {currentStep === 2 && (
              <div className="alo-step-card animate-fade-in">
                {/* Step 1 Quick Summary Box (Shopify US Style) */}
                <div className="alo-review-strip">
                  <div className="alo-review-row">
                    <span className="alo-review-label">Contact:</span>
                    <span className="alo-review-value">{formData.email} · {formData.phone}</span>
                    <button type="button" onClick={handleBackToInformation} className="alo-review-edit">
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <div className="alo-step-card-header mt-4">
                  <div>
                    <h2 className="alo-step-title">Shipping Address</h2>
                    <p className="alo-step-subtitle">Where should we deliver your Alo Yoga order?</p>
                  </div>
                </div>

                <div className="alo-form-fields">
                  <div className="alo-input-group">
                    <label htmlFor="checkout-country">Country / Region *</label>
                    <div className="alo-select-wrap">
                      <select
                        id="checkout-country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="alo-text-input alo-select-input"
                      >
                        <option value="United States">🇺🇸 United States (Domestic USPS Priority)</option>
                        <option value="Canada">🇨🇦 Canada (USPS Priority International)</option>
                        <option value="United Kingdom">🇬🇧 United Kingdom (Tracked Express)</option>
                        <option value="Australia">🇦🇺 Australia (Tracked Express)</option>
                      </select>
                    </div>
                  </div>

                  <div className="alo-input-group mt-3">
                    <label htmlFor="checkout-address">Street Address *</label>
                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="1245 Wilshire Blvd"
                      autoComplete="address-line1"
                      className={`alo-text-input ${errors.address ? 'error' : ''}`}
                    />
                    {errors.address && <span className="alo-input-error">{errors.address}</span>}
                  </div>

                  <div className="alo-input-group mt-3">
                    <label htmlFor="checkout-apartment">Apartment, Suite, Unit (Optional)</label>
                    <input
                      id="checkout-apartment"
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Apt 4B"
                      autoComplete="address-line2"
                      className="alo-text-input"
                    />
                  </div>

                  <div className="alo-form-row three-col mt-3">
                    <div className="alo-input-group">
                      <label htmlFor="checkout-city">City *</label>
                      <input
                        id="checkout-city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Los Angeles"
                        autoComplete="address-level2"
                        className={`alo-text-input ${errors.city ? 'error' : ''}`}
                      />
                      {errors.city && <span className="alo-input-error">{errors.city}</span>}
                    </div>

                    <div className="alo-input-group">
                      <label htmlFor="checkout-state">State *</label>
                      <select
                        id="checkout-state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`alo-text-input alo-select-input ${errors.state ? 'error' : ''}`}
                      >
                        {US_STATES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.code} - {st.name}
                          </option>
                        ))}
                      </select>
                      {errors.state && <span className="alo-input-error">{errors.state}</span>}
                    </div>

                    <div className="alo-input-group">
                      <label htmlFor="checkout-zip">ZIP Code *</label>
                      <input
                        id="checkout-zip"
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="90210"
                        autoComplete="postal-code"
                        className={`alo-text-input ${errors.zip ? 'error' : ''}`}
                      />
                      {errors.zip && <span className="alo-input-error">{errors.zip}</span>}
                    </div>
                  </div>
                </div>

                {/* Shipping Method Section */}
                <div className="alo-shipping-method-section mt-5">
                  <h3 className="alo-shipping-method-title">Shipping Method</h3>
                  <div className="alo-shipping-options mt-2">
                    <label
                      className={`alo-shipping-card ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleChange}
                      />
                      <div className="alo-shipping-card-body">
                        <div className="alo-shipping-card-left">
                          <div className="alo-shipping-name-row">
                            <strong>USPS Priority Tracked Mail</strong>
                            <span className="alo-badge-usps">USPS</span>
                          </div>
                          <span className="alo-shipping-subtext">3-5 Business Days · Dispatched from Los Angeles, CA with live tracking</span>
                        </div>
                        <div className="alo-shipping-card-price">
                          <strong className="text-green-600">FREE</strong>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`alo-shipping-card ${formData.shippingMethod === 'express' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleChange}
                      />
                      <div className="alo-shipping-card-body">
                        <div className="alo-shipping-card-left">
                          <div className="alo-shipping-name-row">
                            <strong>FedEx / UPS 2-Day Air Express</strong>
                            <span className="alo-badge-fedex">2-DAY AIR</span>
                          </div>
                          <span className="alo-shipping-subtext">2 Business Days · Priority warehouse fulfillment within 24h</span>
                        </div>
                        <div className="alo-shipping-card-price">
                          <strong>+$12.95</strong>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="alo-step-action-row">
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="alo-btn alo-btn-primary alo-btn-step-next"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToInformation}
                    className="alo-btn-step-back"
                  >
                    <ArrowLeft size={15} />
                    <span>Return to Information</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: PAYMENT & FAST CHECKOUT */}
            {/* ============================================================ */}
            {currentStep === 3 && (
              <div className="alo-step-card animate-fade-in" id="alo-card-input-anchor">
                {/* Review Strip with Contact & Shipping */}
                <div className="alo-review-strip">
                  <div className="alo-review-row">
                    <span className="alo-review-label">Contact:</span>
                    <span className="alo-review-value">{formData.email}</span>
                    <button type="button" onClick={handleBackToInformation} className="alo-review-edit">
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="alo-review-row">
                    <span className="alo-review-label">Ship to:</span>
                    <span className="alo-review-value">
                      {formData.address}{formData.apartment ? `, ${formData.apartment}` : ''}, {formData.city}, {formData.state} {formData.zip}
                    </span>
                    <button type="button" onClick={handleBackToShipping} className="alo-review-edit">
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="alo-review-row">
                    <span className="alo-review-label">Method:</span>
                    <span className="alo-review-value">
                      {formData.shippingMethod === 'express' ? 'FedEx 2-Day Air ($12.95)' : 'USPS Priority (FREE)'}
                    </span>
                    <button type="button" onClick={handleBackToShipping} className="alo-review-edit">
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* DEVICE-SPECIFIC FAST 1-CLICK MOBILE CHECKOUT */}
                <div className="alo-fast-pay-highlight-card mt-4">
                  <div className="alo-fast-pay-header">
                    <Smartphone size={16} />
                    <span>Quick Mobile Checkout (No Typing Required)</span>
                  </div>

                  {/* iOS: Apple Pay Highlight */}
                  {device.isIOS && (
                    <div className="alo-mobile-pay-block">
                      <button
                        type="button"
                        onClick={triggerMobilePayment}
                        className="alo-branded-pay-btn alo-apple-pay-cta"
                        title="Pay with Apple Pay"
                      >
                        <span className="alo-apple-logo-text">Pay</span>
                        <span className="alo-btn-sub">1-Click Express Checkout</span>
                      </button>
                      <p className="alo-fast-pay-caption">
                        Fast & secure checkout using Touch ID or Face ID on your Apple device.
                      </p>
                    </div>
                  )}

                  {/* Android: Google Pay Highlight */}
                  {device.isAndroid && (
                    <div className="alo-mobile-pay-block">
                      <button
                        type="button"
                        onClick={triggerMobilePayment}
                        className="alo-branded-pay-btn alo-google-pay-cta"
                        title="Pay with Google Pay"
                      >
                        <span className="alo-google-logo-text">G Pay</span>
                        <span className="alo-btn-sub">1-Click Express Checkout</span>
                      </button>
                      <p className="alo-fast-pay-caption">
                        Fast checkout with your saved Google Pay credentials.
                      </p>
                    </div>
                  )}

                  {/* Desktop / Other Browsers: Show Both Options */}
                  {!device.isIOS && !device.isAndroid && (
                    <div className="alo-desktop-fast-pay-row">
                      <div className="alo-fast-buttons-grid">
                        <button
                          type="button"
                          onClick={triggerMobilePayment}
                          className="alo-branded-pay-btn alo-apple-pay-cta"
                          title="Apple Pay via Stripe"
                        >
                          <span>Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={triggerMobilePayment}
                          className="alo-branded-pay-btn alo-google-pay-cta"
                          title="Google Pay via Stripe"
                        >
                          <span>G Pay</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="alo-divider-with-text my-4">
                  <span>OR PAY WITH CREDIT / DEBIT CARD</span>
                </div>

                <form onSubmit={handleSubmitPayment} noValidate>
                  {/* Payment Methods Tab */}
                  <div className="alo-payment-tabs">
                    <button
                      type="button"
                      className={`alo-payment-tab ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'card' }))}
                    >
                      <CreditCard size={16} />
                      <span>Credit / Debit Card</span>
                    </button>

                    <button
                      type="button"
                      className={`alo-payment-tab ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'paypal' }))}
                    >
                      <span>PayPal</span>
                    </button>

                    <button
                      type="button"
                      className={`alo-payment-tab ${formData.paymentMethod === 'klarna' ? 'active' : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'klarna' }))}
                    >
                      <span>Klarna / Afterpay</span>
                    </button>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="alo-card-input-box">
                      <div className="alo-accepted-cards-row">
                        <span className="alo-card-sublabel">Powered by Stripe SSL:</span>
                        <div className="alo-card-badges-row">
                          <span className="alo-card-pill">VISA</span>
                          <span className="alo-card-pill">MASTERCARD</span>
                          <span className="alo-card-pill">AMEX</span>
                          <span className="alo-card-pill">DISCOVER</span>
                        </div>
                      </div>

                      <div className="alo-input-group mt-3">
                        <label>Card Number *</label>
                        <div className="alo-stripe-input-wrapper">
                          <CardNumberElement options={stripeElementStyles} />
                          <Lock size={15} className="alo-card-lock-icon" />
                        </div>
                      </div>

                      <div className="alo-input-group mt-3">
                        <label>Name on Card *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          placeholder="JESSICA MILLER"
                          autoComplete="cc-name"
                          className={`alo-text-input uppercase ${errors.cardName ? 'error' : ''}`}
                        />
                        {errors.cardName && <span className="alo-input-error">{errors.cardName}</span>}
                      </div>

                      <div className="alo-form-row two-col mt-3">
                        <div className="alo-input-group">
                          <label>Expiration (MM/YY) *</label>
                          <div className="alo-stripe-input-wrapper">
                            <CardExpiryElement options={stripeElementStyles} />
                          </div>
                        </div>

                        <div className="alo-input-group">
                          <label>Security Code (CVV) *</label>
                          <div className="alo-stripe-input-wrapper">
                            <CardCvcElement options={stripeElementStyles} />
                          </div>
                        </div>
                      </div>

                      <label className="alo-checkbox-label mt-3">
                        <input
                          type="checkbox"
                          name="billingSameAsShipping"
                          checked={formData.billingSameAsShipping}
                          onChange={handleChange}
                        />
                        <span>Billing address is same as shipping address</span>
                      </label>

                      {stripeError && (
                        <div className="alo-stripe-error-box mt-3">
                          <AlertCircle size={16} />
                          <span>{stripeError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.paymentMethod === 'paypal' && (
                    <div className="alo-paypal-prompt">
                      <p className="font-medium text-neutral-800">You will complete your purchase securely with PayPal.</p>
                      <p className="text-xs text-neutral-500 mt-1">PayPal balance, bank account, or 4 interest-free installments.</p>
                    </div>
                  )}

                  {formData.paymentMethod === 'klarna' && (
                    <div className="alo-bnpl-checkout-prompt">
                      <div className="alo-bnpl-split-row">
                        <div className="alo-bnpl-step">
                          <span className="step-num">1</span>
                          <span>Today: <strong>{formatPrice(finalTotal / 4)}</strong></span>
                        </div>
                        <div className="alo-bnpl-step">
                          <span className="step-num">2</span>
                          <span>In 2 wks: <strong>{formatPrice(finalTotal / 4)}</strong></span>
                        </div>
                        <div className="alo-bnpl-step">
                          <span className="step-num">3</span>
                          <span>In 4 wks: <strong>{formatPrice(finalTotal / 4)}</strong></span>
                        </div>
                        <div className="alo-bnpl-step">
                          <span className="step-num">4</span>
                          <span>In 6 wks: <strong>{formatPrice(finalTotal / 4)}</strong></span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 text-center">Zero interest. Zero fees. Instant approval.</p>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="alo-checkout-submit-box mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="alo-btn alo-btn-primary alo-checkout-btn"
                    >
                      {isSubmitting ? (
                        <span className="alo-btn-loader" />
                      ) : (
                        <>
                          <Lock size={17} />
                          <span>COMPLETE ORDER • {formatPrice(finalTotal)}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToShipping}
                      className="alo-btn-step-back mt-2"
                    >
                      <ArrowLeft size={15} />
                      <span>Return to Shipping</span>
                    </button>

                    <div className="alo-checkout-guarantees-grid mt-4">
                      <div className="alo-checkout-guarantee-note">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span><strong>Risk-Free 30-Day Trial:</strong> Free prepaid USPS return label included with your order</span>
                      </div>
                      <div className="alo-checkout-guarantee-note">
                        <Lock size={16} className="text-blue-600" />
                        <span><strong>Stripe Level 1 PCI-DSS Security:</strong> End-to-end 256-bit encrypted card transmission</span>
                      </div>
                      <div className="alo-checkout-guarantee-note">
                        <Award size={16} className="text-amber-500" />
                        <span><strong>BBB Accredited Business:</strong> A+ Customer Trust Rating nationwide</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DESKTOP STICKY ORDER SUMMARY */}
          <div className="alo-checkout-summary-col">
            <div className="alo-summary-card">
              <div className="alo-summary-header-row">
                <h3 className="alo-summary-heading">ORDER SUMMARY ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
                <span className="alo-summary-outlet-tag">70% OFF APPLIED</span>
              </div>

              <div className="alo-summary-items">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="alo-summary-item">
                    <div className="alo-summary-item-media">
                      <img src={item.thumbnail} alt={item.name} />
                      <span className="alo-summary-item-badge">{item.quantity}</span>
                    </div>
                    <div className="alo-summary-item-desc">
                      <h4 className="alo-summary-item-title">{item.name}</h4>
                      <span className="alo-summary-item-variant">{item.color} / {item.size}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="alo-summary-item-saved">
                          70% OFF (Saved {formatPrice((item.originalPrice - item.price) * item.quantity)})
                        </span>
                      )}
                    </div>
                    <div className="alo-summary-item-price">
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="alo-summary-promo-form">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder="Discount code (try 'ALOVIP')"
                  className="alo-summary-promo-input"
                />
                <button type="submit" className="alo-summary-promo-btn">
                  APPLY
                </button>
              </form>

              {couponCode && (
                <div className="alo-summary-coupon-tag">
                  <Tag size={13} />
                  <span>{couponCode} (-{formatPrice(discountAmount)})</span>
                  <button type="button" onClick={removeCoupon}>×</button>
                </div>
              )}

              {/* Breakdown */}
              <div className="alo-summary-breakdown">
                <div className="alo-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal + discountAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="alo-summary-row discount">
                    <span>VIP Extra Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="alo-summary-row">
                  <span>
                    Shipping {formData.shippingMethod === 'express' ? '(FedEx 2-Day Air)' : '(USPS Priority)'}
                  </span>
                  <span>
                    {shippingCost === 0 && expressShippingExtra === 0
                      ? <strong className="text-green-600">FREE</strong>
                      : formatPrice(shippingCost + expressShippingExtra)}
                  </span>
                </div>
                <div className="alo-summary-row total">
                  <div>
                    <span className="alo-summary-total-label">Total</span>
                    <span className="alo-summary-currency-note">USD (All US taxes included)</span>
                  </div>
                  <span className="alo-summary-total-val">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Installment teaser under total */}
              <div className="alo-summary-installment-note">
                <span>or 4 interest-free payments of <strong>{formatPrice(finalTotal / 4)}</strong> with Klarna / Afterpay</span>
              </div>

              {/* Security Seals Card Footer */}
              <div className="alo-summary-trust-footer">
                <div className="alo-summary-seal">
                  <Award size={18} className="text-amber-500" />
                  <span>BBB A+ Rating</span>
                </div>
                <div className="alo-summary-seal">
                  <ShieldCheck size={18} className="text-blue-500" />
                  <span>Stripe Verified</span>
                </div>
                <div className="alo-summary-seal">
                  <Truck size={18} className="text-neutral-700" />
                  <span>USPS Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutView(props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
}
