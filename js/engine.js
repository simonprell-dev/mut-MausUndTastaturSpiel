'use strict';
// KLAMMI.exe – Engine: Canvas, Eingabe, Pixel-Schrift, UI, Ton, Sprache

const C = {
  bg: '#17191C', win: '#DEDBD0', title: '#272D48', text: '#151515',
  green: '#A8F18D', orange: '#F8A945', dark: '#BD6B29',
  white: '#FFFFFF', shade: '#8E8B82', red: '#D8503C', dot: '#24272D',
  term: '#0C0E10', dim: '#4C6B45'
};
const PAL = { '#': C.text, w: C.win, g: C.green, o: C.orange, d: C.dark, b: C.title, W: C.white, r: C.red, s: C.shade };

const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];

const G = {
  W: 640, H: 360, PLAY_H: 336,
  t: 0, dt: 0, frame: 0,
  mouse: { x: 320, y: 180, down: false, pressed: false, released: false, rdown: false, rpressed: false, wheel: 0, wheelT: 0 },
  keysPressed: [], held: {},
  scene: null, sceneName: '', scenes: {},
  ORDER: ['title', 'boot', 'l1', 'l2', 'lf', 'l3', 'lw', 'lr', 'l4', 'ls', 'l5', 'l6', 'l7', 'end'],
  shake: 0, rumble: 0, cursor: 'arrow',
  waiters: [], tweens: [], particles: [],
  muted: false, level: 0, playTime: 0, progressT: 0,
  muteRect: { x: 562, y: 339, w: 20, h: 18 }
};

