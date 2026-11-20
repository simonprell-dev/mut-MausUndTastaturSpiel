'use strict';
// Kleiner Webserver ohne Abhängigkeiten (für Railway & lokal):
// liefert das Spiel aus, speichert Feedback und Zähler, zeigt beides auf /admin.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
// Auf Railway ein Volume anhängen, sonst gehen die Daten bei jedem Deploy verloren.
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'klammi-data.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const MAX_FEEDBACK = 5000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};
// Nur diese Dateien werden ausgeliefert.
const ALLOWED = /^\/(index\.html|admin\.html|js\/[\w.-]+\.js)$/;

// ---------------------------------------------------------------- Speicher
let db = { stats: { starts: 0, finishes: 0 }, feedback: [] };
try {
  const loaded = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (loaded && loaded.stats && Array.isArray(loaded.feedback)) db = loaded;
} catch (e) { /* noch keine Daten */ }
let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(db));
      fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
    } catch (e) { console.error('Speichern fehlgeschlagen:', e.message); }
  }, 300);
}

// ---------------------------------------------------------------- Helfer
function send(res, code, body, type) {
  const isObj = typeof body === 'object';
  res.writeHead(code, {
    'Content-Type': type || (isObj ? TYPES['.json'] : 'text/plain; charset=utf-8'),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(isObj ? JSON.stringify(body) : body);
}
function readJson(req, cb) {
  let data = '', done = false;
  req.on('data', chunk => {
    if (done) return;
    data += chunk;
    if (data.length > 2000) { done = true; cb(null); req.destroy(); }
  });
  req.on('end', () => {
    if (done) return;
    done = true;
    try { cb(JSON.parse(data)); } catch (e) { cb(null); }
  });
}
// Einfache Bremse pro Absender. Die Adresse wird nur kurz im Arbeitsspeicher gehalten, nie gespeichert.
const hits = new Map();
function limited(req, key, max) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const k = key + '|' + ip, now = Date.now();
  const list = (hits.get(k) || []).filter(t => now - t < 60000);
  list.push(now);
  hits.set(k, list);
  return list.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, l] of hits) if (!l.some(t => now - t < 60000)) hits.delete(k); }, 60000).unref();

function isAdmin(req) {
  if (!ADMIN_PASSWORD) return false;
  const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------- Routen
function api(req, res, url) {
  if (url === '/api/event' && req.method === 'POST') {
    if (limited(req, 'event', 30)) return send(res, 429, { error: 'zu viele Anfragen' });
    return readJson(req, body => {
      if (body && body.type === 'start') db.stats.starts++;
      else if (body && body.type === 'finish') db.stats.finishes++;
      else return send(res, 400, { error: 'ungültig' });
      save();
      send(res, 200, { ok: true });
    });
  }
  if (url === '/api/feedback' && req.method === 'POST') {
    if (limited(req, 'feedback', 5)) return send(res, 429, { error: 'zu viele Anfragen' });
    return readJson(req, body => {
      const stars = body && Number(body.stars);
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) return send(res, 400, { error: 'ungültig' });
      const text = String(body.text || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 200);
      const playTime = Math.max(0, Math.min(86400, Math.round(Number(body.playTime) || 0)));
      db.feedback.push({ id: crypto.randomBytes(6).toString('hex'), time: new Date().toISOString(), stars, text, playTime });
      if (db.feedback.length > MAX_FEEDBACK) db.feedback.splice(0, db.feedback.length - MAX_FEEDBACK);
      save();
      send(res, 200, { ok: true });
    });
  }
  if (url.startsWith('/api/admin/')) {
    if (!ADMIN_PASSWORD) return send(res, 503, { error: 'ADMIN_PASSWORD ist auf dem Server nicht gesetzt.' });
    if (limited(req, 'admin', 20)) return send(res, 429, { error: 'zu viele Anfragen' });
    if (!isAdmin(req)) return setTimeout(() => send(res, 401, { error: 'falsches Passwort' }), 500);
    if (url === '/api/admin/data' && req.method === 'GET') return send(res, 200, db);
    const m = /^\/api\/admin\/feedback\/([0-9a-f]{12})$/.exec(url);
    if (m && req.method === 'DELETE') {
      db.feedback = db.feedback.filter(f => f.id !== m[1]);
      save();
      return send(res, 200, { ok: true });
    }
  }
  send(res, 404, { error: 'nicht gefunden' });
}

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { url = '/'; }
  if (url === '/health') return send(res, 200, 'ok');
  if (url.startsWith('/api/')) return api(req, res, url);
  if (url === '/') url = '/index.html';
  if (url === '/admin') url = '/admin.html';
  if ((req.method !== 'GET' && req.method !== 'HEAD') || !ALLOWED.test(url)) return send(res, 404, 'Nicht gefunden');
  fs.readFile(path.join(ROOT, url), (err, data) => {
    if (err) return send(res, 404, 'Nicht gefunden');
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(url)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('KLAMMI.exe läuft auf Port ' + PORT + ' – Daten in ' + DATA_FILE);
  if (!ADMIN_PASSWORD) console.log('Hinweis: ADMIN_PASSWORD ist nicht gesetzt, /admin ist gesperrt.');
});
