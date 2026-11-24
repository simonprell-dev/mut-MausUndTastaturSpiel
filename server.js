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
const ALLOWED = /^\/(favicon\.svg|favicon\.png|apple-touch-icon\.png|index\.html|admin\.html|impressum\.html|klasse\.html|js\/[\w.-]+\.js|audio\/[\w-]+\.mp3)$/;

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

// ---------------------------------------------------------------- Impressum
// Die Angaben aus js/config.js werden schon auf dem Server ins HTML geschrieben. So stehen sie
// auch für Leser ohne JavaScript da (Suchmaschinen, Vorlese- und Abruf-Programme).
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderImpressum(html) {
  let site;
  try { site = require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'config.js'), 'utf8') + ';SITE'); }
  catch (e) { return html; }
  let missing = false;
  html = html.replace(/<span data-f="(\w+)"( data-optional)?><\/span>/g, (m, key, optional) => {
    const v = String(site[key] || '').trim();
    if (v) return '<span data-f="' + key + '"' + (optional || '') + '>' + esc(v) + '</span>';
    if (optional) return m;
    missing = true;
    return '<span data-f="' + key + '" class="missing">fehlt noch</span>';
  });
  if (!String(site.phone || '').trim()) html = html.replace(/\s*<span id="phoneRow">[\s\S]*?<\/span><\/span>/, '');
  if (!String(site.vatId || '').trim()) html = html.replace(/\s*<p id="vatRow">[\s\S]*?<\/p>/, '');
  if (/^https?:\/\//.test(site.url || '')) html = html.replace('<a id="url" rel="noopener"></a>', '<a id="url" rel="noopener" href="' + esc(site.url) + '">' + esc(site.url) + '</a>');
  else html = html.replace(/\s*<p id="urlRow">[\s\S]*?<\/p>/, '');
  // Der Warnhinweis gehört nur ins HTML, wenn wirklich etwas fehlt
  html = missing ? html.replace('<div id="warn" class="hidden">', '<div id="warn">') : html.replace(/\s*<div id="warn"[\s\S]*?<\/div>/, '');
  return html;
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
// ---------------------------------------------------------------- Klassenzimmer
// Eine Klasse lebt nur im Arbeitsspeicher: nichts davon wird gespeichert, und nach dem Ende
// (oder spätestens nach einigen Stunden) ist alles weg. Schüler bekommen automatisch einen
// Tiernamen, es werden keine echten Namen erfasst.
const classes = new Map();
const CLASS_LAST_STEP = 12; // Schritte: boot, l1, l2, lf, l3, lw, lr, l4, ls, l5, l6, l7, end
const ANIMALS = ['Fuchs', 'Igel', 'Dachs', 'Eule', 'Otter', 'Luchs', 'Biber', 'Wal', 'Pinguin', 'Koala', 'Panda', 'Tiger', 'Löwe', 'Zebra',
  'Giraffe', 'Elefant', 'Papagei', 'Delfin', 'Krake', 'Robbe', 'Hase', 'Maus', 'Bär', 'Wolf', 'Adler', 'Falke', 'Schwan', 'Storch', 'Frosch',
  'Gecko', 'Lama', 'Esel', 'Pony', 'Ziege', 'Schaf', 'Hamster', 'Marder', 'Specht', 'Möwe', 'Krebs', 'Hummel', 'Libelle', 'Seestern', 'Waschbär', 'Eisbär'];
const token = () => crypto.randomBytes(12).toString('hex');
const same = (a, b) => typeof a === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
function newClassCode() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne leicht verwechselbare Zeichen
  let code;
  do { code = ''; for (let i = 0; i < 4; i++) code += abc[crypto.randomInt(abc.length)]; } while (classes.has(code));
  return code;
}
// Neuer Schritt: Die Liste der gesprochenen Zeilen beginnt von vorn.
function classStep(c, step, now) {
  c.step = step; c.stepAt = now; c.advanceAt = 0;
  c.said = new Map(); c.released = new Set(); c.lines = [];
}
// Zählt, wer den aktuellen Schritt geschafft hat, und schaltet bei Bedarf automatisch weiter.
function classCount(c, now) {
  const active = [...c.students.values()].filter(s => now - s.seen < 20000);
  const done = active.filter(s => s.at > c.step || (s.at === c.step && s.done)).length;
  const reached = c.step >= 0 && c.step < CLASS_LAST_STEP && active.length > 0 && done / active.length >= c.threshold / 100;
  if (c.auto && reached) {
    if (!c.advanceAt) c.advanceAt = now + 5000;       // kurze Vorwarnzeit, die Lehrkraft kann noch abbrechen
    else if (now >= c.advanceAt) classStep(c, c.step + 1, now);
  } else c.advanceAt = 0;
  return { active: active.length, done };
}
setInterval(() => {
  const now = Date.now();
  for (const [code, c] of classes) if (now - c.teacherSeen > 90 * 60000 || now - c.created > 10 * 3600000) classes.delete(code);
}, 60000).unref();

