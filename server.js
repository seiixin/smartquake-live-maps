const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// CORS — allow all origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Route proxy — avoids CORS when browser calls the Laravel API ──────────────
app.get('/proxy/route', async (req, res) => {
  const { from_lat, from_lng, to_lat, to_lng, token } = req.query;
  const apiBase = req.query.api || 'https://qgis.gghsoftware.tech/api';
  const url = `${apiBase}/route?from_lat=${from_lat}&from_lng=${from_lng}&to_lat=${to_lat}&to_lng=${to_lng}`;

  try {
    const headers = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error('Route proxy error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SmartQuake live map → http://localhost:${PORT}`);
});
