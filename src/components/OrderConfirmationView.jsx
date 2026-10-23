import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, Package, Truck, ArrowRight, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function OrderConfirmationView({ order, onContinueShopping }) {
  const { formatPrice } = useCart();

  const orderId = order?.orderId || 'ALO-892410';
  const customer = order?.customer || {
    firstName: 'Valued',
    lastName: 'Customer',
    email: 'client@example.com',
    address: '100 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90028',
    country: 'United States'
  };

  const items = order?.items || [];
  const total = order?.total || 138.00;

  return (
    <div className="alo-confirmation-root">
      <div className="alo-confirmation-container">
        {/* Celebration Header */}
        <div className="alo-confirmation-header">
          <div className="alo-conf-check-circle">
            <CheckCircle size={44} className="text-white" />
          </div>
          <span className="alo-conf-pill">ORDER CONFIRMED</span>
          <h1 className="alo-conf-title">THANK YOU, {customer.firstName.toUpperCase()}!</h1>
          <p className="alo-conf-sub">
            Your order <strong>#{orderId}</strong> has been received and is being prepared for express dispatch.
          </p>
          <div className="alo-conf-email-note">
            <Mail size={15} />
            <span>We sent your order receipt & tracking link to <strong>{customer.email}</strong></span>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="alo-conf-timeline-card">
          <h3 className="alo-timeline-heading">DELIVERY STATUS & TIMELINE</h3>
          <div className="alo-timeline-steps">
            <div className="alo-timeline-step completed">
              <div className="alo-step-dot" />
              <div className="alo-step-content">
                <strong>Order Placed</strong>
                <span>Payment confirmed & authorized</span>
              </div>
            </div>
            <div className="alo-timeline-step active">
              <div className="alo-step-dot" />
              <div className="alo-step-content">
                <strong>Preparing Shipment</strong>
                <span>Fulfillment center packing with Alo signature box</span>
              </div>
            </div>
            <div className="alo-timeline-step">
              <div className="alo-step-dot" />
              <div className="alo-step-content">
                <strong>Express Transit</strong>
                <span>USPS Priority tracking number will be emailed & sent via SMS</span>
              </div>
            </div>
            <div className="alo-timeline-step">
              <div className="alo-step-dot" />
              <div className="alo-step-content">
                <strong>Delivered</strong>
                <span>Estimated arrival in 3-5 business days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="alo-conf-details-grid">
          <div className="alo-conf-items-card">
            <h3 className="alo-conf-card-title">ITEMS IN THIS ORDER</h3>
            <div className="alo-conf-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="alo-conf-item">
                  <img src={item.thumbnail} alt={item.name} className="alo-conf-item-img" />
                  <div className="alo-conf-item-info">
                    <h4>{item.name}</h4>
                    <span className="alo-conf-item-variant">
                      Color: {item.color} · Size: {item.size} · Qty: {item.quantity}
                    </span>
                    <span className="alo-conf-item-price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="alo-conf-breakdown">
              <div className="alo-conf-row">
                <span>Total Paid</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="alo-conf-shipping-card">
            <h3 className="alo-conf-card-title">SHIPPING & CONTACT</h3>
            <div className="alo-shipping-info-block">
              <div className="alo-info-line">
                <MapPin size={16} />
                <div>
                  <strong>{customer.firstName} {customer.lastName}</strong>
                  <p>{customer.address} {customer.apartment}</p>
                  <p>{customer.city}, {customer.state} {customer.zip}</p>
                  <p>{customer.country}</p>
                </div>
              </div>

              <div className="alo-info-line mt-3">
                <Truck size={16} />
                <div>
                  <strong>USPS Priority Tracked Mail</strong>
                  <p>Tracking Code: {order?.trackingCode || 'USPS94001118995625478'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onContinueShopping}
              className="alo-btn alo-btn-primary alo-conf-continue-btn"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
