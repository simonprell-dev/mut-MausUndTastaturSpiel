'use strict';
// Prüft den Klassenzimmer-Modus am laufenden Server (Ablauf ohne Browser):
//   node server.js   (in einem zweiten Fenster)   ->   node tools/class-test.js [http://localhost:3000]
const base = process.argv[2] || 'http://localhost:3000';
const post = (u, b) => fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  .then(async r => ({ status: r.status, body: await r.json() }));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, info) => { if (!ok) failed++; console.log((ok ? '  ok   ' : '  FEHLER ') + name + (info ? '  ' + info : '')); };

(async () => {
  const cls = (await post('/api/class/create', {})).body;
  check('Klasse angelegt', /^[A-Z0-9]{4}$/.test(cls.code), cls.code);
  const T = extra => post('/api/class/teacher', Object.assign({ code: cls.code, key: cls.key }, extra || {}));

  const kids = [];
  for (let i = 0; i < 10; i++) kids.push((await post('/api/class/join', { code: cls.code.toLowerCase() })).body);
  check('10 Geräte beigetreten, alle mit eigenem Tiernamen', new Set(kids.map(k => k.name)).size === 10, kids.slice(0, 4).map(k => k.name).join(', ') + ' …');
  const again = (await post('/api/class/join', { code: cls.code, id: kids[0].id, key: kids[0].key })).body;
  check('Neu laden behält den Platz', again.id === kids[0].id && again.name === kids[0].name);
  const beat = (k, at, done, idle) => post('/api/class/beat', { code: cls.code, id: k.id, key: k.key, at, done, idle: idle || 0 });

  check('falscher Lehrer-Schlüssel wird abgelehnt', (await T({ key: 'x'.repeat(24) })).status === 403);
  check('falscher Schüler-Schlüssel wird abgelehnt', (await post('/api/class/beat', { code: cls.code, id: kids[1].id, key: 'y'.repeat(24), at: 5, done: true })).status === 403);
  check('unbekannte Klasse', (await post('/api/class/join', { code: 'ZZZZ' })).status === 404);

  let s = (await T()).body;
  check('vor dem Start: Schritt -1, 10 verbunden', s.step === -1 && s.active === 10);
  check('Kinder dürfen noch nicht spielen', (await beat(kids[0], -1, false)).body.step === -1);

  s = (await T({ action: 'next', threshold: 80 })).body;
  check('Lehrkraft startet: Schritt 0', s.step === 0 && s.threshold === 80);

  for (const k of kids) await beat(k, 0, false);
  for (let i = 0; i < 7; i++) await beat(kids[i], 0, true);
  s = (await T()).body;
  check('7 von 10 fertig: noch kein Weiterschalten', s.done === 7 && s.advanceIn === 0 && s.step === 0);

  await beat(kids[7], 0, true);
  s = (await T()).body;
  check('8 von 10 fertig (80 %): Countdown läuft', s.done === 8 && s.advanceIn > 0, 'noch ' + s.advanceIn + ' ms');
  s = (await T({ auto: false })).body;
  check('„Noch warten“ hält die Automatik an', s.advanceIn === 0 && s.auto === false);
  s = (await T({ auto: true })).body;
  await sleep(5400);
  s = (await T()).body;
  check('nach dem Countdown automatisch Schritt 1', s.step === 1);
  check('Kind erfährt die Freigabe', (await beat(kids[0], 1, false)).body.step === 1);

  await beat(kids[8], 0, false, 70);
  s = (await T()).body;
  const slow = s.students.find(k => k.id === kids[8].id);
  check('Nachzügler ist sichtbar (früheres Level, 70 s ohne Fortschritt)', slow.at === 0 && slow.idle === 70 && !slow.done);

  s = (await T({ threshold: 100 })).body;
  for (const k of kids.slice(0, 9)) await beat(k, 1, true);
  s = (await T()).body;
  check('Schwelle 100 %: 9 von 10 reichen nicht', s.threshold === 100 && s.advanceIn === 0 && s.step === 1);
  s = (await T({ action: 'next' })).body;
  check('Lehrkraft schaltet von Hand weiter', s.step === 2);

  s = (await T({ remove: kids[9].id })).body;
  check('Gerät entfernen', s.students.length === 9);

  check('Klasse beenden', (await T({ action: 'end' })).body.ended === true);
  check('danach gibt es sie nicht mehr', (await beat(kids[0], 2, false)).status === 404);

  console.log(failed ? failed + ' Prüfung(en) fehlgeschlagen' : 'Alles in Ordnung');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
