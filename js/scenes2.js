'use strict';
// KLAMMI.exe – Level 4–5 (Tastatur)

// ---------------------------------------------------------------- Level 4: Buchstabensalat
G.scenes.l4 = () => ({
  phase: 'intro', info: '',
  win: { x: 40, y: 24, w: 440, h: 262 },
  letters: ['M', 'A', 'S', 'K', 'I'], ai: 0,
  words: ['MAUS', 'PIZZA', 'KLAMMI'], wi: 0, typed: '',
  target: 'REPARATUR', lock: 0, wrong: 0, flash: null, log: [], fly: [], saidBack: false,
  rows: ['QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNM'],
  enter() {
    K.home();
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';
    for (let i = 0; i < 34; i++) this.fly.push({ ch: abc[i % abc.length], x: rnd(10, 620), y: rnd(10, 320), vx: rnd(-50, 50), vy: rnd(-40, 40), a: 1 });
    this.log.push('> REPARATUR.EXE bereit');
    G.script(async () => {
      await K.say('Die Buchstaben machen sich selbstständig!', { mood: 'panic' });
      await K.say('Wir fangen sie mit der Tastatur wieder ein. Such die richtige Taste!');
      this.phase = 'A'; this.info = 'Drücke die angezeigte Taste auf der Tastatur'; G.progress();
      K.say('Drück das M! Das ist dieses Ding mit den drei Bergen!', { block: false });
    });
  },
  keyRect(ch) {
    const kx = this.win.x + 71, ky = this.win.y + 170;
    if (ch === 'Backspace') return { x: kx + 264, y: ky, w: 34, h: 18 };
    for (let i = 0; i < 3; i++) {
      const j = this.rows[i].indexOf(ch);
      if (j >= 0) return { x: kx + j * 24 + [0, 8, 20][i], y: ky + i * 20, w: 22, h: 18 };
    }
    return null;
  },
  want() {
    if (this.lock > 0) return null;
    if (this.phase === 'A') return this.letters[this.ai];
    if (this.phase === 'B') return this.words[this.wi][this.typed.length];
    if (this.phase === 'C') return this.typed.length > 8 ? 'Backspace' : 'R';
    return null;
  },
  bad(key) {
    A.sfx('bad'); this.flash = { key, t: 0.35 };
    if (++this.wrong % 4 === 0) K.say('Fast! Such weiter. Die Taste versteckt sich nur.', { block: false });
  },
  update(dt) {
    for (const f of this.fly) {
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 4 || f.x > 626) f.vx *= -1;
      if (f.y < 4 || f.y > 322) f.vy *= -1;
    }
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    if (this.lock > 0) { this.lock -= dt; return; }
    for (const k of G.keysPressed) {
      const want = this.want();
      if (!want) break;
      const ch = k.length === 1 ? k.toUpperCase() : k;
      if (ch.length !== 1 && ch !== 'Backspace') continue;
      if (ch === ' ') continue;
      if (this.phase === 'A') {
        if (ch !== want) { this.bad(ch); continue; }
        A.sfx('ok'); G.progress(); this.log.push('> Taste ' + ch + ' eingefangen');
        this.fly.splice(0, 3);
        if (++this.ai >= this.letters.length) {
          this.phase = 'B'; this.lock = 0.5; this.info = 'Tippe das Wort. Ohne Eile!';
          K.say('Fünf von fünf! Jetzt ganze Wörter. Buchstabe für Buchstabe.', { block: false });
        }
      } else if (this.phase === 'B') {
        if (ch !== want) { this.bad(ch); continue; }
        this.typed += ch; A.sfx('type'); G.progress();
        const word = this.words[this.wi];
        if (this.typed === word) {
          A.sfx('ok'); this.log.push('> ' + word + ' OK'); this.fly.splice(0, 4);
          this.lock = 0.7;
          if (word === 'PIZZA') K.say('PIZZA? Hast du gerade Essen bestellt? Ohne mich?!', { block: false, mood: 'shocked' });
          this.wi++; this.typed = '';
          if (this.wi >= this.words.length) this.startC();
        }
      } else if (this.phase === 'C') {
        if (ch === 'Backspace') {
          if (this.typed.length > 8) {
            this.typed = this.typed.slice(0, -1); A.sfx('pop'); G.progress();
            if (!this.saidBack) {
              this.saidBack = true;
              K.say('Oh! Diese Taste löscht Fehler? Wo war die eigentlich mein ganzes Leben lang?', { block: false, mood: 'happy' });
            }
          }
        } else if (want === 'R' && ch === 'R') {
          this.typed += 'R'; A.sfx('ok'); G.progress(); this.finish();
        } else this.bad(ch);
      }
    }
  },
  startC() {
    this.phase = 'wait'; this.info = '';
    G.script(async () => {
      await G.wait(0.8);
      await K.say('Jetzt der Reparaturbefehl! Den tippe ich. Ich bin schließlich Profi.');
      this.phase = 'show';
      for (const ch of 'REPARATUX') { this.typed += ch; A.sfx('type'); await G.wait(0.16); }
      A.sfx('bad');
      await K.say('Ups. Das X war ein Versehen. Die Tastatur hat gewackelt.', { mood: 'shocked' });
      this.phase = 'C'; this.info = 'Lösche das X mit der Löschtaste. Tippe dann ein R'; G.progress();
      K.say('Lösch den Fehler mit der Löschtaste! Das ist die mit dem Pfeil, oben rechts.', { block: false });
    });
  },
  finish() {
    this.phase = 'done'; this.info = '';
    this.log.push('> REPARATUR gestartet ... OK');
    G.script(async () => {
      await Promise.all(this.fly.map(f => G.tween(f, { x: 260, y: 150, a: 0 }, 0.7)));
      this.fly = []; A.sfx('fanfare');
      await K.say('Alle Buchstaben sind wieder da! Sogar das Ypsilon. Das wollte eigentlich in den Urlaub.', { mood: 'victory' });
      G.next();
    });
  },
  draw(ctx) {
    Desk.draw(ctx);
    for (const f of this.fly) { ctx.globalAlpha = f.a; G.text(ctx, f.ch, f.x, f.y, C.orange, 2); }
    ctx.globalAlpha = 1;
    const w = this.win;
    G.window(ctx, w.x, w.y, w.w, w.h, 'TERMINAL', { bg: C.term });
    this.log.slice(-3).forEach((l, i) => G.text(ctx, l, w.x + 10, w.y + 22 + i * 11, C.dim));
    const cx = w.x + w.w / 2, cy = w.y + 74;
    const blink = Math.floor(G.t * 3) % 2;
    if (this.phase === 'A') {
      G.text(ctx, 'Drücke die Taste:', cx, cy - 6, C.green, 1, 'center');
      G.text(ctx, this.letters[this.ai], cx, cy + 12, C.green, 7, 'center');
    } else if (this.phase === 'B' && this.wi < this.words.length) {
      const word = this.words[this.wi];
      G.text(ctx, 'Tippe das Wort:', cx, cy - 6, C.green, 1, 'center');
      let x = cx - G.textW(word, 4) / 2;
      for (let i = 0; i < word.length; i++) {
        G.text(ctx, word[i], x, cy + 20, i < this.typed.length ? C.green : C.dim, 4);
        if (i === this.typed.length && blink) G.rect(ctx, x, cy + 52, 20, 3, C.green);
        x += (glyphOf(word[i]).w + 1) * 4;
      }
    } else if (this.phase === 'show' || this.phase === 'C' || this.phase === 'done') {
      G.text(ctx, 'Befehl:  (richtig wäre REPARATUR)', cx, cy - 6, C.green, 1, 'center');
      const s = '> ' + this.typed, x = cx - G.textW('> REPARATUR', 3) / 2;
      G.text(ctx, s.slice(0, 10), x, cy + 22, C.green, 3);
      if (this.typed.length > 8) G.text(ctx, this.typed.slice(8), x + G.textW(s.slice(0, 10), 3) + 3, cy + 22, C.orange, 3);
      if (blink && this.phase !== 'done') G.rect(ctx, x + G.textW(s, 3) + 4, cy + 22, 12, 21, C.green);
    }
    // Bildschirmtastatur
    const want = this.want();
    const drawKey = (id, label) => {
      const r = this.keyRect(id);
      const hot = id === want, bad = this.flash && this.flash.key === id;
      G.box(ctx, r.x, r.y, r.w, r.h, bad ? C.orange : hot ? C.green : C.title, hot || bad ? C.white : C.shade);
      G.text(ctx, label, r.x + r.w / 2, r.y + 5, hot || bad ? C.text : C.win, 1, 'center');
    };
    for (const row of this.rows) for (const ch of row) drawKey(ch, ch);
    drawKey('Backspace', '←');
    G.text(ctx, 'Löschtaste', this.keyRect('Backspace').x + 17, w.y + 160, want === 'Backspace' ? C.green : C.dim, 1, 'center');
    Desk.info(ctx, this.info);
  },
  hint() { const k = this.want(); return k ? { type: 'key', key: k } : null; }
});

