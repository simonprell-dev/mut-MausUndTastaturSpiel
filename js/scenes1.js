'use strict';
// KLAMMI.exe – Titel, Systemstart, Level 1–3 (Maus)

// ---------------------------------------------------------------- Titel
G.scenes.title = () => ({
  btn: { x: 200, y: 232, w: 170, h: 30 },
  about: [
    'Klammi hat aus Versehen CHAOS.EXE gestartet. Jetzt spielt der ganze Computer verrückt!',
    'Hilf beim Aufräumen und lerne dabei, wie man Maus und Tastatur benutzt: klicken, ziehen, tippen, speichern und mehr.',
    'Ein Lernspiel für Kinder ab 8 Jahren. Dauer: etwa 15 Minuten.'
  ],
  enter() {
    G.playTime = 0; Desk.chaos = 0; K.visible = true; K.x = 120; K.y = 266; K.scale = 2; K.pose('idle');
    this.lines = [];
    for (const p of this.about) { for (const l of G.wrap(p, 380)) this.lines.push(l); this.lines.push(''); }
  },
  update() {
    if (G.clicked(this.btn)) {
      A.init(); G.fullscreen(); A.sfx('ok'); G.track('start');
      K.scale = 1;
      const h = (typeof location !== 'undefined' && location.hash || '').slice(1);
      G.go(G.scenes[h] ? h : 'boot');
    }
  },
  draw(ctx) {
    G.text(ctx, 'KLAMMI.exe', 320, 18, C.green, 6, 'center');
    G.text(ctx, 'Chaos im System', 320, 78, C.orange, 2, 'center');
    this.lines.forEach((l, i) => G.text(ctx, l, 200, 118 + i * 11, C.win));
    G.button(ctx, this.btn, 'Spiel starten', { color: C.orange });
    G.text(ctx, 'Mit Ton! Du brauchst Maus und Tastatur.', 200, 272, C.shade);
    G.rect(ctx, 0, 322, 640, 1, C.dot);
    G.text(ctx, 'Ein Lernspiel von ' + G.AUTHOR, 320, 334, C.green, 1, 'center');
  },
  hint() { return { type: 'click', x: this.btn.x + 85, y: this.btn.y + 15 }; }
});

