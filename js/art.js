'use strict';
// KLAMMI.exe – Grafik: Sprites, Icons, Klammi, Desktop

const SPR = {
  bug: [
    '..#......#..', '...#....#...', '..########..', '.#oooooooo#.', '##oWoooWoo##',
    '.#oooooooo#.', '##oooooooo##', '.#oooooooo#.', '..########..', '.#..#..#..#.'
  ],
  banana: [
    '..........##..', '.........#d#..', '........#oo#..', '.......#ooo#..', '......#oooo#..', '.....#oooo#...',
    '....#ooooo#...', '..##ooooo#....', '.#oooooo#.....', '#oooooo#......', '.#oooo#.......', '..####........'
  ],
  sock: [
    '....######..', '....#WWWW#..', '....#gggg#..', '....#gggg#..', '....#gggg#..', '....#gggg#..',
    '...#ggggg#..', '.##gggggg#..', '#gggggggg#..', '#ggggggg#...', '.#######....'
  ],
  potato: [
    '....######....', '..##dddddd##..', '.#dddddddddd#.', '#ddd#dddd#ddd#', '#dddddddddddd#', '#dddddddddddd#',
    '#ddd#dddd#ddd#', '#dddd####dddd#', '.#dddddddddd#.', '..##dddddd##..', '....######....'
  ],
  key: [
    '.####..........', '#oooo#.........', '#o##o##########', '#o##oooooooooo#', '#o##o####o#o###', '#oooo#..#o#o#..', '.####....#.#...'
  ],
  warn: [
    '.....#.....', '....#o#....', '....#o#....', '...#o#o#...', '...#o#o#...', '..#oo#oo#..',
    '..#ooooo#..', '.#ooo#ooo#.', '.#ooooooo#.', '###########'
  ],
  star: ['.....#.....', '.....#.....', '....###....', '###########', '.#########.', '..#######..', '..#######..', '.####.####.', '.##.....##.', '#.........#'],
  speaker: ['...#.', '..##.', '####.', '####.', '####.', '..##.', '...#.']
};

// Umrissfarbe, die auch auf dem dunklen Desktop sichtbar ist
const LINE_PAL = Object.assign({}, PAL, { '#': C.dark, d: '#8A4A16' });