// ---------------------------------------------------------------- Pixel-Schrift
const FONT = {};
(function () {
  const g = {
    A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
    B: '####./#...#/#...#/####./#...#/#...#/####.',
    C: '.###./#...#/#..../#..../#..../#...#/.###.',
    D: '####./#...#/#...#/#...#/#...#/#...#/####.',
    E: '#####/#..../#..../####./#..../#..../#####',
    F: '#####/#..../#..../####./#..../#..../#....',
    G: '.###./#...#/#..../#.###/#...#/#...#/.###.',
    H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    I: '###/.#./.#./.#./.#./.#./###',
    J: '..###/...#./...#./...#./...#./#..#./.##..',
    K: '#...#/#..#./#.#../##.../#.#../#..#./#...#',
    L: '#..../#..../#..../#..../#..../#..../#####',
    M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#',
    N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
    O: '.###./#...#/#...#/#...#/#...#/#...#/.###.',
    P: '####./#...#/#...#/####./#..../#..../#....',
    Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
    R: '####./#...#/#...#/####./#.#../#..#./#...#',
    S: '.####/#..../#..../.###./....#/....#/####.',
    T: '#####/..#../..#../..#../..#../..#../..#..',
    U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
    V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
    W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
    X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    Y: '#...#/#...#/.#.#./..#../..#../..#../..#..',
    Z: '#####/....#/...#./..#../.#.../#..../#####',
    'Ä': '#...#/..#../.#.#./#...#/#####/#...#/#...#',
    'Ö': '#...#/.###./#...#/#...#/#...#/#...#/.###.',
    'Ü': '#...#/...../#...#/#...#/#...#/#...#/.###.',
    a: '...../...../.###./....#/.####/#...#/.####',
    b: '#..../#..../####./#...#/#...#/#...#/####.',
    c: '..../..../.###/#.../#.../#.../.###',
    d: '....#/....#/.####/#...#/#...#/#...#/.####',
    e: '...../...../.###./#...#/#####/#..../.###.',
    f: '..##/.#../###./.#../.#../.#../.#..',
    g: '...../...../.####/#...#/#...#/#...#/.####/....#/.###.',
    h: '#..../#..../####./#...#/#...#/#...#/#...#',
    i: '#/./#/#/#/#/#',
    j: '..#/.../..#/..#/..#/..#/..#/..#/##.',
    k: '#.../#.../#..#/#.#./##../#.#./#..#',
    l: '#./#./#./#./#./#./.#',
    m: '...../...../##.#./#.#.#/#.#.#/#.#.#/#.#.#',
    n: '...../...../####./#...#/#...#/#...#/#...#',
    o: '...../...../.###./#...#/#...#/#...#/.###.',
    p: '...../...../####./#...#/#...#/#...#/####./#..../#....',
    q: '...../...../.####/#...#/#...#/#...#/.####/....#/....#',
    r: '..../..../#.##/##../#.../#.../#...',
    s: '..../..../.###/#.../.##./...#/###.',
    t: '.#../.#../###./.#../.#../.#../..##',
    u: '...../...../#...#/#...#/#...#/#...#/.####',
    v: '...../...../#...#/#...#/#...#/.#.#./..#..',
    w: '...../...../#...#/#...#/#.#.#/#.#.#/.#.#.',
    x: '...../...../#...#/.#.#./..#../.#.#./#...#',
    y: '...../...../#...#/#...#/#...#/#...#/.####/....#/.###.',
    z: '...../...../#####/...#./..#../.#.../#####',
    'ä': '.#.#./...../.###./....#/.####/#...#/.####',
    'ö': '.#.#./...../.###./#...#/#...#/#...#/.###.',
    'ü': '.#.#./...../#...#/#...#/#...#/#...#/.####',
    'ß': '.##../#..#./#..#./#.#../#..#./#...#/#.##.',
    0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
    1: '..#../.##../..#../..#../..#../..#../.###.',
    2: '.###./#...#/....#/...#./..#../.#.../#####',
    3: '.###./#...#/....#/..##./....#/#...#/.###.',
    4: '...#./..##./.#.#./#..#./#####/...#./...#.',
    5: '#####/#..../####./....#/....#/#...#/.###.',
    6: '.###./#..../#..../####./#...#/#...#/.###.',
    7: '#####/....#/...#./..#../..#../..#../..#..',
    8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
    9: '.###./#...#/#...#/.####/....#/....#/.###.',
    '.': '././././././#',
    ',': '../../../../../../.#/#.',
    '!': '#/#/#/#/#/./#',
    '?': '.###./#...#/....#/...#./..#../...../..#..',
    ':': '././#/././#/.',
    ';': '../../.#/../../.#/#.',
    '-': '.../.../.../###/.../.../...',
    '_': '..../..../..../..../..../..../####',
    "'": '#/#/././././.',
    '"': '#.#/#.#/.../.../.../.../...',
    '„': '.../.../.../.../.../#.#/#.#',
    '(': '.#/#./#./#./#./#./.#',
    ')': '#./.#/.#/.#/.#/.#/#.',
    '[': '##/#./#./#./#./#./##',
    ']': '##/.#/.#/.#/.#/.#/##',
    '/': '....#/....#/...#./..#../.#.../#..../#....',
    '+': '...../..#../..#../#####/..#../..#../.....',
    '=': '..../..../####/..../####/..../....',
    '*': '...../#.#.#/.###./#####/.###./#.#.#/.....',
    '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
    '#': '.#.#./.#.#./#####/.#.#./#####/.#.#./.#.#.',
    '<': '...#/..#./.#../#.../.#../..#./...#',
    '>': '#.../.#../..#./...#/..#./.#../#...',
    '|': '#/#/#/#/#/#/#',
    '←': '...../..#../.#.../#####/.#.../..#../.....',
    '→': '...../..#../...#./#####/...#./..#../.....',
    '✓': '...../....#/....#/...#./#.#../.#.../.....',
    '×': '...../#...#/.#.#./..#../.#.#./#...#/.....'
  };
  for (const k in g) { const rows = g[k].split('/'); FONT[k] = { w: rows[0].length, rows }; }
  FONT[' '] = { w: 3, rows: [] };
})();
const CHMAP = { '“': '"', '”': '"', '’': "'", '‘': "'", '–': '-', '—': '-' };
const glyphOf = ch => FONT[ch] || FONT[CHMAP[ch]] || FONT['?'];
const norm = s => String(s).replace(/…/g, '...');
const glyphCache = {};
function glyphImg(ch, color) {
  const key = color + ch;
  let c = glyphCache[key];
  if (!c) {
    const gl = glyphOf(ch);
    c = document.createElement('canvas');
    c.width = Math.max(1, gl.w); c.height = 9;
    const x = c.getContext('2d');
    x.fillStyle = color;
    gl.rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, j, 1, 1); });
    glyphCache[key] = c;
  }
  return c;
}
G.textW = function (s, scale = 1) {
  let w = 0;
  for (const ch of norm(s)) w += glyphOf(ch).w + 1;
  return Math.max(0, w - 1) * scale;
};
G.text = function (ctx, s, x, y, color = C.text, scale = 1, align = 'left') {
  s = norm(s);
  if (align === 'center') x -= G.textW(s, scale) / 2;
  else if (align === 'right') x -= G.textW(s, scale);
  x = Math.round(x); y = Math.round(y);
  for (const ch of s) {
    const gl = glyphOf(ch);
    if (gl.rows.length) ctx.drawImage(glyphImg(ch, color), x, y, gl.w * scale, 9 * scale);
    x += (gl.w + 1) * scale;
  }
};
G.wrap = function (s, maxW, scale = 1) {
  const out = [];
  for (const para of norm(s).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (line && G.textW(t, scale) > maxW) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
};

// ---------------------------------------------------------------- Zeichnen
G.rect = function (ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
G.box = function (ctx, x, y, w, h, fill, line = C.text) {
  G.rect(ctx, x, y, w, h, line);
  G.rect(ctx, x + 1, y + 1, w - 2, h - 2, fill);
};
G.disc = function (ctx, cx, cy, r, color) {
  ctx.fillStyle = color; cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy) + 0.4);
    ctx.fillRect(cx - w, cy + dy, 2 * w + 1, 1);
  }
};
G.ring = function (ctx, cx, cy, r, color, th = 2) {
  ctx.fillStyle = color;
  const n = Math.ceil(r * 5);
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), th, th);
  }
};
G.sprite = function (ctx, rows, x, y, scale = 1, flip = false, pal = PAL) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < rows.length; j++) {
    const r = rows[j], n = r.length;
    let i = 0;
    while (i < n) {
      const ch = r[i];
      if (ch === '.') { i++; continue; }
      let k = i + 1;
      while (k < n && r[k] === ch) k++;
      const col = pal[ch];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x + (flip ? n - k : i) * scale, y + j * scale, (k - i) * scale, scale);
      }
      i = k;
    }
  }
};
G.window = function (ctx, x, y, w, h, title, o = {}) {
  x = Math.round(x); y = Math.round(y);
  G.rect(ctx, x + 3, y + 3, w, h, 'rgba(0,0,0,0.35)');
  G.box(ctx, x, y, w, h, o.bg || C.win);
  G.rect(ctx, x + 1, y + 1, w - 2, 13, o.bar || C.title);
  G.text(ctx, title, x + 5, y + 4, o.titleColor || C.white);
  if (o.close) {
    const r = G.closeRect({ x, y, w, h });
    G.box(ctx, r.x, r.y, r.w, r.h, G.hit(r) ? C.orange : C.win);
    G.text(ctx, '×', r.x + 3, r.y + 2, C.text);
  }
};
G.closeRect = w => ({ x: w.x + w.w - 15, y: w.y + 2, w: 12, h: 11 });
G.button = function (ctx, r, label, o = {}) {
  const hover = G.hit(r) && !o.disabled;
  G.box(ctx, r.x, r.y, r.w, r.h, hover ? C.green : (o.color || C.win));
  G.rect(ctx, r.x + 1, r.y + 1, r.w - 2, 1, C.white);
  G.rect(ctx, r.x + 1, r.y + r.h - 2, r.w - 2, 1, C.shade);
  G.text(ctx, label, r.x + r.w / 2, r.y + Math.floor((r.h - 7) / 2), C.text, o.scale || 1, 'center');
};
G.hit = (r, p = G.mouse) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
G.clicked = r => G.mouse.pressed && G.hit(r);
G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