// ---------------------------------------------------------------- Level 0: Systemstart
G.scenes.boot = () => ({
  phase: 'boot', lines: [], pressed: false, warn: false, ready: false,
  win: { x: 356, y: 56, w: 256, h: 116 },
  btn: { x: 424, y: 138, w: 120, h: 24 },
  enter() {
    Desk.chaos = 0; K.visible = false; K.scale = 1;
    G.script(async () => {
      const L = this.lines;
      const type = async txt => {
        const ln = { s: '', c: C.green };
        L.push(ln);
        for (const ch of txt) { ln.s += ch; if (ch !== '.') A.sfx('type'); await G.wait(ch === '.' ? 0.04 : 0.025); }
        return ln;
      };
      await G.wait(0.6);
      await type('KLAMMI OS v1.0');
      await G.wait(0.4);
      for (const name of ['SPEICHERTEST........ ', 'MAUS ERKANNT........ ', 'TASTATUR ERKANNT.... ']) {
        const ln = await type(name);
        await G.wait(0.3);
        ln.s += 'OK'; A.sfx('ok');
        await G.wait(0.35);
      }
      const ln = await type('INTELLIGENZTEST..... ');
      await G.wait(0.6);
      ln.s += 'FEHLER'; ln.c = C.orange; A.sfx('bad');
      await G.wait(0.9);
      ln.s = 'INTELLIGENZTEST..... VIELLEICHT'; ln.c = C.green; A.sfx('pop');
      await G.wait(1.2);

      this.phase = 'desk'; A.sfx('boot');
      await G.wait(1.0);
      K.visible = true; K.x = 320; K.y = -10; K.pose('shocked');
      await G.tween(K, { y: 236 }, 0.6, 'in');
      A.sfx('thud'); G.shake = 5; K.pose('squashed', 0.3);
      await G.wait(0.6);
      await K.say('Aua! Wer stellt denn hier den Boden so hart ein?');
      await K.say('Oh! Hallo! Ich bin Klammi. Dein persönlicher Computerexperte!', { mood: 'happy' });
      this.pressed = true; K.y = 241; A.sfx('alarm'); G.shake = 9; G.rumble = 1.5; Desk.chaos = 1; K.pose('shocked');
      await G.wait(1.1);
      G.rumble = 0;
      await K.say('Ähm.');
      await K.say('Das war schon so.', { mood: 'thinking' });
      this.warn = true; A.sfx('error');
      await K.say('Okay. Vielleicht brauchen wir ein klitzekleines bisschen Hilfe.');
      this.ready = true; G.progress();
    });
  },
  update() {
    if (this.ready && G.clicked(this.btn)) { this.ready = false; A.sfx('ok'); G.go('l1'); }
  },
  draw(ctx) {
    if (this.phase === 'boot') {
      G.rect(ctx, 0, 0, 640, 360, '#000');
      this.lines.forEach((l, i) => G.text(ctx, l.s, 40, 40 + i * 26, l.c, 2));
      const last = this.lines[this.lines.length - 1];
      if (Math.floor(G.t * 3) % 2) G.rect(ctx, 40 + (last ? G.textW(last.s, 2) + 4 : 0), 40 + Math.max(0, this.lines.length - 1) * 26, 10, 14, C.green);
      return;
    }
    Desk.draw(ctx, { icons: true });
    // Der rote Knopf
    G.text(ctx, 'CHAOS.EXE', 320, 262, this.pressed && Math.floor(G.t * 6) % 2 ? C.red : C.orange, 1, 'center');
    G.text(ctx, 'NICHT DRÜCKEN!', 320, 274, C.shade, 1, 'center');
    if (this.pressed) G.box(ctx, 305, 241, 30, 4, C.red); else G.box(ctx, 305, 236, 30, 9, C.red);
    G.box(ctx, 298, 244, 44, 11, C.shade);
    if (this.warn) {
      const w = this.win;
      G.window(ctx, w.x, w.y, w.w, w.h, 'SYSTEMWARNUNG', { bar: C.dark });
      G.sprite(ctx, SPR.warn, w.x + 12, w.y + 24, 2);
      ['CHAOS.EXE wurde gestartet.', 'Das System spielt verrückt!', 'Klammi braucht Hilfe.'].forEach((s, i) => G.text(ctx, s, w.x + 44, w.y + 24 + i * 12));
      G.button(ctx, this.btn, 'Computer retten', { color: this.ready ? C.orange : C.win });
    }
  },
  hint() { return this.ready ? { type: 'click', x: this.btn.x + 60, y: this.btn.y + 12 } : null; }
});

