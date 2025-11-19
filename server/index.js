require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const path = require('path');
const { ensureDatabaseAndTable } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

let pool;

(async () => {
  pool = await ensureDatabaseAndTable();

  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully!');
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }

})();

// Query helper
async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true, version: '1.0' }));

// Create
app.post('/api/links', async (req, res) => {
  try {
    let { url, code } = req.body;
    if (!url || !validUrl.isWebUri(url)) return res.status(400).json({ error: 'Invalid URL' });

    code = code?.trim() || null;
    const codeRegex = /^[A-Za-z0-9]{6,8}$/;
    if (code && !codeRegex.test(code)) return res.status(400).json({ error: 'Code must be 6-8 alphanumeric characters' });

    if (code) {
      const exists = await query('SELECT id FROM links WHERE code=$1', [code]);
      if (exists.rowCount > 0) return res.status(409).json({ error: 'Code already exists' });
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let tries = 0;
      do {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const exists = await query('SELECT id FROM links WHERE code=$1', [code]);
        if (exists.rowCount === 0) break;
        tries++;
        if (tries > 10) return res.status(500).json({ error: 'Failed to generate unique code' });
      } while (true);
    }

    const result = await query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, clicks, createdAt',
      [code, url]
    );

    const created = result.rows[0];
    res.status(201).json({
      ...created,
      shortUrl: `${BASE_URL}/${created.code}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all
app.get('/api/links', async (_req, res) => {
  try {
    const result = await query(
      'SELECT code, url, clicks, lastclicked AS "lastClicked", createdat AS "createdAt" FROM links ORDER BY createdat DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats
app.get('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await query('SELECT code, url, clicks, lastClicked, createdAt FROM links WHERE code=$1', [code]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
app.delete('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await query('DELETE FROM links WHERE code=$1 RETURNING id', [code]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect
app.get('/:code', async (req, res, next) => {
  const { code } = req.params;
  if (code === 'api' || code === 'healthz') return next();

  try {
    const result = await query('SELECT url FROM links WHERE code=$1', [code]);
    if (result.rowCount === 0) return res.status(404).send('Not found');

    const url = result.rows[0].url;
    await query('UPDATE links SET clicks = clicks + 1, lastClicked = NOW() WHERE code=$1', [code]);
    res.redirect(url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/healthz')) return next();
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on ${BASE_URL}`));