// ---------------------------------------------------------------- Level 5: Tastatur-Turbo
G.scenes.l5 = () => ({
  phase: 'intro', info: '',
  win: { x: 20, y: 24, w: 600, h: 244 },
  r: { x: 40, y: 166, w: 12, h: 14, vx: 0, vy: 0, ground: false, face: 1, coy: 0 },
  cam: 0, pudT: 0, pudSaid: false, upSaid: false, chipY: 0, installed: false,
  solids: [
    { x: -60, y: 180, w: 480, h: 90, k: 'ground' }, { x: 250, y: 164, w: 18, h: 16, k: 'crate' },
    { x: 466, y: 180, w: 560, h: 90, k: 'ground' }, { x: 660, y: 154, w: 22, h: 26, k: 'crate' },
    { x: -20, y: -200, w: 20, h: 500, k: 'wall' }, { x: 960, y: -200, w: 20, h: 500, k: 'wall' }
  ],
  enter() {
    K.home();
    G.script(async () => {
      await K.say('Das ist unser Reparaturroboter. Modell: ziemlich günstig.');
      await K.say('Mit den Pfeiltasten lenkst du ihn.');
      await K.say('Und mit der Leertaste …');
      this.r.vy = -235; this.r.ground = false; A.sfx('jump');
      await G.wait(0.9);
      await K.say('… kann er fliegen! Also ganz kurz.', { mood: 'happy' });
      this.phase = 'play'; this.info = 'Bring den Chip nach rechts zur Maschine'; G.progress();
    });
  },
  physics(dt, input) {
    const r = this.r;
    let mv = 0;
    if (input) { if (G.held.ArrowLeft) mv -= 1; if (G.held.ArrowRight) mv += 1; }
    r.vx = mv * 110;
    if (mv) r.face = mv;
    r.coy = r.ground ? 0.1 : r.coy - dt;
    if (input && G.keysPressed.includes(' ') && r.coy > 0) {
      r.vy = -235; r.coy = 0; r.ground = false; A.sfx('jump'); G.progress();
    }
    r.vy = Math.min(420, r.vy + 640 * dt);
    const ov = s => r.x < s.x + s.w && r.x + r.w > s.x && r.y < s.y + s.h && r.y + r.h > s.y;
    r.x += r.vx * dt;
    for (const s of this.solids) if (ov(s)) { if (r.vx > 0) r.x = s.x - r.w; else if (r.vx < 0) r.x = s.x + s.w; }
    r.y += r.vy * dt; r.ground = false;
    for (const s of this.solids) if (ov(s)) {
      if (r.vy > 0) { r.y = s.y - r.h; r.ground = true; } else r.y = s.y + s.h;
      r.vy = 0;
    }
  },
  update(dt) {
    const r = this.r;
    this.hopT = Math.max(0, (this.hopT || 0) - dt);
    if (this.phase === 'intro') this.physics(dt, false);
    else if (this.phase === 'play') {
      if (G.keysPressed.includes('ArrowUp') && !this.upSaid) {
        this.upSaid = true;
        K.say('Springen geht mit der Leertaste! Das ist die lange Taste ganz unten.', { block: false });
      }
      if (G.held.ArrowLeft || G.held.ArrowRight) G.progress();
      this.physics(dt, true);
      if (r.y > 198) {
        this.phase = 'pud'; this.pudT = 1.1; A.sfx('blub');
        if (!this.pudSaid) { this.pudSaid = true; K.say('Wackelpudding! Zum Glück ist der weich. Und lecker.', { block: false }); }
      } else if (r.x >= 872 && r.ground) {
        this.phase = 'code'; this.info = 'Drücke ENTER zum Bestätigen'; r.vx = 0; G.progress();
        K.say('Angekommen! Bestätige den Code mit der Enter-Taste. Die große Taste rechts.', { block: false });
      }
    } else if (this.phase === 'pud') {
      r.y = Math.min(214, r.y + 30 * dt);
      if ((this.pudT -= dt) <= 0) { r.x = 384; r.y = 166; r.vy = 0; r.vx = 0; this.phase = 'play'; }
    } else if (this.phase === 'code') {
      if (G.keysPressed.includes('Enter')) {
        this.phase = 'done'; this.info = ''; A.sfx('ok');
        G.script(async () => {
          await G.tween(this, { chipY: 1 }, 0.7);
          this.installed = true; A.sfx('fanfare'); G.confetti(906 - this.cam + this.win.x, 170, 24);
          await K.say('Chip eingebaut! Der Roboter bekommt eine Gehaltserhöhung. Also: einen Keks.', { mood: 'victory' });
          // Der Keks fällt vom Himmel, der Roboter dreht sich um und futtert ihn in drei Bissen.
          const r = this.r;
          r.face = -1;
          this.cookie = { x: r.x - 9, y: -20, bites: 0 };
          await G.tween(this.cookie, { y: r.y + 6 }, 0.8, 'bounce');
          for (let i = 0; i < 3; i++) {
            await G.wait(0.45);
            this.cookie.bites++; this.hopT = 0.25; A.sfx('click');
            G.confetti(this.win.x + 1 + this.cookie.x - this.cam, this.win.y + 14 + this.cookie.y, 4);
          }
          await G.wait(0.45);
          this.cookie = null; this.hopT = 0.5; A.sfx('ok'); r.face = 1;
          await K.say('Mampf! Er sagt Danke. Glaube ich. Er hat den Mund voll.', { mood: 'happy' });
          G.next();
        });
      }
    }
    this.cam = clamp(r.x - 250, 0, 960 - 598);
  },
  draw(ctx) {
    Desk.draw(ctx);
    const w = this.win, r = this.r;
    G.window(ctx, w.x, w.y, w.w, w.h, 'ROBOTER.EXE', { bg: C.title });
    ctx.save();
    ctx.beginPath(); ctx.rect(w.x + 1, w.y + 14, w.w - 2, w.h - 15); ctx.clip();
    const ox = w.x + 1 - Math.round(this.cam), oy = w.y + 14;
    for (let i = 0; i < 40; i++) G.rect(ctx, w.x + ((i * 97 - this.cam * 0.3) % 600 + 600) % 600, oy + 10 + (i * 53) % 120, 1, 1, C.win);
    // Wackelpudding in der Lücke
    const wob = Math.round(Math.sin(G.t * 7) * 2);
    G.rect(ctx, ox + 420, oy + 204 + wob, 46, 60, C.orange);
    G.rect(ctx, ox + 426, oy + 201 - wob, 14, 4, C.orange); G.rect(ctx, ox + 446, oy + 202 + wob, 12, 3, C.orange);
    for (const s of this.solids) {
      if (s.k === 'ground') { G.rect(ctx, ox + s.x, oy + s.y, s.w, s.h, C.text); G.rect(ctx, ox + s.x, oy + s.y, s.w, 4, C.green); }
      else if (s.k === 'crate') { G.box(ctx, ox + s.x, oy + s.y, s.w, s.h, C.dark); G.rect(ctx, ox + s.x + 3, oy + s.y + 3, s.w - 6, 2, C.orange); }
    }
    // Maschine mit Chip-Steckplatz
    G.box(ctx, ox + 892, oy + 140, 30, 40, C.win);
    G.box(ctx, ox + 900, oy + 148, 14, 12, this.installed ? C.green : C.term);
    G.rect(ctx, ox + 896, oy + 166, 22, 2, Math.floor(G.t * 3) % 2 || this.installed ? C.green : C.shade);
    G.text(ctx, 'ZIEL', ox + 907, oy + 126, C.green, 1, 'center');
    const carried = this.phase !== 'done';
    const hop = this.hopT > 0 ? Math.round(Math.abs(Math.sin(this.hopT * 25)) * 5) : 0;
    Icons.robot(ctx, ox + r.x, oy + r.y - hop, r.face, Math.abs(r.vx) > 1 && r.ground, carried);
    const ck = this.cookie;
    if (ck) {
      const cx = Math.round(ox + ck.x), cy = Math.round(oy + ck.y);
      G.disc(ctx, cx, cy, 6, C.text); G.disc(ctx, cx, cy, 5, C.orange);
      G.rect(ctx, cx - 3, cy - 2, 2, 2, '#6E3D14'); G.rect(ctx, cx + 1, cy - 3, 2, 2, '#6E3D14'); G.rect(ctx, cx - 1, cy + 2, 2, 2, '#6E3D14');
      // Bisse: von der Roboterseite her fehlt immer mehr
      const bites = [[5, -3, 3], [4, 3, 4], [-1, 0, 5]];
      for (let i = 0; i < ck.bites; i++) G.disc(ctx, cx + bites[i][0], cy + bites[i][1], bites[i][2], C.title);
    }
    if (!carried && !this.installed) Icons.draw(ctx, 'chip', ox + r.x + 6 + (907 - r.x - 6) * this.chipY, oy + r.y - 11 + (154 - r.y + 11) * this.chipY);
    ctx.restore();
    if (this.phase === 'code') {
      G.window(ctx, 200, 90, 240, 84, 'SYSTEMCHIP EINBAUEN');
      G.text(ctx, 'CODE: 4 7 1 1', 320, 114, C.text, 2, 'center');
      G.text(ctx, 'Drücke ENTER zum Bestätigen', 300, 150, C.text, 1, 'center');
      Icons.enterKey(ctx, 396, 140, Math.floor(G.t * 3) % 2);
    }
    // Tastenanzeige
    const cap = (x, wd, label, on) => {
      G.box(ctx, x, 276, wd, 20, on ? C.green : C.title, C.shade);
      G.text(ctx, label, x + wd / 2, 282, on ? C.text : C.win, 1, 'center');
    };
    cap(24, 24, '←', G.held.ArrowLeft); cap(52, 24, '→', G.held.ArrowRight);
    cap(88, 110, 'LEERTASTE', G.held[' ']);
    Icons.enterKey(ctx, 214, 273, this.phase === 'code' && Math.floor(G.t * 3) % 2);
    G.text(ctx, 'laufen', 50, 302, C.shade, 1, 'center'); G.text(ctx, 'springen', 143, 302, C.shade, 1, 'center');
    G.text(ctx, 'Enter: bestätigen', 250, 302, C.shade, 1, 'center');
    Desk.info(ctx, this.info);
  },
  hint() {
    if (this.phase === 'code') return { type: 'key', key: 'Enter' };
    if (this.phase !== 'play') return null;
    const r = this.r;
    const jump = r.ground && [[214, 226], [396, 410], [620, 630]].some(([a, b]) => r.x >= a && r.x <= b);
    return { type: 'keys', hold: 'ArrowRight', press: jump ? ' ' : null };
  }
});

