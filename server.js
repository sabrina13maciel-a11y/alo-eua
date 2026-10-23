import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("WARNING: STRIPE_SECRET_KEY is not defined in environment!");
}
const stripe = new Stripe(stripeSecretKey);

app.use(cors());
app.use(express.json());

// Serve static frontend assets from Vite build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Return publishable key for client
app.get('/api/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await stripe.balance.retrieve();
    res.json({ status: 'ok', stripe: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Create Payment Intent (supports Credit Card, Apple Pay, Google Pay, Klarna, Afterpay)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customer, items, shippingMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Alo Yoga Outlet Order - ${customer?.email || 'Customer'}`,
      receipt_email: customer?.email || undefined,
      shipping: customer?.address ? {
        name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Valued Customer',
        phone: customer?.phone || undefined,
        address: {
          line1: customer?.address,
          line2: customer?.apartment || undefined,
          city: customer?.city,
          state: customer?.state,
          postal_code: customer?.zip,
          country: 'US',
        }
      } : undefined,
      metadata: {
        customer_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        items_count: items?.length || 0,
        shipping_method: shippingMethod || 'standard',
        store: 'Alo Yoga US Outlet'
      }
    });

    console.log(`[Stripe] Created PaymentIntent ${paymentIntent.id} for $${amount}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('[Stripe Error] create-payment-intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Order & Return Tracking
app.post('/api/confirm-order', async (req, res) => {
  try {
    const { paymentIntentId, customer, items, total, shippingMethod } = req.body;

    let paymentStatus = 'authorized';
    if (paymentIntentId) {
      try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        paymentStatus = intent.status;
      } catch (e) {
        console.warn('Could not retrieve payment intent:', e.message);
      }
    }

    const orderId = `ALO-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingCode = `USPS94001${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const orderRecord = {
      orderId,
      trackingCode,
      paymentStatus,
      paymentIntentId,
      customer,
      items,
      total,
      shippingMethod,
      createdAt: new Date().toISOString()
    };

    console.log(`[Order Confirmed] #${orderId} - Tracking: ${trackingCode} - Status: ${paymentStatus}`);

    res.json({
      success: true,
      ...orderRecord
    });
  } catch (error) {
    console.error('[Order Error] confirm-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Client SPA routing: send index.html for all non-API GET requests
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Alo Yoga US Store listening on http://localhost:${PORT}`);
});
