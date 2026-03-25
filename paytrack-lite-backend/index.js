require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ─── MONGODB CONNECTION ───────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// ─── SALE SCHEMA ─────────────────────────────────────
const SaleSchema = new mongoose.Schema({
  saleId:        { type: String, required: true, unique: true },
  itemName:      { type: String, default: 'General Sale' },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'transfer', 'pos'] },
  reference:     { type: String, default: null },
  status:        { type: String, default: 'completed' },
  synced:        { type: Number, default: 0 },
  verified:      { type: Boolean, default: false },
  provider:      { type: String, default: null },
  createdAt:     { type: String },
  syncedAt:      { type: Date, default: Date.now },
});

const Sale = mongoose.model('Sale', SaleSchema);

// ─── INTERSWITCH CONFIG ───────────────────────────────
const ISW_CLIENT_ID     = process.env.INTERSWITCH_CLIENT_ID;
const ISW_CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET;
const ISW_BASE_URL = 'https://qa.interswitchng.com';
const ISW_AUTH          = Buffer.from(`${ISW_CLIENT_ID}:${ISW_CLIENT_SECRET}`).toString('base64');

// ─── GET INTERSWITCH ACCESS TOKEN ────────────────────
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

// ─── HEALTH CHECK ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ PayTrack Lite Backend Running',
    mode: 'test',
    database: mongoose.connection.readyState === 1 ? '✅ MongoDB Connected' : '❌ MongoDB Disconnected',
  });
});

// ─── MAIN ROUTE: SYNC + VERIFY SALES ─────────────────
app.post('/api/sales/sync', async (req, res) => {
  const { sales } = req.body;

  if (!sales || sales.length === 0) {
    return res.status(400).json({ error: 'No sales provided' });
  }

  const results = [];

  for (const sale of sales) {

    // ── CASH: no verification needed ──
    if (sale.paymentMethod === 'cash') {
      try {
        await Sale.findOneAndUpdate(
          { saleId: sale.id },
          {
            saleId:        sale.id,
            itemName:      sale.itemName || 'General Sale',
            total:         sale.total,
            paymentMethod: sale.paymentMethod,
            reference:     null,
            status:        sale.status,
            synced:        1,
            verified:      true,
            provider:      'cash',
            createdAt:     sale.createdAt,
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('DB save error (cash):', dbErr.message);
      }

      results.push({ id: sale.id, verified: true, provider: 'cash' });
      continue;
    }

    // ── NO REFERENCE: cannot verify ──
    if (!sale.reference) {
      results.push({ id: sale.id, verified: false, provider: null });
      continue;
    }

    // ── TRANSFER / POS: verify with Interswitch ──
    try {
      const token = await getAccessToken();

      const response = await axios.get(
        `${ISW_BASE_URL}/api/v1/purchases`,
        {
          params: {
            amount: sale.total * 100, // convert to kobo
            retrievalReferenceNumber: sale.reference,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const isVerified = response.data.responseCode === '00';

      // Save verified sale to MongoDB
      await Sale.findOneAndUpdate(
        { saleId: sale.id },
        {
          saleId:        sale.id,
          itemName:      sale.itemName || 'General Sale',
          total:         sale.total,
          paymentMethod: sale.paymentMethod,
          reference:     sale.reference,
          status:        sale.status,
          synced:        1,
          verified:      isVerified,
          provider:      'interswitch',
          createdAt:     sale.createdAt,
        },
        { upsert: true, new: true }
      );

      results.push({
        id:       sale.id,
        verified: isVerified,
        provider: 'interswitch',
        message:  isVerified ? 'Transaction verified ✅' : 'Fake or failed transaction ❌',
      });

    } catch (err) {
      console.error(`Interswitch error for ${sale.id}:`, err.message);

      // Save as unverified to MongoDB
      try {
        await Sale.findOneAndUpdate(
          { saleId: sale.id },
          {
            saleId:        sale.id,
            itemName:      sale.itemName || 'General Sale',
            total:         sale.total,
            paymentMethod: sale.paymentMethod,
            reference:     sale.reference,
            status:        sale.status,
            synced:        0,
            verified:      false,
            provider:      'interswitch',
            createdAt:     sale.createdAt,
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('DB save error:', dbErr.message);
      }

      results.push({
        id:       sale.id,
        verified: false,
        provider: 'interswitch',
        message:  'Verification unavailable — will retry',
      });
    }
  }

  return res.json(results);
});

// ─── GET ALL SALES (for admin/reporting) ─────────────
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ syncedAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// ─── START SERVER ─────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PayTrack Lite Backend running on port ${PORT}`);
  console.log(`🔑 Interswitch Client ID: ${ISW_CLIENT_ID?.slice(0, 8)}...`);
});