// ---------------------------------------------------------------- Level 1: Cursorjagd
G.scenes.l1 = () => ({
  phase: 'intro', info: '',
  targets: [{ x: 150, y: 100 }, { x: 470, y: 130 }, { x: 290, y: 235 }], ti: 0, dwell: 0,
  bug: { x: -30, y: 100, vx: 55, vy: 40, squash: 0, hop: 0, busy: false },
  spots: [{ x: 130, y: 230 }, { x: 500, y: 80 }, { x: 330, y: 160 }],
  hits: 0, missT: -99, rightT: -99,
  enter() {
    K.home();
    G.script(async () => {
      const b = this.bug;
      b.y = G.mouse.y;
      await G.tween(b, { x: G.mouse.x, y: G.mouse.y }, 0.8, 'lin');
      G.cursor = 'ghost'; A.sfx('steal');
      await G.tween(b, { x: 560, y: 60 }, 0.9);
      await K.say('Das kleine Ding hat unseren Mauszeiger geklaut!', { mood: 'shocked' });
      await K.say('Beweg deine Maus! Ja, die auf dem Tisch. Nicht die im Bildschirm!');
      this.phase = 'A'; this.info = 'Bewege die Maus in den grünen Kreis'; G.progress();
    });
  },
  update(dt) {
    const b = this.bug, m = G.mouse;
    b.squash = Math.max(0, b.squash - dt);
    b.hop = Math.max(0, b.hop - dt);
    if (this.phase === 'A') {
      const t = this.targets[this.ti];
      this.dwell = G.dist(m, t) < 26 ? this.dwell + dt : 0;
      if (this.dwell > 0.25) {
        this.dwell = 0; this.ti++; A.sfx('ok'); G.progress();
        if (this.ti >= 3) {
          this.phase = 'wait'; this.info = '';
          G.script(async () => {
            await K.say('Super! Jetzt schnapp dir den Käfer. Klick ihn an! Mit der linken Maustaste.');
            await K.say('Die linke Taste liegt unter deinem Zeigefinger. Unten links blinkt sie im Bild. Einmal kurz drücken!');
            await G.tween(b, this.spots[0], 0.6);
            this.phase = 'B'; this.info = 'Klicke den Käfer an (linke Maustaste)'; G.progress();
          });
        }
      }
    } else if (this.phase === 'B' || this.phase === 'C') {
      if (this.phase === 'C' && !b.busy) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 30 || b.x > 610) { b.vx *= -1; b.x = clamp(b.x, 30, 610); }
        if (b.y < 40 || b.y > 300) { b.vy *= -1; b.y = clamp(b.y, 40, 300); }
      }
      if (m.pressed && !b.busy) {
        if (G.dist(m, b) < 22) this.hit(); else this.miss();
      }
      if (m.rpressed && G.t - this.rightT > 5) {
        this.rightT = G.t; A.sfx('miss');
        K.say('Das war die rechte Maustaste! Wir brauchen die linke. Die unter deinem Zeigefinger.', { block: false });
      }
    }
  },
  hit() {
    const b = this.bug;
    b.squash = 0.25; A.sfx('hit'); G.progress(); b.busy = true;
    if (this.phase === 'C') {
      this.phase = 'done'; this.info = '';
      G.script(async () => {
        await G.wait(0.4);
        G.cursor = 'arrow'; A.sfx('fanfare');
        await G.tween(b, { x: 700, y: b.y - 40 }, 0.7, 'in');
        await K.say('HA! Erwischt! Du bist offiziell schneller als ein Käfer mit Internetanschluss.', { mood: 'happy' });
        G.next();
      });
      return;
    }
    this.hits++;
    G.script(async () => {
      await G.wait(0.3);
      if (this.hits < 3) { await G.tween(b, this.spots[this.hits], 0.5); b.busy = false; return; }
      await G.tween(b, { x: 320, y: 120 }, 0.5);
      K.say('Achtung, jetzt krabbelt er los! Einmal noch!', { block: false });
      this.phase = 'C'; this.info = 'Der Käfer läuft weg! Klicke ihn noch einmal an';
      b.busy = false; G.progress();
    });
  },
  miss() {
    A.sfx('miss'); this.bug.hop = 0.4;
    if (G.t - this.missT > 7) { this.missT = G.t; K.say('Fast! Der Käfer hat jetzt allerdings sehr gute Laune.', { block: false }); }
  },
  draw(ctx) {
    Desk.draw(ctx, { icons: true });
    if (this.phase === 'A') {
      this.targets.forEach((t, i) => {
        if (i < this.ti) { G.ring(ctx, t.x, t.y, 24, C.dim); G.text(ctx, '✓', t.x, t.y - 7, C.green, 2, 'center'); }
        else if (i === this.ti) {
          G.ring(ctx, t.x, t.y, 24 + Math.round(Math.sin(G.t * 6) * 2), C.green, 3);
          G.text(ctx, 'Hierher!', t.x, t.y - 4, C.green, 1, 'center');
        }
      });
    }
    const b = this.bug;
    const hop = b.hop > 0 ? -Math.round(Math.abs(Math.sin(b.hop * 16)) * 8) : Math.round(Math.sin(G.t * 12));
    if (b.squash > 0) {
      ctx.save(); ctx.translate(Math.round(b.x), Math.round(b.y + 8)); ctx.scale(1.3, 0.45);
      G.sprite(ctx, SPR.bug, -12, -18, 2, false, LINE_PAL);
      ctx.restore();
    } else G.sprite(ctx, SPR.bug, b.x - 12, b.y - 10 + hop, 2, false, LINE_PAL);
    if (G.cursor === 'ghost') G.sprite(ctx, CURSOR, b.x + 4, b.y - 24 + hop);
    if (this.phase === 'B' || this.phase === 'C') {
      Icons.mouse(ctx, 44, 268, 'left');
      G.text(ctx, 'Linke Maustaste', 48, 298, C.green, 1, 'center');
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    if (this.phase === 'A') { const t = this.targets[this.ti]; return { type: 'hover', x: t.x, y: t.y }; }
    if ((this.phase === 'B' || this.phase === 'C') && !this.bug.busy) return { type: 'click', x: this.bug.x, y: this.bug.y };
    return null;
  }
});