G.confetti = function (x, y, n = 30) {
  const cols = [C.green, C.orange, C.white, C.dark, C.win];
  for (let i = 0; i < n; i++) G.particles.push({ x, y, vx: rnd(-90, 90), vy: rnd(-170, -40), c: pick(cols), life: rnd(0.8, 1.8) });
};

// ---------------------------------------------------------------- Ablaufhelfer
G.until = fn => new Promise(resolve => G.waiters.push({ fn, resolve }));
G.wait = function (sec) { const end = G.t + sec; return G.until(() => G.t >= end); };
G.script = function (fn) { const p = fn(); if (p && p.catch) p.catch(e => console.error(e)); };
const EASE = {
  lin: p => p,
  in: p => p * p,
  out: p => 1 - (1 - p) * (1 - p),
  elastic: p => 1 - (1 - p) * (1 - p) * Math.cos(p * 9),
  bounce: p => {
    const n = 7.5625, d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  }
};
G.tween = function (o, props, dur, ease = 'out') {
  const from = {};
  for (const k in props) from[k] = o[k];
  let t = 0;
  return new Promise(resolve => {
    G.tweens.push(dt => {
      t += dt;
      const p = Math.min(1, t / dur), e = EASE[ease](p);
      for (const k in props) o[k] = from[k] + (props[k] - from[k]) * e;
      if (p >= 1) { resolve(); return true; }
      return false;
    });
  });
};
G.progress = function () { G.progressT = G.t; };
G.go = function (name) {
  if (G.scene && G.scene.exit) G.scene.exit();
  G.waiters = []; G.tweens = [];
  G.shake = 0; G.rumble = 0; G.cursor = 'arrow';
  K.reset();
  A.music = null;
  G.sceneName = name;
  const links = document.getElementById('links');
  if (links && links.style) links.style.display = name === 'title' ? 'flex' : 'none';
  G.level = Math.max(0, G.ORDER.indexOf(name) - 1);
  if (G.level > 0) G.track('level', name); // anonymer Zähler: wie weit kommen die Spieler?
  G.scene = G.scenes[name]();
  G.progressT = G.t;
  if (G.scene.enter) G.scene.enter();
};
G.next = async function (delay = 0.7) {
  await G.wait(delay);
  G.go(G.ORDER[G.ORDER.indexOf(G.sceneName) + 1]);
};

