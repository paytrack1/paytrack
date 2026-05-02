const express    = require('express');
const cors       = require('cors');
const crypto     = require('crypto');
const axios      = require('axios');
const app        = express();
const PORT       = process.env.PORT || 3000;

app.use('/webhook/paystack', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET_KEY     = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const API_KEY                 = process.env.API_KEY || 'flowora-dev-key';
const PAYSTACK_BASE_URL       = 'https://api.paystack.co';

const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

const validatePaystackWebhook = (req, res, next) => {
  const signature = req.headers['x-paystack-signature'];
  if (!signature) return res.status(400).json({ error: 'Missing signature' });
  const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(req.body).digest('hex');
  if (hash !== signature) return res.status(400).json({ error: 'Invalid signature' });
  req.body = JSON.parse(req.body);
  next();
};

const verifyPaystackTransaction = async (reference) => {
  try {
    const { data } = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const isVerified = data?.data?.status === 'success';
    const amount     = data?.data?.amount / 100;
    return { isVerified, amount, raw: data };
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    return { isVerified: false, amount: 0, raw: null };
  }
};

let salesStore = {};

app.get('/', (req, res) => {
  res.json({
    service:  'Flowora Backend',
    status:   'running',
    provider: 'Paystack',
    mode:     PAYSTACK_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST',
  });
});

app.post('/api/payments/initialize', requireApiKey, async (req, res) => {
  const { email, amount, saleId, callbackUrl } = req.body;
  if (!email || !amount || !saleId) return res.status(400).json({ error: 'email, amount, saleId required' });
  try {
    const { data } = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      { email, amount: Math.round(amount * 100), reference: saleId, callback_url: callbackUrl || process.env.FRONTEND_URL, metadata: { saleId } },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, authorizationUrl: data.data.authorization_url, reference: data.data.reference, accessCode: data.data.access_code });
  } catch (err) {
    console.error('Initialize error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

app.get('/api/payments/verify/:reference', requireApiKey, async (req, res) => {
  const { reference } = req.params;
  const { isVerified, amount, raw } = await verifyPaystackTransaction(reference);
  if (isVerified && salesStore[reference]) {
    salesStore[reference] = { ...salesStore[reference], synced: 1, verified: true, status: 'completed', provider: 'paystack' };
  }
  res.json({ success: isVerified, verified: isVerified, amount, reference, message: isVerified ? 'Verified by Paystack' : 'Not verified', raw });
});

app.post('/webhook/paystack', validatePaystackWebhook, async (req, res) => {
  res.sendStatus(200);
  const event = req.body;
  if (event.event === 'charge.success') {
    const { reference, amount, customer } = event.data;
    const nairaAmount = amount / 100;
    console.log(`Payment confirmed — N${nairaAmount} from ${customer?.email} ref: ${reference}`);
    salesStore[reference] = {
      ...(salesStore[reference] || {}),
      id: reference, total: nairaAmount, synced: 1, verified: true, status: 'completed', provider: 'paystack-webhook', createdAt: new Date().toISOString(),
    };
  }
});

app.post('/webhook/test', (req, res) => {
  console.log('Test webhook:', req.body);
  res.json({ received: true });
});

app.post('/api/sales/sync', requireApiKey, async (req, res) => {
  const { sales } = req.body;
  if (!Array.isArray(sales)) return res.status(400).json({ error: 'sales must be an array' });
  const results = [];
  for (const sale of sales) {
    if (!sale.id || !sale.total) { results.push({ id: sale.id, status: 'skipped', reason: 'missing id or total' }); continue; }
    let verified = sale.verified || false;
    let status   = sale.status   || 'pending';
    if (sale.reference && !verified) {
      const { isVerified } = await verifyPaystackTransaction(sale.reference);
      if (isVerified) { verified = true; status = 'completed'; }
    }
    salesStore[sale.id] = { ...sale, verified, status, synced: 1, syncedAt: new Date().toISOString(), provider: sale.reference ? 'paystack' : 'cash' };
    results.push({ id: sale.id, status: 'synced', verified });
  }
  res.json({ success: true, results });
});

app.get('/api/sales', requireApiKey, (req, res) => {
  res.json({ success: true, count: Object.keys(salesStore).length, sales: Object.values(salesStore) });
});

app.get('/api/sales/reference/:ref', requireApiKey, async (req, res) => {
  const { ref } = req.params;
  const sale    = salesStore[ref];
  if (sale) return res.json({ success: true, sale });
  const { isVerified, amount } = await verifyPaystackTransaction(ref);
  res.json({ success: isVerified, verified: isVerified, amount, reference: ref, message: isVerified ? 'Verified by Paystack' : 'Not found on Paystack' });
});

app.listen(PORT, () => {
  console.log(`\nFlowora Backend running on port ${PORT}`);
  console.log(`Provider: Paystack`);
  console.log(`Mode: ${PAYSTACK_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}\n`);
});
