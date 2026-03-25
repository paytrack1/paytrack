require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const ISW_CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID;
const ISW_CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET;
const ISW_BASE_URL = 'https://sandbox.interswitchng.com';
const ISW_AUTH = Buffer.from(`${ISW_CLIENT_ID}:${ISW_CLIENT_SECRET}`).toString('base64');

app.get('/', (req, res) => {
  res.json({ status: 'PayTrack Lite Backend Running', mode: 'test' });
});

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

app.post('/api/sales/sync', async (req, res) => {
  const { sales } = req.body;
  if (!sales || sales.length === 0) {
    return res.status(400).json({ error: 'No sales provided' });
  }

  const results = [];
  for (const sale of sales) {
    if (sale.paymentMethod === 'cash') {
      results.push({ id: sale.id, verified: true, provider: 'cash' });
      continue;
    }
    if (!sale.reference) {
      results.push({ id: sale.id, verified: false, provider: null });
      continue;
    }
    try {
      const token = await getAccessToken();
      const response = await axios.get(
        `${ISW_BASE_URL}/api/v1/purchases`,
        {
          params: {
            amount: sale.total * 100,
            retrievalReferenceNumber: sale.reference,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const isVerified = response.data.responseCode === '00';
      results.push({ id: sale.id, verified: isVerified, provider: 'interswitch' });
    } catch (err) {
      console.error(`Failed for sale ${sale.id}:`, err.message);
      results.push({ id: sale.id, verified: false, provider: 'interswitch' });
    }
  }
  return res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PayTrack Lite Backend running on port ${PORT}`);
});
