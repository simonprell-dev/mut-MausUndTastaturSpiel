'use strict';
// Spielt das ganze Spiel ohne Browser einmal durch (Bot folgt den hint()-Angaben der Szenen).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : noop), set: (t, k, v) => { t[k] = v; return true; } });
const mkCanvas = () => ({ width: 0, height: 0, style: {}, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 360 }) });
global.window = global;
global.document = { createElement: mkCanvas, getElementById: mkCanvas, documentElement: {} };
global.addEventListener = noop;
global.innerWidth = 1280; global.innerHeight = 720; global.devicePixelRatio = 1;
global.requestAnimationFrame = noop;

for (const f of ['voice-lines', 'engine', 'art', 'scenes1', 'scenes2', 'scenes3'])
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), { filename: f + '.js' });

// Jede gesprochene Zeile braucht eine Aufnahme in audio/ (sonst: python tools/make-voice.py)
global.missingVoice = [];
vm.runInThisContext(`{
  const file = Voice.file.bind(Voice);
  Voice.speak = (text, who) => {
    const f = file(text, who);
    if (!f || !require('fs').existsSync(require('path').join(${JSON.stringify(path.join(__dirname, '..', 'audio'))}, f))) missingVoice.push(text);
    return false;
  };
}`);
global.require = require;

const run = vm.runInThisContext(`(async function (opts) {
  // Im Klassenzimmer wartet das Spiel auf den Server: dann in Echtzeit weiterlaufen statt Bilder zu verheizen
  const tick = () => new Promise(r => (G.klass && !G.klass.ended && (G.klass.waiting || G.sceneName === 'title') ? setTimeout(r, 25) : setImmediate(r)));
  const DT = 1 / 60;
  let errors = 0;
  const origErr = console.error; console.error = (...a) => { errors++; origErr(...a); };
  G.init();
  let last = '', nextAct = 0, drag = null, dbl = 0, mischief = opts.mischief ? 7 : 0, maxOpen = 0;
  const m = G.mouse;
  const click = (x, y) => { m.x = x; m.y = y; m.pressed = true; m.down = true; };
  for (let f = 0; f < 60 * 60 * 25; f++) {
    if (G.sceneName !== last) { last = G.sceneName; console.log('  ' + (G.t.toFixed(1) + 's').padStart(8) + '  -> ' + last); }
    if (G.sceneName === 'end' && G.scene.phase === 'cert') {
      console.error = origErr;
      return { ok: errors === 0 && missingVoice.length === 0, time: G.t, errors, maxOpen, missingVoice };
    }
    // Eingaben des Bots
    if (m.down && !drag) { m.down = false; m.released = true; }
    G.held = {};
    const h = G.scene.hint && G.scene.hint();
    if (G.sceneName === 'l6') maxOpen = Math.max(maxOpen, G.scene.wins.length);
    if (K.line && K.line.block) { if (G.t >= nextAct) { click(630, 30); nextAct = G.t + 0.5; } }
    else if (drag) {
      drag.t += DT;
      const p = Math.min(1, drag.t / 0.4);
      m.x = drag.x1 + (drag.x2 - drag.x1) * p; m.y = drag.y1 + (drag.y2 - drag.y1) * p;
      if (p >= 1) { m.down = false; m.released = true; drag = null; nextAct = G.t + 0.4; }
    } else if (h && h.type === 'keys') { G.held[h.hold] = true; if (h.press) G.keysPressed.push(h.press); }
    else if (dbl && G.t >= dbl) { dbl = 0; click(m.x, m.y); nextAct = G.t + 0.4; }
    else if (h && G.t >= nextAct) {
      nextAct = G.t + 0.3;
      if (G.sceneName === 'l6' && mischief > 0 && G.scene.phase === 'play' && G.scene.wins.length) {
        // absichtlich falsch klicken, um Eskalation und Stapel zu testen
        mischief--;
        const w = G.scene.wins[G.scene.wins.length - 1], b = G.scene.btns(w).find(b => b.act === 'retry').rect;
        click(b.x + 5, b.y + 5); nextAct = G.t + 1.2;
      } else if (G.sceneName === 'l6' && opts.mischief && G.scene.phase === 'final' && !G.scene.fooled) {
        const w = G.scene.wins[G.scene.wins.length - 1], b = G.scene.btns(w)[1].rect;
        click(b.x + 5, b.y + 5); nextAct = G.t + 1.5;
      }
      else if (h.type === 'click') click(h.x, h.y);
      else if (h.type === 'hover') { m.x = h.x; m.y = h.y; }
      else if (h.type === 'wheel') m.wheel += h.d * 100;
      else if (h.type === 'rclick') { m.x = h.x; m.y = h.y; m.rpressed = true; }
      else if (h.type === 'dbl') { click(h.x, h.y); dbl = G.t + 0.2; }
      else if (h.type === 'drag') { m.x = h.x1; m.y = h.y1; m.pressed = true; m.down = true; drag = Object.assign({ t: 0 }, h); }
      else if (h.type === 'key') G.keysPressed.push(h.key);
    }
    G.frameStep(DT);
    await tick();
  }
  console.error = origErr;
  return { ok: false, time: G.t, errors, stuck: G.sceneName + '/' + (G.scene && G.scene.phase), maxOpen };
})`);

// Klassenzimmer-Durchlauf: node tools/smoke-test.js --class=http://localhost:3000  (Server muss laufen)
// Der Bot spielt als Schülergerät, eine simulierte Lehrkraft startet die Klasse, danach schaltet die Automatik weiter.
async function joinClass(base) {
  const post = (u, b) => fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
  const cls = await post('/api/class/create', {});
  const store = {};
  global.sessionStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  global.location = { search: '?klasse=' + cls.code, protocol: 'http:', hash: '', origin: base, pathname: '/' };
  const realFetch = fetch;
  global.fetch = (u, o) => realFetch(String(u).startsWith('/') ? base + u : u, o);
  for (const f of ['class-lines', 'classroom'])
    vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), { filename: f + '.js' });
  const teacher = extra => post('/api/class/teacher', Object.assign({ code: cls.code, key: cls.key }, extra || {}));
  const started = setInterval(async () => {
    const s = await teacher();
    if (s.step < 0 && s.active > 0) { await teacher({ action: 'next' }); console.log('  Lehrkraft startet Klasse ' + cls.code); }
  }, 500);
  return { teacher, stop: () => clearInterval(started) };
}

(async () => {
  const mischief = process.argv.includes('--mischief');
  const classBase = (process.argv.find(a => a.startsWith('--class=')) || '').slice(8);
  console.log('Durchlauf' + (mischief ? ' (mit Fehlklicks)' : '') + (classBase ? ' (Klassenzimmer)' : '') + ':');
  const cls = classBase ? await joinClass(classBase) : null;
  const res = await run({ mischief });
  if (cls) {
    // noch ein Bild rechnen und dem Gerät Zeit für die letzte Meldung geben
    vm.runInThisContext('G.frameStep(1 / 60)');
    await new Promise(r => setTimeout(r, 2500));
    const s = await cls.teacher();
    cls.stop();
    res.klasse = { step: s.step, student: s.students.map(k => k.name + ': Schritt ' + k.at + (k.done ? ' fertig' : '')) };
    res.ok = res.ok && s.step === 12 && s.students[0].at === 12 && s.students[0].done;
    await cls.teacher({ action: 'end' });
  }
  console.log(res);
  process.exit(res.ok ? 0 : 1);
})();
