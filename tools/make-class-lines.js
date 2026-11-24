'use strict';
// Erzeugt js/class-lines.js für den Klassenzimmer-Modus:
//   VOICE_DUR   – Dauer jeder Sprachaufnahme (Sekunden)
//   CLASS_INTRO – für jedes Level die Erklärung am Anfang: welche Zeilen Klammi sagt und wann
// Das Lehrergerät spielt diese Zeilen zeitgleich zu den Sprechblasen auf den Schülergeräten ab.
// Nach neuen Aufnahmen (tools/make-voice.py) einmal ausführen: node tools/make-class-lines.js  (braucht ffprobe)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : noop), set: (t, k, v) => { t[k] = v; return true; } });
const mkCanvas = () => ({ width: 0, height: 0, style: {}, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 360 }) });
global.window = global;
global.document = { createElement: mkCanvas, getElementById: mkCanvas, documentElement: {} };
global.addEventListener = noop;
global.innerWidth = 1280; global.innerHeight = 720; global.devicePixelRatio = 1;
global.requestAnimationFrame = noop;

const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8'), { filename: f + '.js' });
load('voice-lines');
const lines = vm.runInThisContext('VOICE_LINES');

// 1. Dauer jeder Aufnahme
const dur = {};
for (const [key, file] of Object.entries(lines)) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(ROOT, 'audio', file)]).toString();
  dur[key] = Math.round(parseFloat(out) * 100) / 100;
}
global.VOICE_DUR_DATA = dur;
vm.runInThisContext('var VOICE_DUR = VOICE_DUR_DATA;');

// 2. Jede Szene ohne Eingaben laufen lassen, bis die Erklärung vorbei ist, und mitschreiben
for (const f of ['engine', 'art', 'scenes1', 'scenes2', 'scenes3']) load(f);
const run = vm.runInThisContext(`(async function (steps) {
  const tick = () => new Promise(r => setImmediate(r));
  G.init();
  G.klass = { lock: true, ended: false };     // gleicher Sprechblasen-Takt wie auf den Schülergeräten
  const out = {};
  const say = K.say.bind(K);
  let rec = null, t0 = 0;
  K.say = (text, o = {}) => {
    if (rec && o.block !== false) rec.push({ w: o.who === 'virus' ? 'v' : 'k', t: norm(o.voice || text), at: Math.round((G.t - t0) * 100) / 100 });
    return say(text, o);
  };
  for (const name of steps) {
    rec = out[name] = [];
    t0 = G.t; G.go(name);
    const first = G.scene.phase;
    for (let f = 0; f < 60 * 150; f++) {
      const over = name === 'boot' ? G.scene.ready : (G.scene.phase !== first && !(K.line && K.line.block));
      if (over) break;
      G.frameStep(1 / 60);
      await tick();
    }
  }
  return out;
})`);

(async () => {
  const steps = ['boot', 'l1', 'l2', 'lf', 'l3', 'lw', 'lr', 'l4', 'ls', 'l5', 'l6', 'l7', 'end'];
  const intro = await run(steps);
  let n = 0;
  for (const name of steps) {
    for (const l of intro[name]) {
      const key = l.w + '|' + l.t;
      l.f = lines[key] || '';
      l.d = dur[key] || 0;
      if (!l.f) console.warn('Keine Aufnahme für: ' + l.t);
      n++;
    }
    console.log(name.padEnd(5), intro[name].length + ' Zeilen, Erklärung dauert ' + (intro[name].length ? (intro[name][intro[name].length - 1].at + intro[name][intro[name].length - 1].d).toFixed(1) : '0') + ' s');
  }
  const js = "'use strict';\n// Automatisch erzeugt von tools/make-class-lines.js – nicht von Hand ändern.\n" +
    'const VOICE_DUR = ' + JSON.stringify(dur, null, 1) + ';\n' +
    'const CLASS_INTRO = ' + JSON.stringify(intro, null, 1) + ';\n';
  fs.writeFileSync(path.join(ROOT, 'js', 'class-lines.js'), js);
  console.log(n + ' Erklär-Zeilen, ' + Object.keys(dur).length + ' Aufnahmen -> js/class-lines.js');
  process.exit(0);
})();
