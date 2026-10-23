import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Safely initialize Stripe without crashing the server if the key is missing
let stripeInstance = null;

function getStripe() {
  const currentKey = process.env.STRIPE_SECRET_KEY;
  if (!currentKey || typeof currentKey !== 'string' || currentKey.trim() === '') {
    return null;
  }
  if (!stripeInstance) {
    try {
      stripeInstance = new Stripe(currentKey.trim());
      console.log('✅ [Stripe] Client initialized successfully with Secret Key');
    } catch (err) {
      console.error('❌ [Stripe] Initialization error:', err.message);
      return null;
    }
  }
  return stripeInstance;
}

// Initial probe on boot
const bootStripe = getStripe();
if (!bootStripe) {
  console.warn('⚠️  [Stripe] STRIPE_SECRET_KEY is not defined in environment variables.');
  console.warn('⚠️  [Stripe] The store will run, but live checkout requires STRIPE_SECRET_KEY in Heroku Config Vars.');
}

app.use(cors());
app.use(express.json());

// Serve static frontend assets from Vite build in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
}

// Return publishable key for client
app.get('/api/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_51Ty2SGGopel0gXFPBhQZMg81j3JM9Cz1cDQqG7mhqat8TN35IjDKcR26HLwHx6VdXGBeEEmgd8rJ51Kbz240s1x700HK0IE0Ym',
  });
});

// Health check endpoint (always succeeds so Heroku router stays healthy)
app.get('/api/health', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(200).json({
      status: 'ok',
      server: 'running',
      stripe: 'unconfigured (STRIPE_SECRET_KEY missing in Heroku Config Vars)',
      timestamp: new Date().toISOString()
    });
  }
  try {
    await stripe.balance.retrieve();
    res.json({
      status: 'ok',
      server: 'running',
      stripe: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(200).json({
      status: 'degraded',
      server: 'running',
      stripe_error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create Payment Intent (supports Credit Card, Apple Pay, Google Pay, Klarna, Afterpay)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error('[Stripe Error] Payment intent attempted but STRIPE_SECRET_KEY is missing');
      return res.status(500).json({
        error: 'STRIPE_SECRET_KEY is not configured on Heroku. Please add STRIPE_SECRET_KEY in your Heroku Dashboard (Settings -> Config Vars).'
      });
    }

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
    const stripe = getStripe();
    if (paymentIntentId && stripe) {
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
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(indexPath);
  }
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alo Yoga Outlet Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #000; color: #fff; }
          .card { max-width: 500px; padding: 32px; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; text-align: center; }
          h1 { letter-spacing: 4px; font-weight: 800; font-size: 24px; text-transform: uppercase; margin-bottom: 12px; }
          p { color: #888; line-height: 1.5; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>ALO YOGA</h1>
          <p>Application is booting up. Assets will be available shortly.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alo Yoga US Store running on port ${PORT}`);
  console.log(`📡 Health check available at: http://0.0.0.0:${PORT}/api/health`);
});