// ---------------------------------------------------------------- Level 2: Doppelklick-Disko
G.scenes.l2 = () => ({
  phase: 'intro', info: '',
  folders: [{ x: 170, y: 150 }, { x: 320, y: 150 }, { x: 470, y: 150 }].map(f => Object.assign(f, { open: false })),
  sel: -1, lastT: -9, slow: 0, count: 0, win: null, disco: false,
  enter() {
    K.home(); A.music = 'disco';
    G.script(async () => {
      await K.say('In einem dieser Ordner liegt der Systemschlüssel. Aber ich kriege sie nicht auf!', { mood: 'thinking' });
      await K.say('Ein Klick bedeutet: Hallo, Ordner!');
      this.phase = 'select'; this.info = 'Klicke einmal auf einen Ordner'; G.progress();
    });
  },
  at() { return this.folders.findIndex(f => !f.open && Math.abs(G.mouse.x - f.x) < 24 && Math.abs(G.mouse.y - f.y) < 26); },
  keyRect() { return { x: this.win.x + 85, y: this.win.y + 70, w: 70, h: 40 }; },
  update() {
    const m = G.mouse;
    if (!m.pressed) return;
    if (this.win) {
      if (this.win.kind === 'key') {
        if (G.hit(this.keyRect())) {
          this.phase = 'done'; this.info = ''; this.win.taken = true; A.sfx('fanfare'); G.progress(); A.music = null;
          G.script(async () => {
            await K.say('Fantastisch. Du kannst jetzt Türen öffnen, die gar keine Türen sind.', { mood: 'victory' });
            G.next();
          });
        }
      } else if (G.hit(G.closeRect(this.win))) {
        this.win = null; A.sfx('pop'); G.progress();
        this.info = 'Doppelklick: zweimal schnell klicken';
      }
      return;
    }
    const i = this.at();
    if (i < 0) return;
    if (this.phase === 'select') {
      this.sel = i; A.sfx('click'); this.phase = 'wait'; this.info = '';
      G.script(async () => {
        await K.say('Zwei schnelle Klicks bedeuten: MACH AUF!');
        this.phase = 'open'; this.info = 'Doppelklick: zweimal schnell klicken'; this.lastT = -9; G.progress();
      });
    } else if (this.phase === 'open') {
      if (this.sel === i && G.t - this.lastT < 0.7) this.open(i);
      else {
        this.sel = i; this.lastT = G.t; A.sfx('click');
        if (++this.slow % 5 === 0) K.say('Schneller! Klick-klick! Wie ein Specht mit Termindruck.', { block: false });
      }
    }
  },
  open(i) {
    this.folders[i].open = true; this.sel = -1; this.slow = 0; A.sfx('ok'); G.progress();
    const kind = ['potato', 'disco', 'key'][this.count++];
    this.win = { kind, x: 200, y: 56, w: 240, h: 170 };
    if (kind === 'potato') {
      K.say('Warum tanzt da eine Kartoffel? Egal. Sie hat Talent.', { block: false });
      this.info = 'Schließe das Fenster: Klicke oben rechts auf das ×';
    } else if (kind === 'disco') {
      this.disco = true;
      K.say('Ein Discokugel-Generator! Den suche ich seit Jahren.', { block: false });
      this.info = 'Schließe das Fenster: Klicke oben rechts auf das ×';
    } else {
      K.say('Der Systemschlüssel! Schnapp ihn dir!', { block: false, mood: 'happy' });
      this.info = 'Klicke auf den Schlüssel';
    }
  },
  draw(ctx) {
    Desk.draw(ctx);
    if (this.disco) {
      const cols = [C.green, C.orange, C.white, C.dark];
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 14; i++)
        G.disc(ctx, 320 + Math.sin(G.t * 0.9 + i * 1.7) * 290, 168 + Math.cos(G.t * 1.3 + i * 2.3) * 150, 7, cols[i % 4]);
      ctx.globalAlpha = 1;
    }
    this.folders.forEach((f, i) => {
      const hop = f.open ? 0 : -Math.round(Math.abs(Math.sin(G.t * Math.PI * 2 + i)) * 7);
      Icons.draw(ctx, 'folder', f.x, f.y + hop, { open: f.open, sel: this.sel === i });
      G.text(ctx, 'Ordner ' + (i + 1), f.x, f.y + 22, this.sel === i ? C.green : C.win, 1, 'center');
    });
    const w = this.win;
    if (w) {
      const title = { potato: 'KARTOFFEL.EXE', disco: 'DISCO-GENERATOR', key: 'SYSTEMSCHLÜSSEL' }[w.kind];
      G.window(ctx, w.x, w.y, w.w, w.h, title, { close: w.kind !== 'key' });
      const cx = w.x + w.w / 2, cy = w.y + 92;
      if (w.kind === 'potato') {
        const hop = -Math.round(Math.abs(Math.sin(G.t * Math.PI * 2)) * 12), lean = Math.round(Math.sin(G.t * Math.PI * 2) * 6);
        G.rect(ctx, cx - 8 + lean / 2, cy + 10 + hop, 3, 12 - hop, C.text); G.rect(ctx, cx + 5 + lean / 2, cy + 10 + hop, 3, 12 - hop, C.text);
        Icons.draw(ctx, 'potato', cx + lean, cy + hop);
        G.rect(ctx, cx - 30, cy + 22, 60, 2, C.shade);
      } else if (w.kind === 'disco') {
        G.rect(ctx, w.x + 1, w.y + 14, w.w - 2, w.h - 15, C.title);
        Icons.draw(ctx, 'disco', cx, cy - 8);
        G.text(ctx, 'Disco-Modus: AN', cx, cy + 40, C.green, 1, 'center');
      } else if (!w.taken) {
        const r = this.keyRect();
        if (G.hit(r)) G.box(ctx, r.x, r.y, r.w, r.h, C.green);
        Icons.draw(ctx, 'key', cx, cy + Math.round(Math.sin(G.t * 4) * 2));
      } else G.text(ctx, 'Schlüssel eingesammelt ✓', cx, cy, C.text, 1, 'center');
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    const w = this.win;
    if (w) {
      if (w.kind === 'key') return w.taken ? null : { type: 'click', x: w.x + 120, y: w.y + 90 };
      const r = G.closeRect(w);
      return { type: 'click', x: r.x + 6, y: r.y + 5 };
    }
    const f = this.folders.find(f => !f.open);
    if (!f) return null;
    if (this.phase === 'select') return { type: 'click', x: f.x, y: f.y };
    if (this.phase === 'open') return { type: 'dbl', x: f.x, y: f.y };
    return null;
  }
});