// ---------------------------------------------------------------- Mausrad-Level: Die laaange Anleitung
G.scenes.lw = () => ({
  phase: 'intro', info: '',
  win: { x: 120, y: 24, w: 400, h: 250 },
  scroll: 0, contentH: 900, pressed: false, checked: false, said: {}, cheatT: -99,
  doc: [
    [80, 'Kapitel 1: Nichts anfassen.'], [110, 'Kapitel 2: Ich habe etwas angefasst.'], [140, 'Kapitel 3: Jetzt ist es kaputt.'],
    [196, 'Der Reparatur-Knopf ist ganz unten.', C.dark], [210, 'Dreh das Mausrad zu dir hin!', C.dark],
    [300, 'Kapitel 4: Ein Rezept für Pizza.'], [314, '(Das gehört hier eigentlich nicht hin.)'],
    [400, 'Kapitel 5 bis 46: Habe ich vergessen.'], [500, 'Hier ist nichts. Weiterdrehen!'],
    [600, 'Immer noch nichts. Du machst das super.'], [700, 'Kapitel 47: Gleich kommt der Knopf.'],
    [780, 'Fast da ...'], [878, 'ENDE DER ANLEITUNG']
  ],
  enter() {
    K.home();
    G.script(async () => {
      await K.say('Ich habe eine Reparatur-Anleitung geschrieben. Sie ist nur ein klitzekleines bisschen lang.');
      await K.say('Siehst du das Rädchen zwischen den Maustasten? Dreh es zu dir hin. Dann rutscht die Seite nach unten!');
      this.phase = 'A'; this.info = 'Drehe das Mausrad: Blättere bis ganz nach unten'; G.progress();
    });
  },
  view() { const w = this.win; return { x: w.x + 1, y: w.y + 14, w: w.w - 15, h: w.h - 15 }; },
  max() { return this.contentH - this.view().h; },
  btnRect() { const v = this.view(); return { x: v.x + 112, y: v.y + 826 - Math.round(this.scroll), w: 160, h: 30 }; },
  boxRect() { const v = this.view(); return { x: v.x + 60, y: v.y + 40 - Math.round(this.scroll), w: 260, h: 18 }; },
  arrows() {
    const w = this.win, x = w.x + w.w - 14;
    return [{ x, y: w.y + 14, w: 13, h: 13 }, { x, y: w.y + w.h - 14, w: 13, h: 13 }];
  },
  update() {
    const m = G.mouse;
    if (this.phase !== 'A' && this.phase !== 'B') return;
    let d = 0;
    if (m.wheel) {
      d = clamp(m.wheel, -150, 150) * 0.6;
      if (!this.said.w) { this.said.w = 1; K.say('Genau! Das Rädchen in der Mitte der Maus. So blätterst du durch lange Seiten.', { block: false }); }
    }
    const [up, down] = this.arrows();
    if (m.pressed) { if (G.hit(up)) { d = -40; A.sfx('click'); } else if (G.hit(down)) { d = 40; A.sfx('click'); } }
    if (d) {
      const old = this.scroll;
      this.scroll = clamp(this.scroll + d, 0, this.max());
      if (this.scroll !== old) G.progress();
    }
    if (this.phase === 'A' && this.scroll > 320 && !this.said.mid) {
      this.said.mid = 1; K.say('Weiter, weiter! Ich habe sehr gründlich geschrieben.', { block: false });
    }
    if (!m.pressed || !G.hit(this.view())) return;
    if (G.hit(this.btnRect()) && this.phase === 'A') {
      this.pressed = true; this.phase = 'B'; A.sfx('ok'); G.progress();
      this.info = 'Drehe das Mausrad von dir weg: zurück nach ganz oben';
      K.say('Knopf gedrückt! Jetzt wieder ganz nach oben. Da fehlt noch ein Häkchen. Dreh das Rad von dir weg!', { block: false });
    } else if (G.hit(this.boxRect())) {
      if (this.phase === 'B') {
        this.checked = true; this.phase = 'done'; this.info = ''; A.sfx('fanfare'); G.progress();
        G.script(async () => {
          await K.say('Von oben bis unten gelesen! Das hat noch nie jemand geschafft. Nicht mal ich.', { mood: 'victory' });
          G.next();
        });
      } else if (G.t - this.cheatT > 5) {
        this.cheatT = G.t; A.sfx('bad');
        K.say('Nicht schummeln! Erst ganz nach unten blättern und den Knopf drücken.', { block: false });
      }
    }
  },
  draw(ctx) {
    Desk.draw(ctx);
    const w = this.win, v = this.view(), s = Math.round(this.scroll);
    G.window(ctx, w.x, w.y, w.w, w.h, 'ANLEITUNG.TXT');
    ctx.save();
    ctx.beginPath(); ctx.rect(v.x, v.y, v.w, v.h); ctx.clip();
    const cx = v.x + v.w / 2;
    G.text(ctx, 'REPARATUR-ANLEITUNG', cx, v.y + 14 - s, C.title, 2, 'center');
    const c = this.boxRect();
    G.box(ctx, c.x, c.y + 2, 14, 14, this.checked ? C.green : C.white);
    if (this.checked) G.text(ctx, '✓', c.x + 4, c.y + 5, C.text);
    G.text(ctx, 'Ich habe bis ganz unten gelesen', c.x + 20, c.y + 6, this.phase === 'B' ? C.dark : C.text);
    for (const [y, text, col] of this.doc) G.text(ctx, text, cx, v.y + y - s, col || C.text, 1, 'center');
    for (let y = 240; y < 800; y += 100) G.text(ctx, '. . .', cx, v.y + y + 20 - s, C.shade, 1, 'center');
    const b = this.btnRect();
    G.button(ctx, b, this.pressed ? 'Gedrückt ✓' : 'REPARIEREN', { color: this.pressed ? C.green : C.orange, disabled: this.pressed });
    ctx.restore();
    // Bildlaufleiste
    const [up, down] = this.arrows();
    G.rect(ctx, up.x, up.y, 13, w.h - 15, C.shade);
    const trackH = down.y - up.y - 13, th = 40, ty = up.y + 13 + (trackH - th) * (this.scroll / this.max());
    G.box(ctx, up.x, ty, 13, th, C.win);
    G.box(ctx, up.x, up.y, 13, 13, G.hit(up) ? C.green : C.win); G.box(ctx, down.x, down.y, 13, 13, G.hit(down) ? C.green : C.win);
    G.rect(ctx, up.x + 6, up.y + 4, 1, 1, C.text); G.rect(ctx, up.x + 5, up.y + 5, 3, 1, C.text); G.rect(ctx, up.x + 4, up.y + 6, 5, 1, C.text);
    G.rect(ctx, down.x + 4, down.y + 5, 5, 1, C.text); G.rect(ctx, down.x + 5, down.y + 6, 3, 1, C.text); G.rect(ctx, down.x + 6, down.y + 7, 1, 1, C.text);
    Icons.mouse(ctx, 58, 140, 'wheel');
    G.text(ctx, 'Mausrad', 58, 172, C.green, 1, 'center');
    Desk.info(ctx, this.info);
  },
  hint() {
    const mid = r => ({ type: 'click', x: r.x + r.w / 2, y: r.y + r.h / 2 });
    if (this.phase === 'A') return this.scroll < this.max() - 2 ? { type: 'wheel', d: 1, x: 58, y: 128 } : mid(this.btnRect());
    if (this.phase === 'B') return this.scroll > 2 ? { type: 'wheel', d: -1, x: 58, y: 128 } : mid(this.boxRect());
    return null;
  }
});