const Icons = {
  // Alle Icons werden um (x, y) zentriert gezeichnet.
  draw(ctx, kind, x, y, o = {}) {
    x = Math.round(x); y = Math.round(y);
    const R = (a, b, w, h, c) => G.rect(ctx, x + a, y + b, w, h, c);
    const B = (a, b, w, h, c) => G.box(ctx, x + a, y + b, w, h, c);
    switch (kind) {
      case 'folder':
        if (o.sel) { G.rect(ctx, x - 19, y - 16, 38, 32, C.green); G.rect(ctx, x - 17, y - 14, 34, 28, C.bg); }
        B(-14, -12, 13, 6, C.dark);
        if (o.open) { B(-14, -8, 28, 19, C.dark); B(-17, -1, 31, 12, C.orange); }
        else { B(-14, -8, 28, 19, C.orange); R(-12, -6, 24, 1, C.white); }
        break;
      case 'pic':
        B(-13, -11, 26, 22, C.white);
        R(-11, -9, 22, 18, C.title);
        G.disc(ctx, x + 5, y - 4, 3, C.orange);
        R(-11, 3, 22, 6, C.green); R(-8, 1, 8, 2, C.green); R(-6, -1, 4, 2, C.green);
        break;
      case 'note':
        R(-5, -11, 15, 4, C.text); R(-5, -11, 4, 17, C.text); R(6, -11, 4, 15, C.text);
        R(-11, 3, 9, 7, C.text); R(0, 1, 9, 7, C.text);
        R(-4, -10, 13, 2, C.win); R(-4, -10, 2, 15, C.win); R(7, -10, 2, 13, C.win);
        R(-10, 4, 7, 5, C.win); R(1, 2, 7, 5, C.win);
        break;
      case 'trash':
        B(-9, -6, 18, 17, C.win);
        R(-5, -3, 2, 11, C.shade); R(-1, -3, 2, 11, C.shade); R(3, -3, 2, 11, C.shade);
        B(-11, -10, 22, 5, C.win); B(-4, -13, 8, 4, C.win);
        break;
      case 'monitor':
        B(-13, -12, 26, 19, C.win); R(-10, -9, 20, 13, C.title);
        R(-8, -7, 6, 1, C.green); R(-8, -5, 10, 1, C.green);
        B(-4, 6, 8, 4, C.win); B(-9, 9, 18, 3, C.win);
        break;
      case 'disco': {
        R(0, -24, 1, 12, C.win);
        G.disc(ctx, x, y, 11, C.text); G.disc(ctx, x, y, 10, C.win);
        const cols = [C.green, C.orange, C.white, C.title];
        const ph = Math.floor(G.t * 6);
        for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
          if (Math.abs(i) + Math.abs(j) > 3) continue;
          R(i * 4 - 1, j * 4 - 1, 3, 3, cols[(i + j * 2 + ph + 40) % 4]);
        }
        break;
      }
      case 'chip':
        R(-6, -3, 12, 1, C.win); R(-6, 2, 12, 1, C.win); R(-3, -6, 1, 12, C.win); R(2, -6, 1, 12, C.win);
        B(-4, -4, 8, 8, C.green);
        break;
      case 'bug': G.sprite(ctx, SPR.bug, x - 12, y - 10, 2, false, LINE_PAL); break;
      case 'banana': G.sprite(ctx, SPR.banana, x - 14, y - 12, 2, false, LINE_PAL); break;
      case 'sock': G.sprite(ctx, SPR.sock, x - 12, y - 11, 2, false, Object.assign({}, PAL, { '#': C.dim })); break;
      case 'potato': G.sprite(ctx, SPR.potato, x - 14, y - 11, 2); break;
      case 'key': G.sprite(ctx, SPR.key, x - 15, y - 7, 2, false, LINE_PAL); break;
      case 'warn': G.sprite(ctx, SPR.warn, x - 5, y - 5, 1); break;
    }
  },
  // Maus-Schaubild: zeigt, welche Taste gemeint ist und was gerade gedrückt wird
  mouse(ctx, x, y, hi) {
    const m = G.mouse, blink = Math.floor(G.t * 3) % 2;
    G.rect(ctx, x - 1, y - 36, 2, 13, C.win);
    G.box(ctx, x - 17, y - 24, 34, 48, C.win);
    G.rect(ctx, x - 16, y - 3, 32, 1, C.text); G.rect(ctx, x, y - 23, 1, 20, C.text);
    if (m.down) G.rect(ctx, x - 16, y - 23, 16, 20, C.orange);
    else if (hi === 'left' && blink) G.rect(ctx, x - 16, y - 23, 16, 20, C.green);
    if (m.rdown) G.rect(ctx, x + 1, y - 23, 15, 20, C.orange);
    else if (hi === 'right' && blink) G.rect(ctx, x + 1, y - 23, 15, 20, C.green);
    const spin = m.wheelT > 0;
    G.box(ctx, x - 3, y - 20, 7, 14, spin ? C.orange : (hi === 'wheel' && blink ? C.green : C.shade));
    const o = spin ? Math.floor(G.t * 16) % 3 : 0;
    for (let i = 0; i < 4; i++) G.rect(ctx, x - 2, y - 18 + i * 3 + o, 5, 1, C.text);
  },
  // Enter-Taste in ihrer typischen Winkelform (oben breit, unten schmal)
  enterKey(ctx, x, y, on) {
    const f = on ? C.green : C.title, c = on ? C.text : C.win;
    G.rect(ctx, x, y, 34, 13, C.shade); G.rect(ctx, x + 8, y + 12, 26, 13, C.shade);
    G.rect(ctx, x + 1, y + 1, 32, 11, f); G.rect(ctx, x + 9, y + 12, 24, 12, f);
    G.rect(ctx, x + 25, y + 5, 2, 10, c); G.rect(ctx, x + 12, y + 13, 15, 2, c);
    G.rect(ctx, x + 14, y + 12, 2, 4, c); G.rect(ctx, x + 16, y + 11, 2, 6, c);
  },
  cheese(ctx, x, y) {
    x = Math.round(x); y = Math.round(y);
    for (let i = 0; i < 3; i++) G.rect(ctx, x - 9 + i * 8 + Math.round(Math.sin(G.t * 4 + i * 2) * 2), y - 20 - ((G.t * 8 + i * 5) % 10), 2, 5, C.dim);
    G.box(ctx, x - 14, y - 4, 28, 15, C.orange, C.dark);
    G.rect(ctx, x - 8, y - 7, 22, 3, C.dark); G.rect(ctx, x - 2, y - 10, 16, 3, C.dark); G.rect(ctx, x + 6, y - 13, 8, 3, C.dark);
    G.rect(ctx, x - 7, y - 6, 20, 2, C.orange); G.rect(ctx, x - 1, y - 9, 14, 3, C.orange); G.rect(ctx, x + 7, y - 12, 6, 3, C.orange);
    G.rect(ctx, x - 9, y, 4, 4, C.dark); G.rect(ctx, x + 2, y + 4, 3, 3, C.dark); G.rect(ctx, x + 7, y - 2, 4, 3, C.dark);
  },
  disk(ctx, x, y) {
    G.box(ctx, x, y, 12, 12, C.title);
    G.rect(ctx, x + 3, y + 1, 6, 4, C.win); G.rect(ctx, x + 7, y + 2, 1, 2, C.title);
    G.rect(ctx, x + 2, y + 7, 8, 4, C.white);
  },
  robot(ctx, x, y, face, moving, chip) {
    x = Math.round(x); y = Math.round(y);
    G.rect(ctx, x + 5, y - 3, 2, 3, C.win); G.rect(ctx, x + 4, y - 5, 4, 2, C.orange);
    G.box(ctx, x + 1, y, 10, 7, C.win);
    const ex = face > 0 ? 2 : 0;
    G.rect(ctx, x + 3 + ex, y + 2, 2, 2, C.title); G.rect(ctx, x + 6 + ex, y + 2, 2, 2, C.title);
    G.box(ctx, x + 2, y + 6, 8, 6, C.orange);
    const step = moving ? Math.floor(G.t * 10) % 2 : 0;
    G.rect(ctx, x + 3, y + 12, 2, step ? 1 : 2, C.win); G.rect(ctx, x + 7, y + 12, 2, step ? 2 : 1, C.win);
    if (chip) Icons.draw(ctx, 'chip', x + 6, y - 11);
  },
  virus(ctx, x, y, r, dizzy) {
    x = Math.round(x); y = Math.round(y);
    const wob = Math.sin(G.t * 6);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + G.t * (dizzy ? 0.3 : 1.2), d = r + 3 + wob;
      G.rect(ctx, x + Math.cos(a) * d - 2, y + Math.sin(a) * d - 2, 4, 4, C.dark);
    }
    G.disc(ctx, x, y, r, C.text); G.disc(ctx, x, y, r - 1, C.dark); G.disc(ctx, x - 2, y - 2, Math.max(1, r - 5), C.orange);
    const e = Math.max(2, Math.round(r / 4));
    for (const sx of [-1, 1]) {
      const ex = x + sx * Math.round(r * 0.4) - Math.floor(e / 2), ey = y - Math.round(r * 0.3);
      if (dizzy) G.text(ctx, '×', ex - 1, ey - 2, C.text);
      else {
        G.rect(ctx, ex - 1, ey - 1, e + 2, e + 2, C.text); G.rect(ctx, ex, ey, e, e, C.white);
        G.rect(ctx, ex + (G.mouse.x > x ? e - 1 : 0), ey + e - 1, 1, 1, C.text);
        G.rect(ctx, ex - 1 + (sx < 0 ? 0 : 1), ey - 3, e + 1, 1, C.text);
      }
    }
    const mw = Math.round(r * 0.8);
    G.rect(ctx, x - mw / 2, y + Math.round(r * 0.35), mw, dizzy ? 1 : 2, C.text);
  }
};

