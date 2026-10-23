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
  Tag,
  AlertCircle,
  Award
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
      fontSize: '13px',
      color: '#111111',
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
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

  // Initialize Apple Pay / Google Pay PaymentRequest
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
    if (!inputCoupon) return;
    applyCoupon(inputCoupon);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip || formData.zip.replace(/\D/g, '').length < 5) {
      newErrors.zip = 'Valid 5-digit US ZIP code required';
    }
    if (formData.paymentMethod === 'card' && !formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStripeError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
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

    // Process Credit Card with Stripe
    if (!stripe || !elements) {
      setStripeError('Stripe has not initialized yet. Please wait a moment.');
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
      // Step 1: Create live Stripe PaymentIntent via secure backend
      const { clientSecret, paymentIntentId } = await createStripePaymentIntent({
        total: finalTotal,
        customer: formData,
        items: cart,
        shippingMethod: formData.shippingMethod
      });

      // Step 2: Confirm card payment with Stripe client
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

      // Step 3: Record order & advance funnel
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

  const triggerApplePay = () => {
    if (paymentRequest) {
      paymentRequest.show();
    } else {
      setFormData((prev) => ({ ...prev, paymentMethod: 'card' }));
      const cardEl = document.getElementById('alo-card-section');
      if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="alo-checkout-root">
      {/* Top Minimal Security Header */}
      <header className="alo-checkout-header">
        <div className="alo-checkout-header-container">
          <button onClick={onBackToStore} className="alo-back-link">
            <ArrowLeft size={16} />
            <span>Return to Shopping Bag</span>
          </button>

          <div className="alo-checkout-logo">
            <svg viewBox="0 0 71 48" width="56" height="38" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M22.826 19.591h5.771v27.43h-5.77v-1.928A13.973 13.973 0 0114.298 48C6.414 48 0 41.409 0 33.306c0-8.103 6.414-14.694 14.299-14.694 3.193 0 6.145 1.082 8.527 2.907zm-.145 13.715c0-4.861-3.76-8.816-8.382-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.76 8.816 8.382 8.816s8.382-3.954 8.382-8.816zM39.434 47.02h-5.906V0h5.906zm2.969-13.714c0-8.103 6.414-14.694 14.298-14.694C64.586 18.612 71 25.203 71 33.306 71 41.41 64.586 48 56.701 48c-7.884 0-14.298-6.59-14.298-14.694zm22.451 0c0-4.861-3.76-8.816-8.153-8.816-4.623 0-8.382 3.955-8.382 8.816 0 4.862 3.759 8.816 8.382 8.816 4.393 0 8.153-3.954 8.153-8.816z"
              />
            </svg>
          </div>

          <div className="alo-checkout-secure-pill">
            <Lock size={13} />
            <span>Stripe 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Trust Credibility Banner */}
      <div className="alo-checkout-trust-strip">
        <div className="alo-checkout-trust-container">
          <div className="alo-trust-item">
            <Award size={15} className="text-amber-500" />
            <span>BBB Accredited Business <strong>A+ Rating</strong></span>
          </div>
          <span className="sep hidden-mobile">·</span>
          <div className="alo-trust-item">
            <Truck size={15} />
            <span>Ships from <strong>Los Angeles, CA</strong> via USPS Priority</span>
          </div>
          <span className="sep hidden-mobile">·</span>
          <div className="alo-trust-item">
            <ShieldCheck size={15} className="text-green-600" />
            <span>30-Day Risk-Free Money Back Guarantee</span>
          </div>
        </div>
      </div>

      <div className="alo-checkout-container">
        <div className="alo-checkout-grid">
          {/* Left Column: US E-Commerce Checkout Form */}
          <div className="alo-checkout-form-col">
            {/* Express Checkout Options (Apple Pay, Google Pay, Shop Pay, PayPal) */}
            <div className="alo-express-checkout-box">
              <span className="alo-express-title">EXPRESS CHECKOUT</span>
              

              <div className="alo-express-buttons-row">
                <button
                  type="button"
                  onClick={triggerApplePay}
                  className="alo-express-btn applepay"
                  title="Apple Pay via Stripe"
                >
                  Pay
                </button>
                <button
                  type="button"
                  onClick={triggerApplePay}
                  className="alo-express-btn gpay"
                  title="Google Pay via Stripe"
                >
                  G Pay
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))}
                  className="alo-express-btn shoppay"
                  title="Shop Pay"
                >
                  <span className="font-bold">shop</span><span className="bg-purple-600 text-white rounded px-1 ml-1 text-xs">Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'paypal' }))}
                  className="alo-express-btn paypal"
                  title="PayPal"
                >
                  <i>Pay</i><em>Pal</em>
                </button>
              </div>
              <div className="alo-divider-with-text">
                <span>OR PAY WITH CARD BELOW</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="alo-checkout-main-form" noValidate>
              {/* Section 1: Customer Contact Information */}
              <div className="alo-form-section">
                <div className="alo-section-header-row">
                  <h3 className="alo-form-heading">1. CONTACT INFORMATION</h3>
                  <span className="alo-login-prompt">Already an Alo VIP? <a href="#login" onClick={(e) => e.preventDefault()}>Log in</a></span>
                </div>

                <div className="alo-input-group">
                  <label>Email Address (for order confirmation & USPS tracking) *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah.miller@gmail.com"
                    autoComplete="email"
                    className={`alo-text-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <span className="alo-input-error">{errors.email}</span>}
                </div>

                <div className="alo-input-group mt-3">
                  <label>Mobile Phone (for automated USPS delivery SMS alerts)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 234-5678"
                    autoComplete="tel"
                    className="alo-text-input"
                  />
                  <span className="alo-input-help">We'll text you when your package is out for delivery.</span>
                </div>

                <label className="alo-checkbox-label mt-2">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleChange}
                  />
                  <span>Email me with news and exclusive Alo VIP flash sale drops</span>
                </label>
              </div>

              {/* Section 2: US Shipping Address */}
              <div className="alo-form-section">
                <h3 className="alo-form-heading">2. SHIPPING ADDRESS</h3>

                <div className="alo-input-group mb-3">
                  <label>Country / Region *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="alo-text-input alo-select-input"
                  >
                    <option value="United States">United States (Domestic USPS Priority)</option>
                    <option value="Canada">Canada (USPS Priority International)</option>
                    <option value="United Kingdom">United Kingdom (Tracked Express)</option>
                    <option value="Australia">Australia (Tracked Express)</option>
                  </select>
                </div>

                <div className="alo-form-row two-col">
                  <div className="alo-input-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Jessica"
                      autoComplete="given-name"
                      className={`alo-text-input ${errors.firstName ? 'error' : ''}`}
                    />
                    {errors.firstName && <span className="alo-input-error">{errors.firstName}</span>}
                  </div>
                  <div className="alo-input-group">
                    <label>Last Name *</label>
                    <input
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
                  <label>Street Address *</label>
                  <input
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
                  <label>Apartment, Suite, Unit, Floor (Optional)</label>
                  <input
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
                    <label>City *</label>
                    <input
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
                    <label>State *</label>
                    <select
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
                    <label>ZIP Code *</label>
                    <input
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

              {/* Section 3: US Domestic Shipping Options */}
              <div className="alo-form-section">
                <h3 className="alo-form-heading">3. SHIPPING METHOD</h3>
                <div className="alo-shipping-options">
                  <label
                    className={`alo-shipping-choice ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleChange}
                    />
                    <div className="alo-shipping-label-wrap">
                      <div className="alo-shipping-name">
                        <div className="flex items-center gap-2">
                          <strong>USPS Priority Tracked Mail</strong>
                          <span className="alo-usps-tag">USPS</span>
                        </div>
                        <span>3-5 Business Days · Dispatched from Los Angeles, CA with live tracking</span>
                      </div>
                      <span className="alo-shipping-price">
                        {shippingCost === 0 ? <strong className="text-green-600">FREE</strong> : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`alo-shipping-choice ${formData.shippingMethod === 'express' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleChange}
                    />
                    <div className="alo-shipping-label-wrap">
                      <div className="alo-shipping-name">
                        <div className="flex items-center gap-2">
                          <strong>FedEx / UPS 2-Day Air Express</strong>
                          <span className="alo-fedex-tag">2-DAY AIR</span>
                        </div>
                        <span>2 Business Days · Priority warehouse dispatch within 24h</span>
                      </div>
                      <span className="alo-shipping-price">
                        +{formatPrice(12.95)}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 4: Secure US Payment Options with Stripe Integration */}
              <div className="alo-form-section" id="alo-card-section">
                <h3 className="alo-form-heading">4. PAYMENT METHOD</h3>
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
                      <span className="alo-card-sublabel">Powered by Stripe:</span>
                      <div className="alo-card-badges-row">
                        <span className="alo-card-pill">VISA</span>
                        <span className="alo-card-pill">MASTERCARD</span>
                        <span className="alo-card-pill">AMEX</span>
                        <span className="alo-card-pill">DISCOVER</span>
                        <span className="alo-card-pill bg-black text-white">APPLE PAY</span>
                        <span className="alo-card-pill">GOOGLE PAY</span>
                      </div>
                    </div>

                    <div className="alo-input-group mt-3">
                      <label>Card Number *</label>
                      <div className="alo-stripe-input-wrapper">
                        <CardNumberElement options={stripeElementStyles} />
                        <Lock size={14} className="alo-card-lock-icon" />
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

                    {stripeError && (
                      <div className="alo-stripe-error-box mt-3">
                        <AlertCircle size={15} />
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
              </div>

              {/* Submit CTA */}
              <div className="alo-checkout-submit-box">
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
                      <span>PAY {formatPrice(finalTotal)} & PLACE ORDER</span>
                    </>
                  )}
                </button>

                <div className="alo-checkout-guarantees-grid">
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

          {/* Right Column: Sticky Order Summary */}
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
                    USPS Priority Shipping
                    {formData.shippingMethod === 'express' && ' (FedEx 2-Day)'}
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
