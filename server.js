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
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};
// Nur diese Dateien werden ausgeliefert.
const ALLOWED = /^\/(favicon\.svg|favicon\.png|apple-touch-icon\.png|index\.html|admin\.html|impressum\.html|js\/[\w.-]+\.js|audio\/[\w-]+\.mp3)$/;

// ---------------------------------------------------------------- Speicher
let db = { stats: { starts: 0, finishes: 0 }, feedback: [] };
try {
  const loaded = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (loaded && loaded.stats && Array.isArray(loaded.feedback)) db = loaded;
} catch (e) { /* noch keine Daten */ }
// Nutzung: wie weit die Spieler kommen (pro Level) und was pro Tag passiert
db.stats.levels = db.stats.levels || {};
db.stats.days = db.stats.days || {};
const LEVELS = ['l1', 'l2', 'lf', 'l3', 'lw', 'lr', 'l4', 'ls', 'l5', 'l6', 'l7', 'end'];
const KEEP_DAYS = 120;
function today() {
  const key = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }); // JJJJ-MM-TT
  if (!db.stats.days[key]) {
    db.stats.days[key] = { starts: 0, finishes: 0, feedback: 0 };
    const keys = Object.keys(db.stats.days).sort();
    while (keys.length > KEEP_DAYS) delete db.stats.days[keys.shift()];
  }
  return db.stats.days[key];
}
// Liegt der Speicher auf einem Railway-Volume? Sonst sind die Daten nach dem nächsten Deploy weg.
const ON_RAILWAY = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const PERSISTENT = !ON_RAILWAY || !!(process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR);
let saveTimer = null;
// Zustand des Speichers, wird im Admin-Bereich angezeigt
const storage = { savedAt: '', error: '' };
try {
  // Probeschreiben beim Start: zeigt sofort, ob das Volume beschreibbar ist
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, '.schreibtest'), 'ok');
  fs.unlinkSync(path.join(DATA_DIR, '.schreibtest'));
} catch (e) { storage.error = e.message; console.error('Speicher nicht beschreibbar:', e.message); }
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(db));
      fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
      storage.savedAt = new Date().toISOString(); storage.error = '';
    } catch (e) { storage.error = e.message; console.error('Speichern fehlgeschlagen:', e.message); }
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
    if (limited(req, 'event', 60)) return send(res, 429, { error: 'zu viele Anfragen' });
    return readJson(req, body => {
      if (body && body.type === 'start') { db.stats.starts++; today().starts++; }
      else if (body && body.type === 'finish') { db.stats.finishes++; today().finishes++; }
      else if (body && body.type === 'level' && LEVELS.includes(body.level)) db.stats.levels[body.level] = (db.stats.levels[body.level] || 0) + 1;
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
      today().feedback++;
      if (db.feedback.length > MAX_FEEDBACK) db.feedback.splice(0, db.feedback.length - MAX_FEEDBACK);
      save();
      send(res, 200, { ok: true });
    });
  }
  if (url.startsWith('/api/admin/')) {
    if (!ADMIN_PASSWORD) return send(res, 503, { error: 'ADMIN_PASSWORD ist auf dem Server nicht gesetzt.' });
    if (limited(req, 'admin', 20)) return send(res, 429, { error: 'zu viele Anfragen' });
    if (!isAdmin(req)) return setTimeout(() => send(res, 401, { error: 'falsches Passwort' }), 500);
    if (url === '/api/admin/data' && req.method === 'GET')
      return send(res, 200, { stats: db.stats, feedback: db.feedback, levelOrder: LEVELS, storage: {
        persistent: PERSISTENT, onRailway: ON_RAILWAY,
        volume: process.env.RAILWAY_VOLUME_MOUNT_PATH || '', volumeName: process.env.RAILWAY_VOLUME_NAME || '',
        savedAt: storage.savedAt, error: storage.error
      } });
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
  if (url === '/favicon.ico') url = '/favicon.png';
  if (url === '/admin') url = '/admin.html';
  if (url === '/impressum') url = '/impressum.html';
  if ((req.method !== 'GET' && req.method !== 'HEAD') || !ALLOWED.test(url)) return send(res, 404, 'Nicht gefunden');
  fs.readFile(path.join(ROOT, url), (err, data) => {
    if (err) return send(res, 404, 'Nicht gefunden');
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(url)] || 'application/octet-stream',
      // Aufnahmen tragen einen Inhalts-Hash im Namen und dürfen lange im Cache bleiben
      'Cache-Control': url.startsWith('/audio/') ? 'public, max-age=2592000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('KLAMMI.exe läuft auf Port ' + PORT + ' – Daten in ' + DATA_FILE);
  if (!ADMIN_PASSWORD) console.log('Hinweis: ADMIN_PASSWORD ist nicht gesetzt, /admin ist gesperrt.');
  if (!PERSISTENT) console.log('Hinweis: Kein Railway-Volume gefunden. Feedback und Zähler gehen beim nächsten Deploy verloren.');
});
