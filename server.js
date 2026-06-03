require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { parseSMS } = require('./sms-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'mm_secret_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminMM2026';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function genRef() {
  return 'MM' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2,4).toUpperCase();
}
function adminAuth(req, res, next) {
  const pwd = req.headers['x-admin-password'] || req.query.pwd;
  if (pwd !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Non autorisé' });
  next();
}

app.get('/', (req, res) => {
  res.json({ message: 'MatulMada Server miasa!', version: '1.0.0', status: 'ok' });
});

app.post('/api/orders', (req, res) => {
  const { client_phone, client_account, operator, type, amount_usd, amount_mga, rate } = req.body;
  if (!client_phone || !amount_usd || !operator || !type)
    return res.status(400).json({ error: 'Champs manquants' });
  const ref = genRef();
  db.createOrder({ ref, client_phone, client_account: client_account||'', operator, type, amount_usd: parseFloat(amount_usd), amount_mga: parseInt(amount_mga), rate: parseInt(rate) });
  res.json({ success: true, ref, message: 'Ordre créé' });
});

app.get('/api/orders/:ref', (req, res) => {
  const order = db.getOrderByRef(req.params.ref);
  if (!order) return res.status(404).json({ error: 'Ordre introuvable' });
  res.json(order);
});

app.post('/webhook/sms', (req, res) => {
  const secret = req.headers['x-secret'] || req.headers['authorization']?.replace('Bearer ','') || req.body.secret;
  if (secret !== WEBHOOK_SECRET) return res.status(403).json({ error: 'Secret invalide' });

  const from = req.body.from || req.body.data?.from || '';
  const message = req.body.message || req.body.content || req.body.data?.content || '';
  if (!message) return res.status(400).json({ error: 'Message vide' });

  console.log('SMS tonga:', from, message.substring(0,60));

  const parsed = parseSMS(message, from);
  if (!parsed) {
    db.logSMS(from, message, false, null);
    return res.json({ success: false, message: 'SMS tsy recognized' });
  }

  const order = db.findPendingOrderByAmount(parsed.amount);
  if (!order) {
    db.logSMS(from, message, true, null);
    return res.json({ success: false, message: 'Tsy misy ordre mitovy', parsed });
  }

  db.updateOrder(order.id, {
    status: 'success',
    sms_received: parsed.raw,
    sms_amount: parsed.amount,
    sms_sender: parsed.senderPhone,
    validated_at: new Date().toISOString()
  });
  db.logSMS(from, message, true, order.ref);
  console.log('✅ Ordre validé:', order.ref);
  res.json({ success: true, message: 'Ordre validé!', ref: order.ref });
});

app.get('/admin/stats', adminAuth, (req, res) => res.json(db.getStats()));
app.get('/admin/orders', adminAuth, (req, res) => res.json(db.getOrders(req.query.status||null)));
app.post('/admin/orders/:id/validate', adminAuth, (req, res) => {
  const r = db.updateOrder(req.params.id, { status:'success', validated_at: new Date().toISOString() });
  if (!r) return res.status(404).json({ error: 'Introuvable' });
  res.json({ success: true });
});
app.post('/admin/orders/:id/reject', adminAuth, (req, res) => {
  const r = db.updateOrder(req.params.id, { status:'rejected' });
  if (!r) return res.status(404).json({ error: 'Introuvable' });
  res.json({ success: true });
});
app.get('/admin/sms-log', adminAuth, (req, res) => res.json(db.getSMSLog()));

app.listen(PORT, () => {
  console.log(`✅ MatulMada Server miasa — port ${PORT}`);
});

// KEEPALIVE — tsy hatory ny Render
const https = require('https');
setInterval(() => {
  https.get('https://payment-0w70.onrender.com', (res) => {
    console.log('Keepalive ping:', res.statusCode);
  }).on('error', (e) => {
    console.log('Keepalive error:', e.message);
  });
}, 14 * 60 * 1000); // isaky ny 14 minitra