// ---------------------------------------------------------------- Ton
const DISCO = {
  lead: [440, 0, 523, 0, 659, 523, 0, 440, 392, 0, 494, 0, 587, 494, 0, 392, 349, 0, 440, 0, 523, 440, 0, 349, 392, 0, 494, 587, 659, 0, 587, 494],
  bass: [110, 0, 0, 110, 0, 0, 110, 0, 98, 0, 0, 98, 0, 0, 98, 0, 87, 0, 0, 87, 0, 0, 87, 0, 98, 0, 0, 98, 0, 98, 0, 0]
};
const A = {
  ac: null, music: null, step: -1,
  init() {
    if (this.ac) { if (this.ac.resume) this.ac.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ac = new AC();
    } catch (e) { /* kein Ton verfügbar */ }
  },
  tone(f, dur = 0.08, o = {}) {
    if (!this.ac || G.muted) return;
    const ac = this.ac, t0 = ac.currentTime + (o.at || 0);
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(o.vol || 0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },
  seq(notes, step = 0.08, o = {}) {
    notes.forEach((f, i) => { if (f) this.tone(f, step * 1.3, Object.assign({}, o, { at: i * step })); });
  },
  sfx(n) {
    switch (n) {
      case 'click': this.tone(700, 0.03); break;
      case 'type': this.tone(1100, 0.015, { vol: 0.03 }); break;
      case 'hit': this.tone(520, 0.12, { to: 1040 }); break;
      case 'miss': this.tone(220, 0.12, { to: 160 }); break;
      case 'ok': this.seq([523, 659, 784], 0.07); break;
      case 'bad': this.tone(140, 0.2, { type: 'sawtooth', vol: 0.06 }); break;
      case 'pop': this.tone(900, 0.05, { to: 400 }); break;
      case 'error': this.seq([330, 247], 0.09, { vol: 0.06 }); break;
      case 'thud': this.tone(110, 0.18, { to: 50, type: 'triangle', vol: 0.15 }); break;
      case 'alarm': this.seq([880, 660, 880, 660, 880, 660], 0.11, { type: 'sawtooth', vol: 0.04 }); break;
      case 'jump': this.tone(300, 0.14, { to: 640 }); break;
      case 'blub': this.tone(240, 0.3, { to: 70, type: 'triangle', vol: 0.12 }); break;
      case 'steal': this.seq([784, 659, 523, 392], 0.06); break;
      case 'boot': this.seq([262, 330, 392, 523, 0, 392, 523], 0.12, { vol: 0.04 }); break;
      case 'fanfare': this.seq([523, 523, 523, 659, 784, 0, 659, 784, 1047], 0.11); break;
    }
  },
  update() {
    if (!this.music) return;
    const s = Math.floor(G.t * 8);
    if (s === this.step) return;
    this.step = s;
    const n = DISCO.lead[s % DISCO.lead.length], b = DISCO.bass[s % DISCO.bass.length];
    if (n) this.tone(n, 0.1, { vol: 0.025 });
    if (b) this.tone(b, 0.12, { type: 'triangle', vol: 0.08 });
  }
};

// ---------------------------------------------------------------- Sprachausgabe
// Klammis Stimme besteht aus fertigen Aufnahmen im Ordner audio/. Dadurch klingt sie auf jedem
// Gerät gleich. Erzeugt werden sie mit tools/make-voice.py (Sprachmodell Piper); dabei entsteht
// auch js/voice-lines.js mit der Zuordnung Text -> Datei.
const V = s => s;   // markiert einen Klammi-Text für den Generator
const VV = s => s;  // markiert einen Virus-Text für den Generator
const Voice = {
  seq: 0, src: null, tag: null, cache: {},
  file(text, who) { return typeof VOICE_LINES !== 'undefined' ? VOICE_LINES[(who === 'virus' ? 'v|' : 'k|') + text] : null; },
  load(url) {
    if (!this.cache[url]) {
      this.cache[url] = fetch(url)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
        .then(buf => new Promise((res, rej) => A.ac.decodeAudioData(buf, res, rej)));
      this.cache[url].catch(() => { delete this.cache[url]; });
    }
    return this.cache[url];
  },
  // Lädt nach dem Start alle Aufnahmen im Hintergrund, damit Klammi ohne Verzögerung spricht.
  warm() {
    if (typeof VOICE_LINES === 'undefined' || !A.ac || !G.online()) return;
    const urls = Object.values(VOICE_LINES).map(f => 'audio/' + f);
    const next = () => { const u = urls.shift(); if (u) this.load(u).then(next, next); };
    next(); next();
  },
  // Spielt die Aufnahme zu einem Text. Gibt true zurück, wenn es eine gibt. onend(failed) meldet das Ende.
  speak(text, who, onend) {
    if (G.muted) return false;
    const f = this.file(text, who);
    if (!f) return false;
    this.stop();
    const id = ++this.seq, url = 'audio/' + f;
    const fail = () => { if (id === this.seq) onend(true); };
    const viaTag = () => {
      if (id !== this.seq) return;
      if (typeof Audio === 'undefined') return fail();
      try {
        const a = new Audio(url);
        this.tag = a;
        a.onended = () => { if (id === this.seq) onend(false); };
        a.onerror = fail;
        const p = a.play();
        if (p && p.catch) p.catch(fail);
      } catch (e) { fail(); }
    };
    if (A.ac && G.online()) {
      this.load(url).then(buf => {
        if (id !== this.seq || G.muted) return;
        const src = A.ac.createBufferSource(), g = A.ac.createGain();
        src.buffer = buf; g.gain.value = 0.9;
        src.connect(g); g.connect(A.ac.destination);
        src.onended = () => { if (id === this.seq) onend(false); };
        this.src = src;
        src.start();
      }).catch(viaTag);
    } else viaTag();
    return true;
  },
  stop() {
    this.seq++;
    if (this.src) { try { this.src.onended = null; this.src.stop(); } catch (e) { /* egal */ } this.src = null; }
    if (this.tag) { try { this.tag.onended = null; this.tag.pause(); } catch (e) { /* egal */ } this.tag = null; }
  }
};

// ---------------------------------------------------------------- Urheber, Teilen, Server
G.AUTHOR = (typeof SITE !== 'undefined' && SITE.author) || 'PrellDynamics';
G.online = () => typeof location !== 'undefined' && /^https?:/.test(location.protocol) && typeof fetch !== 'undefined';
// Schickt etwas an den eigenen Server. Ohne Server (Datei lokal geöffnet) passiert nichts.
G.post = function (url, data) {
  if (!G.online()) return Promise.reject(new Error('offline'));
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
};
G.track = function (type, level) { G.post('/api/event', { type, level }).catch(() => {}); };
// Teilen: Teilen-Dialog des Geräts, sonst Link in die Zwischenablage. Liefert einen Hinweistext.
G.share = function () {
  if (typeof location === 'undefined' || typeof navigator === 'undefined') return Promise.resolve('');
  const url = location.origin + location.pathname;
  const data = { title: 'KLAMMI.exe – Chaos im System', text: 'Ich habe KLAMMI OS vor CHAOS.EXE gerettet! Schaffst du das auch?', url };
  const copy = () => navigator.clipboard
    ? navigator.clipboard.writeText(data.text + ' ' + url).then(() => 'Link kopiert! Jetzt einfügen und verschicken.').catch(() => url)
    : Promise.resolve(url);
  if (navigator.share) return navigator.share(data).then(() => 'Geteilt!').catch(e => (e && e.name === 'AbortError' ? '' : copy()));
  return copy();
};

// ---------------------------------------------------------------- Start & Schleife
G.fullscreen = function () {
  try {
    const el = document.documentElement;
    const p = el.requestFullscreen && el.requestFullscreen();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* Vollbild nicht erlaubt */ }
};

G.init = function () {
  const cv = document.getElementById('game');
  G.cv = cv; G.ctx = cv.getContext('2d');
  cv.width = G.W; cv.height = G.H;
  G.ctx.imageSmoothingEnabled = false;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    let s = Math.min(window.innerWidth * dpr / G.W, window.innerHeight * dpr / G.H);
    if (s >= 1) s = Math.floor(s);
    cv.style.width = (G.W * s / dpr) + 'px';
    cv.style.height = (G.H * s / dpr) + 'px';
  };
  resize();
  window.addEventListener('resize', resize);

  const pos = e => {
    const r = cv.getBoundingClientRect();
    G.mouse.x = clamp((e.clientX - r.left) / r.width * G.W, 0, G.W - 1);
    G.mouse.y = clamp((e.clientY - r.top) / r.height * G.H, 0, G.H - 1);
  };
  window.addEventListener('mousemove', pos);
  window.addEventListener('mousedown', e => {
    pos(e);
    if (e.button === 0) { G.mouse.down = true; G.mouse.pressed = true; }
    if (e.button === 2) { G.mouse.rdown = true; G.mouse.rpressed = true; }
    e.preventDefault();
  });
  window.addEventListener('mouseup', e => {
    pos(e);
    if (e.button === 0) { G.mouse.down = false; G.mouse.released = true; }
    if (e.button === 2) G.mouse.rdown = false;
  });
  window.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('wheel', e => {
    // Zeilen-/Seitenmodus grob in Pixel umrechnen
    G.mouse.wheel += e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
    e.preventDefault();
  }, { passive: false });
  const BLOCK = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Backspace', 'Tab', 'Enter', "'", '/'];
  window.addEventListener('keydown', e => {
    G.held[e.key] = true;
    if (e.ctrlKey || e.metaKey) {
      // Strg+S gehört dem Spiel (Speichern-Level), alles andere dem Browser
      if (e.key.toLowerCase() === 's') { e.preventDefault(); if (!e.repeat) G.keysPressed.push('Ctrl+S'); }
      return;
    }
    if (e.altKey) return;
    if (BLOCK.includes(e.key)) e.preventDefault();
    if (!e.repeat) G.keysPressed.push(e.key);
  });
  window.addEventListener('keyup', e => { G.held[e.key] = false; });
  window.addEventListener('blur', () => { G.held = {}; G.mouse.down = false; G.mouse.rdown = false; });

  G.go('title');
  let last = 0;
  const loop = ts => {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    G.frameStep(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

G.frameStep = function (dt) {
  G.dt = dt; G.t += dt; G.frame++;
  if (G.sceneName !== 'title' && G.sceneName !== 'end') G.playTime += dt;

  if (G.mouse.pressed && G.sceneName !== 'title' && G.hit(G.muteRect)) {
    G.muted = !G.muted;
    if (G.muted) Voice.stop();
    G.mouse.pressed = false;
  }
  for (const w of G.waiters.slice()) {
    if (w.fn()) {
      const i = G.waiters.indexOf(w);
      if (i >= 0) { G.waiters.splice(i, 1); w.resolve(); }
    }
  }
  for (const tw of G.tweens.slice()) {
    if (tw(dt)) { const i = G.tweens.indexOf(tw); if (i >= 0) G.tweens.splice(i, 1); }
  }
  if (G.scene && G.scene.update) G.scene.update(dt);
  K.update(dt);
  A.update();
  if (K.line && K.line.block) G.progressT = G.t;
  G.shake = Math.max(0, G.shake - dt * 10);
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);

  G.render();
  if (G.mouse.wheel) G.mouse.wheelT = 0.25; else G.mouse.wheelT = Math.max(0, G.mouse.wheelT - dt);
  G.mouse.pressed = G.mouse.released = G.mouse.rpressed = false;
  G.mouse.wheel = 0;
  G.keysPressed.length = 0;
};

const CURSOR = [
  '#.......', '##......', '#W#.....', '#WW#....', '#WWW#...', '#WWWW#..',
  '#WWWWW#.', '#WWWWWW#', '#WWW####', '#W#W#...', '##.#W#..', '....##..'
];
const HELP_ARROW = ['.#####.', '.#ggg#.', '.#ggg#.', '.#ggg#.', '##ggg##', '#ggggg#', '.#ggg#.', '..#g#..', '...#...'];

G.render = function () {
  const ctx = G.ctx;
  ctx.save();
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, G.W, G.H);
  const s = G.shake + G.rumble;
  if (s > 0.3) ctx.translate(Math.round(rnd(-s, s)), Math.round(rnd(-s, s)));
  if (G.scene && G.scene.draw) G.scene.draw(ctx);
  K.draw(ctx);
  if (G.scene && G.scene.drawTop) G.scene.drawTop(ctx);
  for (const p of G.particles) G.rect(ctx, p.x, p.y, 3, 3, p.c);

  // Hilfe-Pfeil, wenn lange nichts passiert ist
  if (G.t - G.progressT > 12 && G.scene && G.scene.hint && !(K.line && K.line.block)) {
    const h = G.scene.hint();
    if (h && (h.x != null || h.x1 != null)) {
      let hx = h.x, hy = h.y;
      if (h.x1 != null) { const second = Math.floor(G.t) % 2 === 1; hx = second ? h.x2 : h.x1; hy = second ? h.y2 : h.y1; }
      G.sprite(ctx, HELP_ARROW, hx - 3, hy - 26 + Math.round(Math.sin(G.t * 8) * 3));
    }
  }
  ctx.restore();

  const m = G.mouse;
  if (G.cursor === 'arrow') G.sprite(ctx, CURSOR, m.x, m.y);
  else if (G.cursor === 'ghost') G.sprite(ctx, CURSOR, m.x, m.y, 1, false, { '#': '#8C94B8' });
};