// ---------------------------------------------------------------- Rechtsklick-Level: Das geheime Menü
G.scenes.lr = () => ({
  phase: 'intro', info: '', step: 0, menu: null, leftT: -99, saidMenu: false, awake: false, cheese: true,
  steps: [
    { x: 210, y: 130, opts: ['Zudecken', 'Aufwecken', 'Kitzeln'], ok: 1, info: 'Rechtsklick auf den schlafenden Ordner',
      wrong: [V('Jetzt schläft er noch tiefer. Na toll.'), '', V('Er kichert im Schlaf. Aber wach ist er nicht.')] },
    { x: 410, y: 140, opts: ['Öffnen', 'Umbenennen', 'Löschen'], ok: 2, info: 'Rechtsklick auf den stinkenden Käse',
      wrong: [V('Puh! Schnell wieder zumachen!'), V('Jetzt heißt er Parfüm. Er stinkt trotzdem.'), ''] },
    { x: 604, y: 306, opts: ['Auslachen', 'Noch mehr verknoten', 'Entknoten'], ok: 2, info: 'Rechtsklick auf Klammi',
      wrong: [V('Sehr witzig. Wirklich.'), V('Aua! Andere Richtung!'), ''] }
  ],
  enter() {
    K.home();
    G.script(async () => {
      await K.say('Deine Maus hat noch eine zweite Taste. Die rechte! Die liegt unter deinem Mittelfinger.');
      await K.say('Ein Rechtsklick öffnet ein geheimes Menü. Darin steht, was man mit einem Ding machen kann.');
      await K.say('Der Ordner da ist eingeschlafen. Klick ihn mit der rechten Maustaste an!');
      this.phase = 'play'; this.info = this.steps[0].info; G.progress();
    });
  },
  onTarget() { const s = this.steps[this.step]; return Math.abs(G.mouse.x - s.x) < 24 && Math.abs(G.mouse.y - s.y) < 28; },
  optRect(i) { const m = this.menu; return { x: m.x + 2, y: m.y + 2 + i * 16, w: m.w - 4, h: 16 }; },
  update() {
    const m = G.mouse, s = this.steps[this.step];
    if (this.phase !== 'play') return;
    if (this.menu) {
      if (m.pressed) {
        const i = s.opts.findIndex((o, i) => G.hit(this.optRect(i)));
        this.menu = null; this.info = s.info;
        if (i === s.ok) this.solve();
        else if (i >= 0) { A.sfx('bad'); K.say(s.wrong[i], { block: false }); }
        else A.sfx('click');
        return;
      }
      if (m.rpressed && !this.onTarget()) { this.menu = null; this.info = s.info; }
    }
    if (m.rpressed && this.onTarget()) {
      this.menu = { x: clamp(m.x + 2, 4, 500), y: clamp(m.y + 2, 22, 270), w: 132, h: s.opts.length * 16 + 4 };
      A.sfx('pop'); G.progress();
      this.info = 'Wähle im Menü das Richtige aus. Mit der linken Maustaste!';
      if (!this.saidMenu) { this.saidMenu = true; K.say('Da ist es! Das Menü. Such dir mit der LINKEN Taste das Richtige aus.', { block: false }); }
    } else if (m.pressed && this.onTarget() && G.t - this.leftT > 5) {
      this.leftT = G.t; A.sfx('miss');
      K.say('Das war die linke Taste! Hier brauchen wir die rechte. Die unter dem Mittelfinger.', { block: false });
    }
  },
  solve() {
    A.sfx('ok'); G.progress(); this.phase = 'wait'; this.info = '';
    const n = this.step;
    G.script(async () => {
      if (n === 0) {
        this.awake = true;
        await K.say('Guten Morgen, Ordner! Als Nächstes der alte Käse da. Der muss weg. Rechtsklick!');
      } else if (n === 1) {
        this.cheese = false; G.confetti(410, 140, 16);
        await K.say('Weg ist er! Rechtsklick ist toll! Ich tanze vor Freu…', { mood: 'happy' });
        K.pose('tangled'); A.sfx('bad');
        await K.say('Ähm. Ich habe mich verknotet. Rechtsklick auf mich, bitte!');
      } else {
        A.sfx('fanfare');
        await K.say('Aaah. Viel besser! Rechts öffnet das Menü, links wählt aus. Merken!', { mood: 'victory' });
        G.next();
        return;
      }
      this.step++; this.phase = 'play'; this.info = this.steps[this.step].info; G.progress();
    });
  },
  draw(ctx) {
    Desk.draw(ctx);
    const hop = this.awake ? -Math.round(Math.abs(Math.sin(G.t * 6)) * 5) : 0;
    Icons.draw(ctx, 'folder', 210, 130 + hop);
    if (this.awake) { G.rect(ctx, 203, 132 + hop, 3, 3, C.text); G.rect(ctx, 214, 132 + hop, 3, 3, C.text); }
    else {
      G.rect(ctx, 202, 134, 5, 1, C.text); G.rect(ctx, 213, 134, 5, 1, C.text);
      for (let i = 0; i < 3; i++) G.text(ctx, 'z', 228 + i * 8, 112 - i * 9 - Math.round((G.t * 6 + i * 3) % 6), C.win, i === 2 ? 2 : 1);
    }
    G.text(ctx, this.awake ? 'Ordner (wach)' : 'Ordner (schläft)', 210, 152, C.win, 1, 'center');
    if (this.cheese) { Icons.cheese(ctx, 410, 140); G.text(ctx, 'KÄSE.TXT', 410, 158, C.win, 1, 'center'); }
    Icons.mouse(ctx, 58, 140, this.phase !== 'play' ? null : this.menu ? 'left' : 'right');
    G.text(ctx, this.menu ? 'Linke Maustaste' : 'Rechte Maustaste', 58, 172, C.green, 1, 'center');
    Desk.info(ctx, this.info);
  },
  drawTop(ctx) {
    const m = this.menu;
    if (!m) return;
    G.rect(ctx, m.x + 3, m.y + 3, m.w, m.h, 'rgba(0,0,0,0.35)');
    G.box(ctx, m.x, m.y, m.w, m.h, C.win);
    this.steps[this.step].opts.forEach((o, i) => {
      const r = this.optRect(i), hot = G.hit(r);
      if (hot) G.rect(ctx, r.x, r.y, r.w, r.h, C.title);
      G.text(ctx, o, r.x + 6, r.y + 5, hot ? C.white : C.text);
    });
  },
  hint() {
    if (this.phase !== 'play') return null;
    const s = this.steps[this.step];
    if (!this.menu) return { type: 'rclick', x: s.x, y: s.y };
    const r = this.optRect(s.ok);
    return { type: 'click', x: r.x + 20, y: r.y + 8 };
  }
});

