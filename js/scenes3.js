'use strict';
// KLAMMI.exe – Fehlermeldungs-Wahnsinn, Virus, Finale

// ---------------------------------------------------------------- Speziallevel: Fehlermeldungs-Wahnsinn
const ERR_MSGS = [
  ['SYSTEMFEHLER 0815', 'Ein Programm konnte nicht gestartet werden. Wiederholen versucht den fehlerhaften Vorgang erneut. Abbrechen beendet den Vorgang.'],
  ['FEHLER 404', 'Die Datei KÄSE.TXT wurde nicht gefunden. Wiederholen sucht noch einmal vergeblich. Abbrechen schließt die Meldung.'],
  ['WARNUNG 007', 'Der Drucker hat schlechte Laune. Wiederholen ärgert ihn noch mehr. Abbrechen lässt ihn in Ruhe.'],
  ['FEHLER 1234', 'Die Maus hat Käse gefunden und will nicht arbeiten. Wiederholen ruft sie erneut. Abbrechen beendet den Vorgang.'],
  ['SPEICHERFEHLER 42', 'Der Speicher ist voll mit Katzenbildern. Wiederholen lädt noch mehr. Abbrechen schließt die Meldung.'],
  ['FEHLER 99', 'CHAOS.EXE reagiert nicht. Wiederholen startet den Fehler noch einmal. Abbrechen beendet ihn.']
];
const ERR_MAX = 24;