function classApi(req, res, url) {
  readJson(req, body => {
    if (!body) return send(res, 400, { error: 'ungültig' });
    const now = Date.now();
    if (url === '/api/class/create') {
      if (limited(req, 'class-create', 10) || classes.size >= 300) return send(res, 429, { error: 'Im Moment können keine weiteren Klassen gestartet werden.' });
      const c = { code: newClassCode(), key: token(), created: now, teacherSeen: now, step: -1, stepAt: now, advanceAt: 0, auto: true, threshold: 80, lock: true, talk: 'third', seq: 0, said: new Map(), released: new Set(), lines: [], students: new Map() };
      classes.set(c.code, c);
      return send(res, 200, { code: c.code, key: c.key });
    }
    const c = classes.get(String(body.code || '').toUpperCase());
    if (!c) return send(res, 404, { error: 'Diese Klasse gibt es nicht (mehr).' });

    if (url === '/api/class/join') {
      if (limited(req, 'class-join', 240)) return send(res, 429, { error: 'zu viele Anfragen' });
      let s = c.students.get(String(body.id || ''));
      if (!s || !same(body.key, s.key)) {
        if (c.students.size >= 45) return send(res, 409, { error: 'Die Klasse ist voll.' });
        const used = new Set([...c.students.values()].map(x => x.name));
        let name = ANIMALS.find(a => !used.has(a));
        if (!name) name = 'Gast ' + (c.students.size + 1);
        s = { id: crypto.randomBytes(5).toString('hex'), key: token(), name, at: -1, done: false, idle: 0, seen: now };
        c.students.set(s.id, s);
      }
      s.seen = now;
      return send(res, 200, { id: s.id, key: s.key, name: s.name, step: c.step, lock: c.lock, at: s.at });
    }
    if (url === '/api/class/beat') {
      const s = c.students.get(String(body.id || ''));
      if (!s || !same(body.key, s.key)) return send(res, 403, { error: 'nicht angemeldet' });
      s.seen = now;
      const at = Number(body.at);
      if (Number.isInteger(at) && at >= -1 && at <= CLASS_LAST_STEP) s.at = at;
      s.done = body.done === true;
      s.idle = Math.max(0, Math.min(3600, Math.round(Number(body.idle) || 0)));
      const n = classCount(c, now);
      // Welche Sätze Klammi auf diesem Gerät gerade sagt. Haben genug Kinder denselben Satz erreicht,
      // wird er für das Lehrergerät freigegeben (jeder Satz höchstens einmal pro Level).
      if (Array.isArray(body.said) && s.at === c.step) {
        const need = c.talk === 'first' ? 1 : Math.max(1, Math.ceil(n.active / 3));
        for (const f of body.said.slice(0, 8)) {
          if (typeof f !== 'string' || !/^[kv]-[0-9a-f]{12}\.mp3$/.test(f) || c.released.has(f)) continue;
          if (!c.said.has(f)) { if (c.said.size >= 200) continue; c.said.set(f, new Set()); }
          c.said.get(f).add(s.id);
          if (c.said.get(f).size >= need) { c.released.add(f); c.lines.push({ seq: ++c.seq, f }); }
        }
      }
      return send(res, 200, { step: c.step, active: n.active, done: n.done, lock: c.lock, name: s.name });
    }
    if (url === '/api/class/teacher') {
      if (!same(body.key, c.key)) return send(res, 403, { error: 'kein Zugriff' });
      c.teacherSeen = now;
      if (Number.isFinite(Number(body.threshold)) && body.threshold !== null && body.threshold !== undefined)
        c.threshold = Math.max(10, Math.min(100, Math.round(Number(body.threshold))));
      if (typeof body.auto === 'boolean') c.auto = body.auto;
      if (typeof body.lock === 'boolean') c.lock = body.lock;
      if (body.talk === 'third' || body.talk === 'first') c.talk = body.talk;
      if (typeof body.remove === 'string') c.students.delete(body.remove);
      if (body.action === 'next' && c.step < CLASS_LAST_STEP) classStep(c, c.step + 1, now);
      if (body.action === 'end') { classes.delete(c.code); return send(res, 200, { ended: true }); }
      const n = classCount(c, now);
      return send(res, 200, {
        code: c.code, step: c.step, sinceStep: now - c.stepAt, auto: c.auto, threshold: c.threshold, lock: c.lock,
        advanceIn: c.advanceAt ? Math.max(0, c.advanceAt - now) : 0, active: n.active, done: n.done, talk: c.talk, lines: c.lines,
        students: [...c.students.values()].map(s => ({ id: s.id, name: s.name, at: s.at, done: s.done, idle: s.idle, ago: now - s.seen }))
      });
    }
    send(res, 404, { error: 'nicht gefunden' });
  });
}

function api(req, res, url) {
  if (url.startsWith('/api/class/') && req.method === 'POST') return classApi(req, res, url);
  if (url === '/api/event' && req.method === 'POST') {
    if (limited(req, 'event', 240)) return send(res, 429, { error: 'zu viele Anfragen' });
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
    if (limited(req, 'feedback', 40)) return send(res, 429, { error: 'zu viele Anfragen' });
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
  if (url === '/klasse') url = '/klasse.html';
  // Kurzer Beitritts-Link für Schüler: /k/CODE
  const join = /^\/k\/([A-Za-z0-9]{4,6})\/?$/.exec(url);
  if (join) { res.writeHead(302, { Location: '/?klasse=' + join[1].toUpperCase(), 'Cache-Control': 'no-store' }); return res.end(); }
  if ((req.method !== 'GET' && req.method !== 'HEAD') || !ALLOWED.test(url)) return send(res, 404, 'Nicht gefunden');
  fs.readFile(path.join(ROOT, url), (err, data) => {
    if (err) return send(res, 404, 'Nicht gefunden');
    if (url === '/impressum.html') data = Buffer.from(renderImpressum(data.toString('utf8')));
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
