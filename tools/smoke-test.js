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

for (const f of ['engine', 'art', 'scenes1', 'scenes2', 'scenes3'])
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), { filename: f + '.js' });

const run = vm.runInThisContext(`(async function (opts) {
  const tick = () => new Promise(r => setImmediate(r));
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
      return { ok: errors === 0, time: G.t, errors, maxOpen };
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

(async () => {
  const mischief = process.argv.includes('--mischief');
  console.log('Durchlauf' + (mischief ? ' (mit Fehlklicks)' : '') + ':');
  const res = await run({ mischief });
  console.log(res);
  process.exit(res.ok ? 0 : 1);
})();