G.scenes.l6 = () => ({
  phase: 'intro', info: '',
  wins: [], stack: 0, queue: 0, queueT: 0, retries: 0, drag: null, fooled: false, n: 0,
  pile: { x: 8, y: 224, w: 196, h: 106 },
  enter() {
    K.home();
    G.script(async () => {
      await K.say('Fast geschafft! Was soll jetzt noch schiefgehen?', { mood: 'happy' });
      this.spawn(0, 213, 100);
      this.phase = 'play'; this.info = 'Lies die Meldung genau. Entscheide erst dann!'; G.progress();
      K.say('Oh. Eine Fehlermeldung. Lies sie erst mal ganz durch!', { block: false });
    });
  },
  total() { return this.wins.length + this.stack + this.queue; },
  spawn(i, x, y, final) {
    if (!final && this.wins.length >= ERR_MAX) { this.stack++; A.sfx('error'); return; }
    if (i == null) i = 1 + (this.n++ % (ERR_MSGS.length - 1));
    const m = final
      ? ['LETZTE MELDUNG', 'Chaos-Schutz einschalten? Einschalten startet den Schutz. Abbrechen lässt das Chaos einfach weiterlaufen.']
      : ERR_MSGS[i];
    const rx = x != null ? x : rint(4, 420);
    // rechts unten Platz für Klammis Sprechblase lassen
    const w = { x: rx, y: y != null ? y : rint(22, rx > 150 ? 150 : 210), w: 214, h: 124, title: m[0], final: !!final, swap: !final && Math.random() < 0.4 };
    w.lines = G.wrap(m[1], w.w - 40);
    this.wins.push(w); A.sfx('error');
  },
  btns(w) {
    const y = w.y + w.h - 25, l = { x: w.x + 14, y, w: 88, h: 18 }, r = { x: w.x + w.w - 102, y, w: 88, h: 18 };
    if (w.final) return [{ label: 'Einschalten', act: 'on', rect: l }, { label: 'Abbrechen', act: 'retry', rect: r }];
    return w.swap
      ? [{ label: 'Abbrechen', act: 'close', rect: l }, { label: 'Wiederholen', act: 'retry', rect: r }]
      : [{ label: 'Wiederholen', act: 'retry', rect: l }, { label: 'Abbrechen', act: 'close', rect: r }];
  },
  pileBtns() {
    const p = this.pile, y = p.y + p.h - 25;
    return [{ label: 'Wiederholen', act: 'retry', rect: { x: p.x + 8, y, w: 84, h: 18 } }, { label: 'Alle abbrechen', act: 'closeAll', rect: { x: p.x + 98, y, w: 90, h: 18 } }];
  },
  retry(w) {
    this.queue += 4; this.retries++; G.shake = 4; A.sfx('bad');
    if (w && w.final) {
      if (!this.fooled) { this.fooled = true; K.say('Reingefallen! Diesmal war Abbrechen falsch. Immer erst lesen!', { block: false, mood: 'shocked' }); }
      return;
    }
    const lines = [V('Halt! Hast du gelesen, was da steht?'), V('Wiederholen wiederholt den FEHLER! Nicht die Rettung!'),
      V('Vier neue Meldungen! Jedes Mal vier!'), V('LIES! DEN! TEXT!'), V('Ich sehe den Desktop nicht mehr! Abbrechen! ABBRECHEN!')];
    K.say(lines[Math.min(this.retries - 1, 2 + (this.retries % 3))], { block: false });
  },
  update(dt) {
    const m = G.mouse;
    if (this.queue > 0 && (this.queueT -= dt) <= 0) { this.queue--; this.queueT = 0.2; this.spawn(); }
    const tot = this.total();
    if (this.phase === 'play' || this.phase === 'final') {
      const want = tot >= 21 ? 'panic' : tot >= 8 ? 'shocked' : null;
      if (want && K.pose_ !== want) K.pose(want);
      if (!want && (K.pose_ === 'panic' || K.pose_ === 'shocked')) K.pose('idle');
      G.rumble = tot >= 21 ? 1 : 0;
    } else return;

    if (this.drag) {
      const d = this.drag;
      d.w.x = clamp(m.x + d.ox, -100, 560); d.w.y = clamp(m.y + d.oy, 0, 316);
      if (!m.down) this.drag = null;
    }
    if (!m.pressed) return;
    if (this.stack > 0 && G.hit(this.pile)) {
      for (const b of this.pileBtns()) if (G.hit(b.rect)) {
        if (b.act === 'retry') this.retry();
        else { this.stack = 0; A.sfx('pop'); G.progress(); this.check(); }
      }
      return;
    }
    for (let i = this.wins.length - 1; i >= 0; i--) {
      const w = this.wins[i];
      if (!G.hit(w)) continue;
      this.wins.splice(i, 1); this.wins.push(w);
      const b = this.btns(w).find(b => G.hit(b.rect));
      if (!b) { if (m.y < w.y + 14) this.drag = { w, ox: w.x - m.x, oy: w.y - m.y }; }
      else if (b.act === 'retry') this.retry(w);
      else if (b.act === 'close') { this.wins.pop(); A.sfx('pop'); G.progress(); this.check(); }
      else if (b.act === 'on') this.win();
      break;
    }
  },
  check() {
    if (this.phase !== 'play' || this.total() > 0) return;
    this.phase = 'wait'; this.info = '';
    G.script(async () => {
      await K.say('Puh! Alle weg. Lesen hilft. Wer hätte das gedacht?', { mood: 'happy' });
      await K.say('Moment. Da kommt noch eine …');
      this.spawn(null, 213, 96, true);
      this.phase = 'final'; this.info = 'Lies ganz genau! Welcher Knopf hilft wirklich?'; G.progress();
    });
  },
  win() {
    this.phase = 'done'; this.info = ''; this.queue = 0; this.stack = 0; G.rumble = 0; G.progress();
    G.script(async () => {
      while (this.wins.length) { this.wins.pop(); A.sfx('pop'); await G.wait(0.06); }
      A.sfx('fanfare');
      await K.say('Chaos-Schutz läuft! Du liest Fehlermeldungen besser als ich. Das ist allerdings auch nicht schwer.', { mood: 'victory' });
      G.next();
    });
  },
  draw(ctx) {
    Desk.draw(ctx, { icons: true });
    for (const w of this.wins) {
      G.window(ctx, w.x, w.y, w.w, w.h, w.title, { bar: w.final ? C.dark : C.title });
      G.sprite(ctx, SPR.warn, w.x + 8, w.y + 22, 2);
      w.lines.forEach((l, i) => G.text(ctx, l, w.x + 36, w.y + 20 + i * 10));
      for (const b of this.btns(w)) G.button(ctx, b.rect, b.label);
    }
    if (this.stack > 0) {
      const p = this.pile;
      for (let i = Math.min(4, this.stack); i > 0; i--) G.box(ctx, p.x + i * 3, p.y - i * 3, p.w, p.h, C.win);
      G.window(ctx, p.x, p.y, p.w, p.h, 'FEHLERSTAPEL', { bar: C.dark });
      G.text(ctx, '+' + this.stack, p.x + p.w / 2, p.y + 22, C.dark, 3, 'center');
      G.text(ctx, 'weitere Fehlermeldungen', p.x + p.w / 2, p.y + 52, C.text, 1, 'center');
      G.text(ctx, 'liegen hier auf einem Stapel.', p.x + p.w / 2, p.y + 63, C.text, 1, 'center');
      for (const b of this.pileBtns()) G.button(ctx, b.rect, b.label);
    }
    if (this.phase === 'play' || this.phase === 'final') {
      const s = 'Offene Meldungen: ' + this.total();
      G.box(ctx, 500, 3, 136, 15, C.text, C.orange);
      G.text(ctx, s, 568, 7, C.orange, 1, 'center');
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    if (this.phase !== 'play' && this.phase !== 'final') return null;
    const mid = r => ({ type: 'click', x: r.x + r.w / 2, y: r.y + r.h / 2 });
    if (this.stack > 0) return mid(this.pileBtns()[1].rect);
    const w = this.wins[this.wins.length - 1];
    if (!w) return null;
    return mid(this.btns(w).find(b => b.act === (w.final ? 'on' : 'close')).rect);
  }
});

// ---------------------------------------------------------------- Finale: Der Virus
G.scenes.l7 = () => ({
  phase: 'intro', info: '',
  v: { x: 320, y: 150, r: 0, vx: 70, vy: 50, hurt: 0 },
  hp: 3, missT: -99, drag: null, trash: { x: 80, y: 262 }, typed: '', wrongT: 0, saidGrab: false,
  word: 'TSCHAU',
  vsay(text, o = {}) { return K.say(text, Object.assign({ who: 'virus', x: this.v.x, y: this.v.y - this.v.r }, o)); },
  enter() {
    K.home(); Desk.chaos = 1;
    G.script(async () => {
      await K.say('Moment mal. Wer hat eigentlich die ganzen Fehler geschickt?', { mood: 'thinking' });
      A.sfx('alarm'); G.shake = 8;
      await G.tween(this.v, { r: 24 }, 0.6, 'bounce');
      K.pose('shocked');
      await this.vsay('Muahaha! Ich bin CHAOS.EXE! Ich habe dein System durcheinandergebracht!');
      await K.say('Der Virus! Du kannst alles, was man dafür braucht. Klick ihn an!');
      K.pose('idle');
      this.phase = 'A'; this.info = 'Klicke den Virus dreimal an'; G.progress();
    });
  },
  update(dt) {
    const v = this.v, m = G.mouse;
    v.hurt = Math.max(0, v.hurt - dt);
    this.wrongT = Math.max(0, this.wrongT - dt);
    if (this.phase === 'A') {
      if (v.hurt <= 0) {
        v.x += v.vx * dt; v.y += v.vy * dt;
        if (v.x < 40 || v.x > 600) { v.vx *= -1; v.x = clamp(v.x, 40, 600); }
        if (v.y < 50 || v.y > 290) { v.vy *= -1; v.y = clamp(v.y, 50, 290); }
      }
      if (m.pressed) {
        if (G.dist(m, v) < v.r + 8) {
          this.hp--; v.hurt = 0.5; v.r -= 5; v.vx *= 1.2; v.vy *= 1.2; A.sfx('hit'); G.shake = 3; G.progress();
          if (this.hp > 0) this.vsay(this.hp === 2 ? VV('Aua! Das kitzelt!') : VV('He! Nicht so fest!'), { block: false });
          else {
            this.phase = 'B'; this.info = 'Ziehe den Virus in den Papierkorb'; v.r = 11;
            K.say('Er ist ganz benommen! Zieh ihn in den Papierkorb! Festhalten und ziehen!', { block: false, mood: 'happy' });
          }
        } else {
          A.sfx('miss');
          if (G.t - this.missT > 6) { this.missT = G.t; this.vsay('Daneben! Ich bin viel zu schnell für dich!', { block: false }); }
        }
      }
    } else if (this.phase === 'B') {
      if (m.pressed && !this.drag && G.dist(m, v) < 22) {
        this.drag = { ox: v.x - m.x, oy: v.y - m.y }; A.sfx('click');
        if (!this.saidGrab) { this.saidGrab = true; this.vsay('Lass mich los! Ich bin ein sehr wichtiger Virus!', { block: false }); }
      }
      if (this.drag) {
        v.x = clamp(m.x + this.drag.ox + rint(-1, 1), 12, 628); v.y = clamp(m.y + this.drag.oy + rint(-1, 1), 12, 322);
        if (!m.down) {
          this.drag = null;
          if (G.dist(m, this.trash) < 34) {
            this.phase = 'C'; this.info = 'Tippe TSCHAU und drücke ENTER'; A.sfx('ok'); G.progress();
            v.x = this.trash.x; v.y = this.trash.y - 6;
            K.say('Drin! Jetzt den Papierkorb leeren. Tippe TSCHAU und drücke Enter!', { block: false });
          }
        }
      }
    } else if (this.phase === 'C') {
      for (const k of G.keysPressed) {
        if (k === 'Backspace') { this.typed = this.typed.slice(0, -1); A.sfx('pop'); }
        else if (k === 'Enter') {
          if (this.typed === this.word) { this.finish(); break; }
          A.sfx('bad'); this.wrongT = 0.4;
          K.say('Das stimmt noch nicht ganz. Mit der Löschtaste kannst du Fehler löschen.', { block: false });
        } else if (k.length === 1 && k !== ' ' && this.typed.length < 10) {
          const ch = k.toUpperCase();
          if (ch.length === 1 && FONT[ch]) { this.typed += ch; A.sfx('type'); G.progress(); }
        }
      }
    }
  },
  finish() {
    this.phase = 'done'; this.info = ''; A.sfx('ok'); G.progress();
    G.script(async () => {
      await this.vsay('Neeeein! Ich wollte doch nur spieleeen …');
      await G.tween(this.v, { r: 0 }, 0.4);
      G.confetti(this.trash.x, this.trash.y, 50); A.sfx('fanfare'); G.shake = 6; Desk.chaos = 0;
      await K.say('TSCHAU, Virus! Das System ist gerettet!', { mood: 'victory' });
      G.next();
    });
  },
  draw(ctx) {
    Desk.draw(ctx, { icons: this.phase !== 'intro' ? false : true });
    const v = this.v, t = this.trash;
    if (this.phase !== 'intro' && this.phase !== 'A') {
      const near = this.drag && G.dist(G.mouse, t) < 34;
      G.box(ctx, t.x - 34, t.y - 34, 68, 68, C.title, near ? C.green : C.shade);
      ctx.save(); ctx.translate(t.x, t.y - 4); ctx.scale(2, 2); Icons.draw(ctx, 'trash', 0, 0); ctx.restore();
      G.text(ctx, 'Papierkorb', t.x, t.y + 24, C.win, 1, 'center');
    }
    if (v.r > 1 && this.phase !== 'C' && this.phase !== 'done') {
      const jx = v.hurt > 0 ? rint(-2, 2) : 0;
      Icons.virus(ctx, v.x + jx, v.y, Math.round(v.r), this.phase === 'B');
    } else if (v.r > 1) Icons.virus(ctx, t.x + rint(-1, 1), t.y - 22, Math.round(Math.min(v.r, 9)), true);
    if (this.phase === 'A') for (let i = 0; i < 3; i++) G.box(ctx, 290 + i * 22, 24, 18, 10, i < this.hp ? C.red : C.shade);
    if (this.phase === 'C') {
      const sh = this.wrongT > 0 ? rint(-3, 3) : 0;
      G.window(ctx, 180 + sh, 70, 300, 120, 'PAPIERKORB LEEREN');
      G.text(ctx, 'Tippe das Wort TSCHAU', 330 + sh, 92, C.text, 1, 'center');
      G.text(ctx, 'und drücke dann ENTER.', 330 + sh, 103, C.text, 1, 'center');
      G.box(ctx, 220 + sh, 122, 206, 34, C.term, this.typed === this.word ? C.green : C.text);
      Icons.enterKey(ctx, 434 + sh, 127, this.typed === this.word && Math.floor(G.t * 3) % 2);
      G.text(ctx, this.typed, 230 + sh, 130, C.green, 3);
      if (Math.floor(G.t * 3) % 2) G.rect(ctx, 232 + sh + G.textW(this.typed, 3), 130, 10, 21, C.green);
      G.text(ctx, this.typed === this.word ? 'Richtig! Jetzt ENTER drücken.' : 'Vertippt? Die Löschtaste ← hilft.', 330 + sh, 168, C.text, 1, 'center');
    }
    Desk.info(ctx, this.info);
  },
  hint() {
    const v = this.v;
    if (this.phase === 'A') return v.hurt > 0 ? null : { type: 'click', x: v.x, y: v.y };
    if (this.phase === 'B') return { type: 'drag', x1: v.x, y1: v.y, x2: this.trash.x, y2: this.trash.y };
    if (this.phase === 'C') {
      if (this.typed === this.word) return { type: 'key', key: 'Enter' };
      if (!this.word.startsWith(this.typed)) return { type: 'key', key: 'Backspace' };
      return { type: 'key', key: this.word[this.typed.length] };
    }
    return null;
  }
});

// ---------------------------------------------------------------- System gerettet
G.scenes.end = () => ({
  phase: 'intro', typed: '', name: '', fb: null, fbDone: false, note: '', noteT: 0,
  btn: { x: 138, y: 274, w: 124, h: 22 },
  shareBtn: { x: 270, y: 274, w: 110, h: 22 },
  fbBtn: { x: 388, y: 274, w: 114, h: 22 },
  skills: ['Maus bewegen', 'Links- und Rechtsklick', 'Doppelklick', 'Fenster klein und groß', 'Ziehen und Ablegen', 'Mausrad drehen', 'Tippen', 'Speichern', 'Pfeiltasten und Springen', 'Fehlermeldungen lesen'],
  enter() {
    K.home(); Desk.chaos = 0; G.track('finish');
    G.script(async () => {
      await K.say('Geschafft! Das System läuft wieder. Und ich habe fast gar nichts kaputt gemacht!', { mood: 'victory' });
      this.phase = 'name'; G.progress();
      K.say('Für deine Urkunde brauche ich deinen Namen. Tippe ihn ein und drücke Enter!', { block: false });
    });
  },
  starRect(i) { return { x: 196 + i * 52, y: 104, w: 40, h: 34 }; },
  sendBtn() { return { x: 166, y: 222, w: 120, h: 22 }; },
  closeBtn() { return { x: 354, y: 222, w: 120, h: 22 }; },
  say(note) { this.note = note; this.noteT = 6; },
  updateFeedback() {
    const f = this.fb, m = G.mouse;
    if (!f.sent) {
      for (const k of G.keysPressed) {
        if (k === 'Backspace') { f.text = f.text.slice(0, -1); A.sfx('pop'); }
        else if (k.length === 1 && FONT[k] && f.text.length < 46) { f.text += k; A.sfx('type'); }
      }
    }
    if (!m.pressed) return;
    if (G.hit(this.closeBtn())) { this.fb = null; A.sfx('click'); return; }
    if (f.sent || f.busy) return;
    for (let i = 0; i < 5; i++) if (G.hit(this.starRect(i))) { f.stars = i + 1; A.sfx('hit'); }
    if (f.stars > 0 && G.hit(this.sendBtn())) {
      f.busy = true; A.sfx('click');
      // Der Name von der Urkunde wird bewusst NICHT mitgeschickt.
      G.post('/api/feedback', { stars: f.stars, text: f.text.trim(), playTime: Math.round(G.playTime) })
        .then(() => { f.sent = true; f.busy = false; this.fbDone = true; A.sfx('ok'); K.say('Danke! Ich lese alles. Also, sobald ich lesen gelernt habe.', { block: false, mood: 'happy', dy: 46 }); })
        .catch(() => { f.busy = false; f.err = 'Das hat leider nicht geklappt. Versuch es später nochmal.'; A.sfx('bad'); });
    }
  },
  update(dt) {
    this.noteT = Math.max(0, this.noteT - dt);
    if (this.fb) { this.updateFeedback(); return; }
    if (this.phase === 'name') {
      for (const k of G.keysPressed) {
        if (k === 'Backspace') { this.typed = this.typed.slice(0, -1); A.sfx('pop'); }
        else if (k === 'Enter') {
          this.name = this.typed.trim() || 'Computerprofi';
          this.phase = 'cert'; A.sfx('fanfare'); G.confetti(320, 120, 60); G.progress();
          K.say(this.name + ', du bist jetzt offiziell Computer-Retter! Ich bin fast ein bisschen stolz.', { block: false, mood: 'victory', dy: 46, voice: V('Du bist jetzt offiziell Computer-Retter! Ich bin fast ein bisschen stolz.') });
          break;
        } else if (k.length === 1 && FONT[k] && this.typed.length < 14) { this.typed += k; A.sfx('type'); G.progress(); }
      }
    } else if (this.phase === 'cert') {
      if (G.clicked(this.btn)) {
        this.phase = 'bye'; A.sfx('click');
        G.script(async () => {
          await K.say('Nochmal? Gern! Ich drücke nur schnell diesen Kn…');
          A.sfx('alarm'); G.shake = 9; K.pose('shocked');
          await G.wait(0.9);
          await K.say('Ähm. Das war schon so.', { mood: 'thinking' });
          G.playTime = 0;
          G.go('boot');
        });
      } else if (G.clicked(this.shareBtn)) {
        A.sfx('click'); G.progress();
        G.share().then(msg => { if (msg) this.say(msg); });
      } else if (G.clicked(this.fbBtn) && !this.fbDone) {
        A.sfx('pop'); G.progress();
        this.fb = { stars: 0, text: '', sent: false, busy: false, err: '' };
      }
    }
  },
  draw(ctx) {
    Desk.draw(ctx, { icons: true });
    const blink = Math.floor(G.t * 3) % 2;
    if (this.phase === 'name') {
      G.window(ctx, 170, 90, 300, 110, 'URKUNDE AUSSTELLEN');
      G.text(ctx, 'Wie heißt du?', 320, 112, C.text, 1, 'center');
      G.box(ctx, 200, 128, 222, 30, C.term);
      Icons.enterKey(ctx, 428, 131, this.typed.length > 0 && blink);
      G.text(ctx, this.typed, 208, 136, C.green, 2);
      if (blink) G.rect(ctx, 210 + G.textW(this.typed, 2), 136, 8, 14, C.green);
      G.text(ctx, 'Tippe deinen Namen. Drücke dann ENTER.', 320, 174, C.text, 1, 'center');
    } else if (this.phase === 'cert' || this.phase === 'bye') {
      G.window(ctx, 120, 22, 400, 286, 'URKUNDE.TXT');
      G.box(ctx, 128, 42, 384, 258, C.win, C.dark);
      G.text(ctx, 'URKUNDE', 320, 50, C.title, 4, 'center');
      G.text(ctx, this.name, 320, 92, C.dark, 3, 'center');
      G.text(ctx, 'hat KLAMMI OS vor CHAOS.EXE gerettet', 320, 126, C.text, 1, 'center');
      G.text(ctx, 'und kann jetzt:', 320, 138, C.text, 1, 'center');
      this.skills.forEach((s, i) => {
        const x = 150 + (i % 2) * 184, y = 156 + Math.floor(i / 2) * 15;
        G.box(ctx, x, y - 2, 11, 11, C.green); G.text(ctx, '✓', x + 3, y, C.text);
        G.text(ctx, s, x + 16, y, C.text);
      });
      const sec = Math.floor(G.playTime);
      G.text(ctx, 'Spielzeit: ' + Math.floor(sec / 60) + ' Min. ' + (sec % 60) + ' Sek.   Unterschrift: Klammi (Experte)', 320, 236, C.shade, 1, 'center');
      if (this.noteT > 0) G.text(ctx, this.note, 320, 256, C.dark, 1, 'center');
      else G.text(ctx, 'Ein Lernspiel von ' + G.AUTHOR, 320, 256, C.shade, 1, 'center');
      G.button(ctx, this.btn, 'Nochmal spielen');
      G.button(ctx, this.shareBtn, 'Teilen', { color: C.orange });
      G.button(ctx, this.fbBtn, this.fbDone ? 'Danke ✓' : 'Feedback', { disabled: this.fbDone });
    }
    const f = this.fb;
    if (f) {
      G.rect(ctx, 0, 0, 640, 336, 'rgba(0,0,0,0.45)');
      G.window(ctx, 150, 66, 340, 190, 'FEEDBACK');
      if (f.sent) {
        G.text(ctx, 'Danke!', 320, 110, C.title, 3, 'center');
        G.text(ctx, 'Dein Feedback ist angekommen.', 320, 160, C.text, 1, 'center');
      } else {
        G.text(ctx, 'Wie hat dir das Spiel gefallen?', 320, 88, C.text, 1, 'center');
        for (let i = 0; i < 5; i++) {
          const r = this.starRect(i), on = i < f.stars;
          if (G.hit(r)) G.box(ctx, r.x, r.y, r.w, r.h, C.white, C.shade);
          G.sprite(ctx, SPR.star, r.x + 4, r.y + 2, 3, false, { '#': on ? C.orange : C.shade });
        }
        G.text(ctx, 'Magst du noch etwas sagen? (freiwillig)', 166, 150, C.text);
        G.box(ctx, 166, 162, 308, 20, C.white);
        G.text(ctx, f.text, 172, 168, C.text);
        if (blink) G.rect(ctx, 173 + G.textW(f.text), 167, 1, 10, C.text);
        G.text(ctx, f.err || 'Bitte keinen Namen und keine Adresse schreiben.', 166, 190, f.err ? C.red : C.shade);
        G.text(ctx, 'Gespeichert werden nur Sterne, Text und Spielzeit.', 166, 202, C.shade);
        G.button(ctx, this.sendBtn(), f.busy ? 'Sende ...' : 'Abschicken', { color: f.stars ? C.green : C.win, disabled: !f.stars || f.busy });
      }
      G.button(ctx, this.closeBtn(), 'Schließen');
    }
  },
  hint() {
    if (this.fb) return null;
    if (this.phase === 'name') return { type: 'key', key: this.typed.length < 3 ? 'abc'[this.typed.length] : 'Enter' };
    if (this.phase === 'cert') return { type: 'click', x: this.btn.x + 62, y: this.btn.y + 11 };
    return null;
  }
});
