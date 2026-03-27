require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// ── Sale Schema ──
const SaleSchema = new mongoose.Schema({
  saleId:        { type: String, required: true, unique: true },
  itemName:      { type: String, default: 'General Sale' },
  total:         { type: Number, required: true },
  paymentMethod: { type: String },
  reference:     { type: String, default: null },
  status:        { type: String, default: 'pending' },
  synced:        { type: Number, default: 0 },
  verified:      { type: Boolean, default: false },
  provider:      { type: String, default: null },
  createdAt:     { type: String },
  syncedAt:      { type: Date, default: Date.now },
});
const Sale = mongoose.model('Sale', SaleSchema);

// ── Interswitch Credentials ──
const ISW_CLIENT_ID     = process.env.INTERSWITCH_CLIENT_ID;
const ISW_CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET;
const MERCHANT_CODE     = process.env.MERCHANT_CODE || 'MX180495';
const ISW_BASE_URL      = process.env.ISW_BASE_URL || 'https://qa.interswitchng.com';
const ISW_AUTH          = Buffer.from(`${ISW_CLIENT_ID}:${ISW_CLIENT_SECRET}`).toString('base64');

// ── Get Interswitch Access Token ──
const getAccessToken = async () => {
  const response = await axios.post(
    `${ISW_BASE_URL}/passport/oauth/token`,
    'grant_type=client_credentials&scope=profile',
    {
      headers: {
        Authorization: `Basic ${ISW_AUTH}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data.access_token;
};

// ── Verify Transaction via Interswitch Lookup ──
const verifyTransaction = async (reference, amount) => {
  try {
    const token = await getAccessToken();
    const amountInKobo = Math.round(amount * 100);

    const response = await axios.get(
      `${ISW_BASE_URL}/collections/api/v1/gettransaction.json`,
      {
        params: {
          merchantcode: MERCHANT_CODE,
          transactionreference: reference,
          amount: amountInKobo,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    console.log('🔍 Interswitch lookup response:', JSON.stringify(data));

    // ResponseCode "00" = success/verified
    return data.ResponseCode === '00';

  } catch (err) {
    console.error('❌ Interswitch lookup error:', err.response?.data || err.message);
    return null; // null = API error, not a failed transaction
  }
};

// ────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────

// ── Health Check ──
app.get('/', (req, res) => {
  res.json({
    status: '✅ PayTrack Lite Backend Running',
    mode: ISW_BASE_URL.includes('qa') ? 'TEST MODE' : 'LIVE MODE',
    merchant: MERCHANT_CODE,
    database: mongoose.connection.readyState === 1 ? '✅ MongoDB Connected' : '❌ MongoDB Disconnected',
  });
});

// ────────────────────────────────────────────
// WEBHOOK — Interswitch sends this automatically
// when a real transaction completes (live mode)
// ────────────────────────────────────────────
app.post('/webhook/interswitch', async (req, res) => {
  // Always respond 200 fast so Interswitch doesn't retry
  res.status(200).json({ received: true });

  try {
    const event = req.body;
    console.log('📩 Webhook received:', JSON.stringify(event));

    const isCompleted =
      event.event === 'TRANSACTION.COMPLETED' ||
      event.event === 'TRANSACTION.UPDATED' ||
      event.ResponseCode === '00';

    const reference =
      event.data?.transactionReference ||
      event.data?.retrievalReferenceNumber ||
      event.transactionReference ||
      event.retrievalReferenceNumber;

    if (isCompleted && reference) {
      const sale = await Sale.findOne({ reference });
      if (sale) {
        await Sale.findOneAndUpdate(
          { reference },
          { synced: 1, verified: true, status: 'completed', provider: 'interswitch-webhook' }
        );
        console.log(`✅ Sale ${sale.saleId} verified via webhook`);
      } else {
        console.log(`⚠️ Webhook received but no sale found for reference: ${reference}`);
      }
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
  }
});

// ────────────────────────────────────────────
// TEST WEBHOOK — Use this to demo verification
// during presentations (test mode only)
// POST /webhook/test  body: { reference, amount }
// ────────────────────────────────────────────
app.post('/webhook/test', async (req, res) => {
  try {
    const { reference, amount } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'reference is required' });
    }

    const sale = await Sale.findOne({ reference });

    if (!sale) {
      return res.status(404).json({ error: 'No sale found with that reference' });
    }

    await Sale.findOneAndUpdate(
      { reference },
      { synced: 1, verified: true, status: 'completed', provider: 'test-webhook' }
    );

    console.log(`🧪 TEST webhook: Sale ${sale.saleId} marked as verified`);

    return res.json({
      success: true,
      message: `✅ Sale ${sale.saleId} verified via test webhook`,
      saleId: sale.saleId,
      reference,
    });

  } catch (err) {
    console.error('❌ Test webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
// SYNC — Frontend sends sales here to verify
// ────────────────────────────────────────────
app.post('/api/sales/sync', async (req, res) => {
  const { sales } = req.body;

  if (!sales || sales.length === 0) {
    return res.status(400).json({ error: 'No sales provided' });
  }

  const results = [];

  for (const sale of sales) {

    // ── CASH: always verified, no API needed ──
    if (sale.paymentMethod === 'cash') {
      try {
        await Sale.findOneAndUpdate(
          { saleId: sale.id },
          {
            saleId: sale.id,
            itemName: sale.itemName || 'General Sale',
            total: sale.total,
            paymentMethod: 'cash',
            reference: null,
            status: 'completed',
            synced: 1,
            verified: true,
            provider: 'cash',
            createdAt: sale.createdAt,
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('❌ DB error (cash):', dbErr.message);
      }
      results.push({ id: sale.id, verified: true, provider: 'cash', message: 'Cash verified ✅' });
      continue;
    }

    // ── NO REFERENCE: cannot verify ──
    if (!sale.reference) {
      try {
        await Sale.findOneAndUpdate(
          { saleId: sale.id },
          {
            saleId: sale.id,
            itemName: sale.itemName || 'General Sale',
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            reference: null,
            status: 'pending',
            synced: 0,
            verified: false,
            provider: null,
            createdAt: sale.createdAt,
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('❌ DB error (no ref):', dbErr.message);
      }
      results.push({ id: sale.id, verified: false, provider: null, message: 'No reference provided ⚠️' });
      continue;
    }

    // ── TRANSFER / POS: call Interswitch lookup ──
    const isVerified = await verifyTransaction(sale.reference, sale.total);

    try {
      await Sale.findOneAndUpdate(
        { saleId: sale.id },
        {
          saleId: sale.id,
          itemName: sale.itemName || 'General Sale',
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          reference: sale.reference,
          status: isVerified === true ? 'completed' : 'pending',
          synced: isVerified !== null ? 1 : 0,
          verified: isVerified === true,
          provider: 'interswitch',
          createdAt: sale.createdAt,
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.error('❌ DB error:', dbErr.message);
    }

    results.push({
      id: sale.id,
      verified: isVerified === true,
      provider: 'interswitch',
      message:
        isVerified === true  ? '✅ Verified by Interswitch' :
        isVerified === false ? '❌ Not found on Interswitch' :
                               '⚠️ API error — will retry via webhook',
    });
  }

  return res.json(results);
});

// ── Get all sales ──
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ syncedAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// ── Get single sale by reference ──
app.get('/api/sales/reference/:ref', async (req, res) => {
  try {
    const sale = await Sale.findOne({ reference: req.params.ref });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PayTrack Lite Backend running on port ${PORT}`);
  console.log(`🔑 Client ID: ${ISW_CLIENT_ID?.slice(0, 8)}...`);
  console.log(`🏪 Merchant Code: ${MERCHANT_CODE}`);
  console.log(`🌍 Mode: ${ISW_BASE_URL.includes('qa') ? 'TEST MODE' : 'LIVE MODE'}`);
});