// ---------------------------------------------------------------- Level 3: Das große Datei-Chaos
G.scenes.l3 = () => ({
  phase: 'intro', info: '',
  items: [
    { k: 'banana', cat: 'trash', hx: 230, hy: 74 }, { k: 'note', cat: 'music', hx: 340, hy: 124 },
    { k: 'pic', cat: 'pics', hx: 460, hy: 66 }, { k: 'sock', cat: 'trash', hx: 548, hy: 150 },
    { k: 'pic', cat: 'pics', hx: 262, hy: 204 }, { k: 'note', cat: 'music', hx: 420, hy: 212 }
  ],
  targets: [
    { cat: 'music', label: 'Musik', icon: 'note', x: 76, y: 66, n: 0, bump: 0 },
    { cat: 'pics', label: 'Bilder', icon: 'pic', x: 76, y: 156, n: 0, bump: 0 },
    { cat: 'trash', label: 'Papierkorb', icon: 'trash', x: 76, y: 246, n: 0, bump: 0 }
  ],
  drag: null, done: 0, saidDrag: false, taps: 0, wrongT: -99,
  enter() {
    K.home();
    this.items.forEach((it, i) => { it.x = 400 + (i % 2) * 6; it.y = 190 - i * 18; it.done = false; it.s = 1; });
    G.script(async () => {
      await K.say('Ich habe aufgeräumt!', { mood: 'happy' });
      A.sfx('thud'); G.shake = 6;
      await Promise.all(this.items.map(it => G.tween(it, { x: it.hx, y: it.hy }, 0.8, 'bounce')));
      await K.say('Vielleicht war Aufräumen das falsche Wort.', { mood: 'thinking' });
      await K.say('Zieh die Dateien in den richtigen Ordner! Maustaste drücken, festhalten, ziehen, loslassen.');
      this.phase = 'play'; this.info = 'Ziehe jedes Ding in den passenden Ordner'; G.progress();
    });
  },
  targetAt(p) { return this.targets.find(t => Math.abs(p.x - t.x) < 40 && Math.abs(p.y - t.y) < 40); },
  update(dt) {
    const m = G.mouse;
    for (const t of this.targets) t.bump = Math.max(0, t.bump - dt);
    if (this.phase !== 'play') return;
    if (m.pressed && !this.drag) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        if (!it.done && !it.busy && Math.abs(m.x - it.x) < 18 && Math.abs(m.y - it.y) < 18) {
          this.drag = { it, ox: it.x - m.x, oy: it.y - m.y, sx: it.x, sy: it.y, t: G.t };
          this.items.splice(i, 1); this.items.push(it);
          A.sfx('click');
          if (!this.saidDrag) { this.saidDrag = true; K.say('Festhalten! Nicht loslassen! Du entführst gerade eine Datei.', { block: false }); }
          break;
        }
      }
    }
    const d = this.drag;
    if (d) {
      d.it.x = clamp(m.x + d.ox, 14, 626); d.it.y = clamp(m.y + d.oy, 14, 320);
      if (!m.down) {
        this.drag = null;
        const it = d.it, t = this.targetAt(m);
        const moved = Math.hypot(it.x - d.sx, it.y - d.sy);
        if (t && t.cat === it.cat) {
          it.done = true; t.n++; t.bump = 0.3; this.done++; A.sfx('ok'); G.progress();
          G.tween(it, { x: t.x, y: t.y, s: 0 }, 0.25);
          if (this.done >= 6) {
            this.phase = 'done'; this.info = '';
            G.script(async () => {
              await G.wait(0.4); A.sfx('fanfare');
              await K.say('Sechs Dateien sortiert! Ich würde sagen: Beförderung zum Chef des Aufräumens!', { mood: 'victory' });
              G.next();
            });
          }
        } else if (t) {
          A.sfx('bad'); it.busy = true;
          G.tween(it, { x: d.sx, y: d.sy }, 0.6, 'elastic').then(() => { it.busy = false; });
          if (G.t - this.wrongT > 5) {
            this.wrongT = G.t;
            const what = { banana: 'Eine Banane', sock: 'Eine Socke', note: 'Musik', pic: 'Ein Bild' }[it.k];
            K.say(what + ' gehört da nicht rein. Glaub mir, ich hab es selbst ausprobiert.', { block: false });
          }
        } else if (moved < 5 && G.t - d.t < 0.4 && ++this.taps % 2 === 0) {
          K.say('Nicht nur klicken! Gedrückt halten und ziehen.', { block: false });
        }
      }
    }
  },
  draw(ctx) {
    Desk.draw(ctx);
    const over = this.drag && this.targetAt(G.mouse);
    for (const t of this.targets) {
      const b = t.bump > 0 ? 3 : 0;
      G.box(ctx, t.x - 34 - b, t.y - 34 - b, 68 + b * 2, 68 + b * 2, C.title, over === t ? C.green : C.shade);
      Icons.draw(ctx, 'folder', t.x, t.y - 8, { open: true });
      Icons.draw(ctx, t.icon, t.x + 18, t.y - 18);
      G.text(ctx, t.label, t.x, t.y + 12, C.win, 1, 'center');
      G.text(ctx, t.n + ' von 2', t.x, t.y + 23, t.n >= 2 ? C.green : C.shade, 1, 'center');
    }
    const d = this.drag;
    if (d) { ctx.globalAlpha = 0.3; Icons.draw(ctx, d.it.k, d.sx, d.sy); ctx.globalAlpha = 1; }
    for (const it of this.items) {
      if (it.s <= 0.05) continue;
      if (d && d.it === it) ctx.globalAlpha = 0.8;
      if (it.s < 1) {
        ctx.save(); ctx.translate(Math.round(it.x), Math.round(it.y)); ctx.scale(it.s, it.s);
        Icons.draw(ctx, it.k, 0, 0); ctx.restore();
      } else Icons.draw(ctx, it.k, it.x, it.y);
      ctx.globalAlpha = 1;
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    if (this.phase !== 'play') return null;
    const it = this.items.find(i => !i.done && !i.busy);
    if (!it) return null;
    const t = this.targets.find(t => t.cat === it.cat);
    return { type: 'drag', x1: it.x, y1: it.y, x2: t.x, y2: t.y };
  }
});