// ---------------------------------------------------------------- Klammi
const K = {
  x: 604, y: 332, scale: 1, visible: true, pose_: 'idle', poseT: 0, poseStart: 0, line: null,
  home() { this.x = 604; this.y = 332; this.scale = 1; this.visible = true; },
  pose(p, dur) {
    this.pose_ = p; this.poseT = dur || 0; this.poseStart = G.t;
    if (p === 'victory') G.confetti(this.x, this.y - 50 * this.scale);
  },
  reset() { this.line = null; Voice.stop(); this.pose_ = 'idle'; this.poseT = 0; },
  // Zeigt eine Sprechblase und spricht den Text. block:true = Zwischensequenz (Klick überspringt).
  say(text, o = {}) {
    text = norm(text);
    if (this.line) { const old = this.line; this.line = null; old.resolve(); }
    return new Promise(resolve => {
      const L = {
        text, shown: 0, t: 0, block: o.block !== false, resolve, who: o.who || 'k',
        x: o.x, y: o.y, dy: o.dy || 0, speechDone: false, born: G.frame, endT: null, mood: o.mood
      };
      L.minT = 0.8 + text.length * 0.03;
      const silent = 1.2 + text.length * 0.06;
      // failed = Aufnahme ließ sich nicht abspielen: dann läuft die Zeile wie ohne Ton weiter
      L.tts = Voice.speak(norm(o.voice || text), L.who, failed => { if (failed) { L.tts = false; L.maxT = silent; } else L.speechDone = true; });
      L.maxT = L.tts ? 5 + text.length * 0.13 : silent;
      L.lines = G.wrap(text, 236);
      this.line = L;
      if (o.mood) this.pose(o.mood);
    });
  },
  update(dt) {
    if (this.poseT > 0) { this.poseT -= dt; if (this.poseT <= 0) this.pose_ = 'idle'; }
    const L = this.line;
    if (!L) return;
    L.t += dt;
    const before = Math.floor(L.shown);
    L.shown = Math.min(L.text.length, L.shown + 45 * dt);
    const now = Math.floor(L.shown);
    if (!L.tts && now !== before && now % 3 === 0 && now < L.text.length)
      A.tone(L.who === 'virus' ? 170 : 620 + rnd(-60, 60), 0.03, { vol: 0.025 });
    let fin = L.shown >= L.text.length && ((L.tts && L.speechDone && L.t >= L.minT) || L.t >= L.maxT);
    if (L.block && G.mouse.pressed && G.frame !== L.born && L.t > 0.35) {
      if (L.shown < L.text.length) L.shown = L.text.length;
      else { fin = true; L.endT = 0; Voice.stop(); }
    }
    if (fin && L.endT === null) L.endT = L.block ? 0.35 : 1.6;
    if (L.endT !== null) {
      L.endT -= dt;
      if (L.endT <= 0 && this.line === L) {
        this.line = null;
        if (L.mood && this.pose_ === L.mood) this.pose('idle');
        L.resolve();
      }
    }
  },
  talking() {
    const L = this.line;
    return !!L && L.who === 'k' && (L.shown < L.text.length || (L.tts && !L.speechDone));
  },
  draw(ctx) {
    if (this.visible) this.drawBody(ctx);
    if (this.line) this.drawBubble(ctx);
  },
  drawBody(ctx) {
    const s = this.scale, t = G.t, p = this.pose_;
    let ox = 0, oy = Math.round(Math.sin(t * 3)), sx = 1, sy = 1, rot = 0, big = false, knot = false;
    if (p === 'happy') oy = -Math.round(Math.abs(Math.sin(t * 10)) * 8);
    else if (p === 'shocked') { sy = 1.12; big = true; oy = 0; }
    else if (p === 'panic') { ox = rint(-2, 2); oy = rint(-1, 1); big = true; }
    else if (p === 'thinking') rot = 0.22;
    else if (p === 'squashed') { sy = 0.45; sx = 1.35; oy = 0; }
    else if (p === 'tangled') {
      // erst wild herumwirbeln, dann als Knoten liegen bleiben und zappeln
      const a = t - this.poseStart;
      if (a < 0.5) rot = a / 0.5 * Math.PI * 4; else { knot = true; rot = Math.sin(t * 7) * 0.07; ox = Math.round(Math.sin(t * 13)); oy = 0; }
    }
    else if (p === 'victory') {
      const a = t - this.poseStart;
      rot = a < 0.6 ? a / 0.6 * Math.PI * 2 : 0;
      oy = -Math.round(Math.abs(Math.sin(t * 9)) * 6);
    }
    ctx.save();
    ctx.translate(Math.round(this.x + ox), Math.round(this.y + oy));
    if (rot) { ctx.translate(0, -25 * s); ctx.rotate(rot); ctx.translate(0, 25 * s); }
    ctx.scale(s * sx, s * sy);
    if (knot) {
      // Der Draht als Knoten: Jedes Stück wird einzeln mit Umriss gezeichnet,
      // dadurch liegen spätere Stücke sichtbar ÜBER den früheren (drunter und drüber).
      const k = [
        [-13, -20, 3, 20], [-13, -20, 23, 3], [7, -41, 3, 24], [-11, -41, 21, 3], [-11, -41, 3, 15],
        [-11, -29, 28, 3], [14, -29, 3, 22], [-4, -10, 21, 3], [-4, -35, 3, 28], [-4, -35, 8, 3], [1, -35, 3, 9]
      ];
      for (const [x, y, w, h] of k) {
        ctx.fillStyle = C.text; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        ctx.fillStyle = C.green; ctx.fillRect(x, y, w, h);
      }
      // Ecken wieder schließen: Dort, wo zwei Stücke aneinanderhängen, soll keine Lücke sein.
      ctx.fillStyle = C.green;
      for (let i = 0; i + 1 < k.length; i++) {
        const a = k[i], b = k[i + 1];
        const x0 = Math.max(a[0], b[0]), y0 = Math.max(a[1], b[1]);
        const x1 = Math.min(a[0] + a[2], b[0] + b[2]), y1 = Math.min(a[1] + a[3], b[1] + b[3]);
        if (x1 > x0 && y1 > y0) ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    } else {
      const segs = [[-10, -50, 3, 38], [-10, -50, 20, 3], [7, -50, 3, 48], [-4, -3, 14, 3], [-4, -30, 3, 30], [-4, -30, 9, 3], [2, -30, 3, 14]];
      ctx.fillStyle = C.text;
      for (const [x, y, w, h] of segs) ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = C.green;
      for (const [x, y, w, h] of segs) ctx.fillRect(x, y, w, h);
    }
    // Augen
    const blink = (t % 3.7) < 0.12 && !big;
    const ew = big ? 9 : 8, eh = big ? 11 : 9, ey = big ? -51 : knot ? -53 : -48;
    const px = clamp(Math.round((G.mouse.x - this.x) / 70), -2, 2);
    const py = clamp(Math.round((G.mouse.y - (this.y - 44 * s)) / 70), -2, 2);
    for (const ex of [-11, 1]) {
      ctx.fillStyle = C.text;
      if (blink) { ctx.fillRect(ex, ey + 4, ew, 2); continue; }
      ctx.fillRect(ex, ey, ew, eh);
      ctx.fillStyle = C.white; ctx.fillRect(ex + 1, ey + 1, ew - 2, eh - 2);
      ctx.fillStyle = C.text;
      // verknotet: Klammi schielt
      if (knot) ctx.fillRect(ex + (ex < 0 ? 4 : 1), ey + 3, 3, 4);
      else ctx.fillRect(ex + Math.floor((ew - 3) / 2) + (big ? 0 : px), ey + Math.floor((eh - 4) / 2) + (big ? 0 : py), 3, 4);
    }
    // Mund
    const open = p === 'panic' || p === 'shocked' || (this.talking() && Math.floor(t * 9) % 2 === 0);
    if (knot) ctx.translate(0, -8);
    ctx.fillStyle = C.text;
    if (open) { ctx.fillRect(-4, -37, 7, 6); ctx.fillStyle = C.red; ctx.fillRect(-3, -36, 5, 4); }
    else { ctx.fillRect(-4, -36, 7, 3); ctx.fillStyle = C.win; ctx.fillRect(-3, -35, 5, 1); }
    ctx.restore();
  },
  drawBubble(ctx) {
    const L = this.line, lines = L.lines;
    let w = 0;
    for (const l of lines) w = Math.max(w, G.textW(l));
    w += 14;
    const h = lines.length * 10 + 9;
    let bx, by, virus = L.who === 'virus';
    if (virus) { bx = clamp(L.x - w / 2, 4, 636 - w); by = clamp(L.y - h - 10, 4, 330 - h); }
    else {
      const s = this.scale;
      bx = this.x - 20 * s - w; by = this.y - 28 * s - h - L.dy;
      let tailX = bx + w, dir = 1;
      if (bx < 4) { bx = this.x + 20 * s; tailX = bx - 6; dir = -1; }
      by = clamp(by, 4, 330 - h);
      bx = Math.round(bx); by = Math.round(by);
      // Zipfel
      G.rect(ctx, dir > 0 ? bx + w - 1 : bx - 5, by + h - 13, 6, 5, C.text);
      G.rect(ctx, dir > 0 ? bx + w - 2 : bx - 3, by + h - 12, 5, 3, C.win);
      void tailX;
    }
    bx = Math.round(bx); by = Math.round(by);
    G.box(ctx, bx, by, w, h, virus ? C.text : C.win, virus ? C.orange : C.text);
    if (!virus) G.rect(ctx, bx + w - 2, by + h - 12, 2, 3, C.win);
    let left = Math.floor(L.shown);
    lines.forEach((l, i) => {
      if (left <= 0) return;
      G.text(ctx, l.slice(0, left), bx + 7, by + 6 + i * 10, virus ? C.orange : C.text);
      left -= l.length + 1;
    });
  }
};

// ---------------------------------------------------------------- Desktop
const Desk = {
  chaos: 0, cache: null,
  icons: [['monitor', 'Computer'], ['folder', 'Sachen'], ['trash', 'Papierkorb']],
  draw(ctx, o = {}) {
    if (!this.cache) {
      const c = document.createElement('canvas');
      c.width = G.W; c.height = G.PLAY_H;
      const x = c.getContext('2d');
      x.fillStyle = C.bg; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = C.dot;
      for (let j = 8; j < c.height; j += 16) for (let i = 8; i < c.width; i += 16) x.fillRect(i, j, 2, 2);
      this.cache = c;
    }
    ctx.drawImage(this.cache, 0, 0);
    if (o.icons) {
      this.icons.forEach(([kind, label], i) => {
        const jx = this.chaos ? Math.round(Math.sin(G.t * 5 + i * 2) * 3) : 0;
        const jy = this.chaos ? Math.round(Math.cos(G.t * 4 + i) * 3) : 0;
        Icons.draw(ctx, kind, 36 + jx, 44 + i * 62 + jy);
        G.text(ctx, label, 36 + jx, 62 + i * 62 + jy, C.win, 1, 'center');
      });
    }
    this.taskbar(ctx);
  },
  taskbar(ctx) {
    G.rect(ctx, 0, 336, 640, 24, C.win);
    G.rect(ctx, 0, 336, 640, 1, C.white);
    G.rect(ctx, 0, 337, 640, 1, C.shade);
    G.box(ctx, 3, 340, 70, 17, C.green);
    G.text(ctx, 'KLAMMI OS', 38, 345, C.text, 1, 'center');
    for (let i = 1; i <= G.ORDER.length - 3; i++) {
      const col = i < G.level ? C.green : (i === G.level ? (Math.floor(G.t * 2) % 2 ? C.orange : C.dark) : C.shade);
      G.box(ctx, 70 + i * 16, 344, 12, 10, col);
    }
    const r = G.muteRect;
    G.box(ctx, r.x, r.y, r.w, r.h, G.hit(r) ? C.green : C.win);
    G.sprite(ctx, SPR.speaker, r.x + 5, r.y + 5);
    if (G.muted) G.text(ctx, '×', r.x + 11, r.y + 5, C.red);
    else { G.rect(ctx, r.x + 12, r.y + 7, 1, 3, C.text); G.rect(ctx, r.x + 14, r.y + 6, 1, 5, C.text); }
    const sec = Math.floor(G.playTime);
    G.text(ctx, String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'), 632, 345, C.text, 1, 'right');
  },
  // Kurze Aufgabenzeile oben in der Mitte (auch ohne Ton verständlich)
  info(ctx, text) {
    if (!text) return;
    const w = G.textW(text) + 18, x = Math.round(320 - w / 2);
    G.box(ctx, x, 3, w, 15, C.title);
    G.text(ctx, text, 320, 7, C.green, 1, 'center');
  }
};