// ---------------------------------------------------------------- Speichern-Level: Klammis Gedicht
G.scenes.ls = () => ({
  phase: 'intro', info: '', open: true, text: [], dirty: false, named: false, saved: [], dialog: false,
  fileIcon: false, lastT: -9, flash: 0, diskT: -99,
  win: { x: 130, y: 28, w: 360, h: 214 },
  icon: { x: 60, y: 70 },
  poem: ['Rosen sind rot,', 'ich bin aus Draht,', 'wer nicht speichert,', 'hat den Salat.'],
  diskRect() { return { x: this.win.x + 6, y: this.win.y + 17, w: 20, h: 18 }; },
  saveBtn() { return { x: 216, y: 162, w: 90, h: 20 }; },
  cancelBtn() { return { x: 314, y: 162, w: 90, h: 20 }; },
  async write(from, to) {
    for (let i = from; i < to; i++) {
      this.text.push('');
      for (const ch of this.poem[i]) { this.text[i] += ch; this.dirty = true; A.sfx('type'); await G.wait(0.05); }
      await G.wait(0.25);
    }
  },
  async crash() {
    A.sfx('bad'); G.shake = 9; this.open = false; this.dialog = false;
    await G.wait(0.8);
  },
  enter() {
    K.home();
    G.script(async () => {
      await K.say('Ich schreibe jetzt ein Gedicht. Pssst! Künstler bei der Arbeit.');
      await this.write(0, 2);
      await this.crash();
      this.text = [];
      await K.say('Abgestürzt! Und alles ist weg! Ich hatte nicht gespeichert.', { mood: 'shocked' });
      await K.say('Speichern heißt: Der Computer merkt sich deine Arbeit. Ohne Speichern vergisst er alles.');
      this.open = true; this.dirty = false;
      await this.write(0, 2);
      this.phase = 'disk'; this.info = 'Klicke auf die Diskette: Das ist der Speichern-Knopf'; G.progress();
      K.say('So. Diesmal speichern wir! Klick auf die Diskette oben links im Fenster.', { block: false });
    });
  },
  save() {
    this.saved = this.text.slice(); this.dirty = false; this.named = true; this.flash = 1; A.sfx('ok'); G.progress();
  },
  update(dt) {
    const m = G.mouse;
    this.flash = Math.max(0, this.flash - dt);
    if (this.phase === 'disk') {
      if (G.clicked(this.diskRect())) {
        this.dialog = true; this.phase = 'dialog'; A.sfx('pop'); G.progress();
        this.info = 'Klicke auf Speichern';
        K.say('Der Computer fragt nach einem Namen. GEDICHT passt gut. Klick auf Speichern!', { block: false });
      }
    } else if (this.phase === 'dialog') {
      if (G.clicked(this.saveBtn())) {
        this.dialog = false; this.save(); this.phase = 'wait'; this.info = '';
        G.script(async () => {
          await K.say('Gespeichert! Siehst du? Das Sternchen oben im Titel ist weg.', { mood: 'happy' });
          await this.write(2, 4);
          this.phase = 'ctrl'; this.info = 'Halte Strg gedrückt und drücke S'; G.progress();
          K.say('Neue Zeilen, neues Sternchen. Jetzt der Profi-Trick: Halte Strg gedrückt und drücke S!', { block: false });
        });
      } else if (G.clicked(this.cancelBtn())) {
        this.dialog = false; this.phase = 'disk'; A.sfx('miss');
        this.info = 'Klicke auf die Diskette: Das ist der Speichern-Knopf';
        K.say('Nicht abbrechen! Sonst ist es ja wieder nicht gespeichert.', { block: false });
      }
    } else if (this.phase === 'ctrl') {
      if (G.keysPressed.includes('Ctrl+S')) {
        this.save(); this.phase = 'wait'; this.info = '';
        G.script(async () => {
          await K.say('Zack, gespeichert! Jetzt kann uns nichts mehr passier…', { mood: 'happy' });
          await this.crash();
          this.fileIcon = true;
          this.phase = 'reopen'; this.info = 'Doppelklick auf GEDICHT.TXT'; G.progress();
          K.say('Schon wieder abgestürzt! Aber diesmal haben wir gespeichert. Mach die Datei auf: Doppelklick!', { block: false, mood: 'shocked' });
        });
      } else if (G.clicked(this.diskRect()) && G.t - this.diskT > 5) {
        this.diskT = G.t;
        K.say('Das geht auch! Aber probier mal den Trick: Strg festhalten und S drücken.', { block: false });
      }
    } else if (this.phase === 'reopen' && m.pressed) {
      const ic = this.icon;
      if (Math.abs(m.x - ic.x) < 26 && Math.abs(m.y - ic.y) < 28) {
        if (G.t - this.lastT < 0.7) {
          this.open = true; this.text = this.saved.slice(); this.dirty = false; this.phase = 'done'; this.info = '';
          A.sfx('fanfare'); G.progress();
          G.script(async () => {
            await K.say('Alles noch da! Merke: Erst speichern, dann abstürzen.', { mood: 'victory' });
            G.next();
          });
        } else { this.lastT = G.t; A.sfx('click'); }
      }
    }
  },
  draw(ctx) {
    Desk.draw(ctx);
    const w = this.win, blink = Math.floor(G.t * 3) % 2;
    if (this.fileIcon) {
      const ic = this.icon;
      G.box(ctx, ic.x - 11, ic.y - 14, 22, 28, C.white);
      for (let i = 0; i < 4; i++) G.rect(ctx, ic.x - 7, ic.y - 9 + i * 5, 14 - (i % 2) * 4, 1, C.shade);
      G.text(ctx, 'GEDICHT.TXT', ic.x, ic.y + 19, this.phase === 'reopen' ? C.green : C.win, 1, 'center');
    }
    if (this.open) {
      G.window(ctx, w.x, w.y, w.w, w.h, (this.named ? 'GEDICHT.TXT' : 'UNBENANNT') + (this.dirty ? ' *' : ''), { bg: C.white });
      G.rect(ctx, w.x + 1, w.y + 14, w.w - 2, 24, C.win); G.rect(ctx, w.x + 1, w.y + 37, w.w - 2, 1, C.shade);
      const d = this.diskRect(), hot = this.phase === 'disk' && blink;
      G.box(ctx, d.x, d.y, d.w, d.h, G.hit(d) || hot ? C.green : C.win);
      Icons.disk(ctx, d.x + 4, d.y + 3);
      G.text(ctx, 'Speichern', d.x + 26, d.y + 6, C.text);
      this.text.forEach((l, i) => G.text(ctx, l, w.x + 16, w.y + 50 + i * 24, C.text, 2));
      const sy = w.y + w.h - 19;
      G.rect(ctx, w.x + 1, sy, w.w - 2, 18, this.dirty ? C.orange : C.green);
      G.text(ctx, this.dirty ? 'Nicht gespeichert! (Sternchen * im Titel)' : this.named ? 'Gespeichert ✓' : 'Neue Datei', w.x + 8, sy + 6, C.text);
      if (this.flash > 0) G.ring(ctx, d.x + 10, d.y + 9, 14 + (1 - this.flash) * 20, C.green);
    }
    if (this.dialog) {
      G.window(ctx, 200, 92, 220, 100, 'SPEICHERN UNTER');
      G.text(ctx, 'Dateiname:', 214, 116, C.text);
      G.box(ctx, 214, 128, 192, 20, C.white);
      G.text(ctx, 'GEDICHT.TXT', 220, 134, C.text);
      G.button(ctx, this.saveBtn(), 'Speichern', { color: blink ? C.green : C.win });
      G.button(ctx, this.cancelBtn(), 'Abbrechen');
    }
    if (this.phase === 'ctrl') {
      const cap = (x, wd, label, on) => {
        G.box(ctx, x, 276, wd, 20, on ? C.green : C.title, C.shade);
        G.text(ctx, label, x + wd / 2, 282, on ? C.text : C.win, 1, 'center');
      };
      cap(24, 44, 'Strg', G.held.Control || G.held.Meta);
      G.text(ctx, '+', 74, 282, C.win);
      cap(84, 24, 'S', G.held.s || G.held.S);
      G.text(ctx, 'Strg festhalten, dann S drücken', 24, 302, C.shade);
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    const mid = r => ({ type: 'click', x: r.x + r.w / 2, y: r.y + r.h / 2 });
    if (this.phase === 'disk') return mid(this.diskRect());
    if (this.phase === 'dialog') return mid(this.saveBtn());
    if (this.phase === 'ctrl') return { type: 'key', key: 'Ctrl+S' };
    if (this.phase === 'reopen') return { type: 'dbl', x: this.icon.x, y: this.icon.y };
    return null;
  }
});