// ---------------------------------------------------------------- Fenster-Level: Die Schatzkarte
G.scenes.lf = () => ({
  phase: 'intro', info: '', shown: false, state: 'normal', busy: false, found: false, wrongT: -99,
  cur: { x: 270, y: 160, w: 20, h: 20 },
  norm: { x: 150, y: 60, w: 260, h: 210 }, full: { x: 0, y: 0, w: 640, h: 336 },
  tab: { x: 272, y: 340, w: 104, h: 17 },
  chest: { x: 520, y: 196 },
  enter() {
    K.home(); K.x = 280; K.y = 250;
    G.script(async () => {
      await K.say('Ich zeige dir meine Schatzkarte! Moment, ich mache das Fenster auf …', { mood: 'happy' });
      this.shown = true;
      await G.tween(this.cur, this.norm, 0.5, 'bounce');
      A.sfx('thud'); G.shake = 5; K.visible = false;
      await K.say('Mmpf! Es ist auf mich draufgefallen! Ich klemme fest!');
      await K.say('Mach das Fenster klein! Oben rechts, der kleine Strich.');
      this.phase = 'min'; this.info = 'Klicke oben rechts auf den Strich: Fenster klein machen'; G.progress();
    });
  },
  btn(i) { const c = this.cur; return { x: c.x + c.w - 43 + i * 14, y: c.y + 2, w: 12, h: 11 }; },
  chestRect() { return { x: this.cur.x + 1 + this.chest.x - 18, y: this.cur.y + 14 + this.chest.y - 16, w: 36, h: 30 }; },
  async anim(to) { this.busy = true; await G.tween(this.cur, to, 0.35); this.busy = false; },
  wrong(text) {
    A.sfx('miss');
    if (G.t - this.wrongT > 4) { this.wrongT = G.t; K.say(text, { block: false }); }
  },
  update() {
    if (this.busy || !G.mouse.pressed) return;
    const p = this.phase, hit = i => this.state !== 'min' && G.hit(this.btn(i));
    if (p === 'min' || p === 'max' || p === 'shrink') {
      const want = p === 'min' ? 0 : 1;
      if (hit(2)) return this.wrong('Nicht das Kreuz! Dann ist das Fenster ganz zu. Wir brauchen es noch.');
      if (hit(1 - want)) return this.wrong(want === 0 ? 'Das macht es noch größer! Hilfe! Nimm den Strich.' : 'Nicht verstecken! Nimm das Kästchen in der Mitte.');
      if (!hit(want)) return;
      A.sfx('pop'); G.progress(); this.phase = 'wait'; this.info = '';
      G.script(async () => {
        if (p === 'min') {
          await this.anim(this.tab); this.state = 'min';
          K.visible = true; K.pose('happy', 1.2);
          await G.tween(K, { x: 604, y: 332 }, 0.6);
          await K.say('Puh! Frei! Das Fenster ist nicht weg. Es wartet unten in der Leiste.');
          this.phase = 'restore'; this.info = 'Klicke unten in der Leiste auf SCHATZKARTE'; G.progress();
          K.say('Hol es wieder her: Klick unten in der Leiste auf SCHATZKARTE!', { block: false });
        } else if (p === 'max') {
          await this.anim(this.full); this.state = 'max';
          this.phase = 'treasure'; this.info = 'Klicke auf die Schatztruhe'; G.progress();
          K.say('Riesig! Jetzt sieht man die ganze Karte. Da ist die Truhe! Klick sie an!', { block: false });
        } else {
          await this.anim(this.norm); this.state = 'normal';
          A.sfx('fanfare');
          await K.say('Klein, groß, weg, wieder da. Du hast die Fenster im Griff!', { mood: 'victory' });
          G.next();
        }
      });
    } else if (p === 'restore' && G.hit(this.tab)) {
      A.sfx('pop'); G.progress(); this.phase = 'wait'; this.info = ''; this.state = 'normal';
      G.script(async () => {
        await this.anim(this.norm);
        this.phase = 'max'; this.info = 'Klicke auf das Kästchen: Fenster groß machen'; G.progress();
        K.say('Da ist sie wieder! Aber der Schatz liegt weiter rechts. Mach das Fenster groß: das Kästchen in der Mitte!', { block: false });
      });
    } else if (p === 'treasure' && G.hit(this.chestRect())) {
      this.found = true; A.sfx('fanfare'); G.progress(); this.phase = 'wait'; this.info = '';
      const r = this.chestRect(); G.confetti(r.x + 18, r.y + 10, 40);
      G.script(async () => {
        await K.say('Ein Schatz! Es sind … Büroklammern. Meine Familie!', { mood: 'happy' });
        this.phase = 'shrink'; this.info = 'Klicke wieder auf das Kästchen: Fenster kleiner machen'; G.progress();
        K.say('Jetzt mach das Fenster wieder kleiner. Nochmal dasselbe Kästchen!', { block: false });
      });
    }
  },
  draw(ctx) {
    Desk.draw(ctx, { icons: true });
    const blink = Math.floor(G.t * 3) % 2, c = this.cur, t = this.tab;
    if (this.shown) {
      const lit = this.phase === 'restore' && blink;
      G.box(ctx, t.x, t.y, t.w, t.h, lit ? C.green : this.state === 'min' ? C.win : C.shade);
      G.text(ctx, 'SCHATZKARTE', t.x + t.w / 2, t.y + 5, C.text, 1, 'center');
    }
    if (!this.shown || (this.state === 'min' && !this.busy)) { Desk.info(ctx, this.info); return; }
    if (c.w < 130) { G.box(ctx, c.x, c.y, c.w, c.h, C.win); G.rect(ctx, c.x + 1, c.y + 1, c.w - 2, Math.min(13, c.h - 2), C.title); Desk.info(ctx, this.info); return; }
    G.window(ctx, c.x, c.y, c.w, c.h, 'SCHATZKARTE.BMP', { bg: C.title });
    // Karte
    ctx.save();
    ctx.beginPath(); ctx.rect(Math.round(c.x) + 1, Math.round(c.y) + 14, Math.round(c.w) - 2, Math.round(c.h) - 15); ctx.clip();
    const ox = Math.round(c.x) + 1, oy = Math.round(c.y) + 14;
    for (let i = 0; i < 30; i++) G.rect(ctx, ox + (i * 83) % 630, oy + 14 + (i * 47) % 300 + Math.round(Math.sin(G.t * 2 + i)), 8, 1, '#3A4470');
    G.disc(ctx, ox + 90, oy + 86, 54, C.dim); G.disc(ctx, ox + 90, oy + 84, 50, C.green);
    G.disc(ctx, ox + 310, oy + 200, 62, C.dim); G.disc(ctx, ox + 310, oy + 198, 58, C.green);
    G.disc(ctx, ox + 520, oy + 190, 58, C.dim); G.disc(ctx, ox + 520, oy + 188, 54, C.green);
    const pts = [[90, 86], [310, 198], [this.chest.x, this.chest.y]];
    for (let s = 0; s < 2; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1], n = Math.floor(Math.hypot(bx - ax, by - ay) / 14);
      for (let i = 1; i < n; i++) G.rect(ctx, ox + ax + (bx - ax) * i / n - 2, oy + ay + (by - ay) * i / n - 2, 4, 4, C.text);
    }
    G.rect(ctx, ox + 88, oy + 58, 2, 30, C.text); G.rect(ctx, ox + 90, oy + 58, 14, 9, C.red);
    G.text(ctx, 'START', ox + 90, oy + 96, C.text, 1, 'center');
    G.box(ctx, ox + 100, oy + 150, 140, 17, C.win);
    G.text(ctx, 'Schatz: weiter rechts →', ox + 170, oy + 155, C.text, 1, 'center');
    const cx = ox + this.chest.x, cy = oy + this.chest.y;
    if (this.phase === 'treasure' && blink) G.ring(ctx, cx, cy, 24, C.white);
    G.box(ctx, cx - 14, cy - 6, 28, 16, C.dark);
    if (this.found) { G.box(ctx, cx - 14, cy - 20, 28, 8, C.orange); G.rect(ctx, cx - 10, cy - 10, 20, 5, C.win); G.text(ctx, 'gefunden ✓', cx, cy + 16, C.text, 1, 'center'); }
    else { G.box(ctx, cx - 14, cy - 12, 28, 8, C.orange); G.rect(ctx, cx - 2, cy - 7, 4, 6, C.text); }
    ctx.restore();
    // Fensterknöpfe: Strich, Kästchen, Kreuz
    const want = this.phase === 'min' ? 0 : (this.phase === 'max' || this.phase === 'shrink') ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const r = this.btn(i);
      G.box(ctx, r.x, r.y, r.w, r.h, G.hit(r) ? C.orange : (i === want && blink ? C.green : C.win));
      if (i === 0) G.rect(ctx, r.x + 3, r.y + 7, 6, 2, C.text);
      else if (i === 1) {
        if (this.state === 'max') { G.box(ctx, r.x + 4, r.y + 2, 6, 5, C.win); G.box(ctx, r.x + 2, r.y + 4, 6, 5, C.win); }
        else { G.box(ctx, r.x + 2, r.y + 2, 8, 7, C.win); G.rect(ctx, r.x + 2, r.y + 2, 8, 2, C.text); }
      } else G.text(ctx, '×', r.x + 3, r.y + 2, C.text);
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    if (this.busy) return null;
    const mid = r => ({ type: 'click', x: r.x + r.w / 2, y: r.y + r.h / 2 });
    if (this.phase === 'min') return mid(this.btn(0));
    if (this.phase === 'restore') return mid(this.tab);
    if (this.phase === 'max' || this.phase === 'shrink') return mid(this.btn(1));
    if (this.phase === 'treasure') return mid(this.chestRect());
    return null;
  }
});
