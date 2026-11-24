'use strict';
// KLAMMI.exe – Klassenzimmer-Modus (Schülergerät)
// Aktiv, wenn die Adresse einen Klassen-Code enthält (?klasse=ABCD). Dann gilt:
//  - Das Gerät ist stumm. Der Ton läuft auf dem Lehrergerät.
//  - Nach jedem Level wartet das Kind, bis die Lehrkraft (oder die Automatik) das nächste freigibt.
//  - Das Gerät meldet alle paar Sekunden, in welchem Level es ist. Echte Namen gibt es nicht:
//    Der Server vergibt einen Tiernamen.
(function () {
  if (typeof location === 'undefined' || typeof fetch === 'undefined') return;
  const code = (new URLSearchParams(location.search).get('klasse') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (!code) return;

  const STEPS = ['boot', 'l1', 'l2', 'lf', 'l3', 'lw', 'lr', 'l4', 'ls', 'l5', 'l6', 'l7', 'end'];
  const Kl = G.klass = {
    code, id: '', key: '', name: '', joined: false, ended: false, error: '',
    step: -1,        // bis zu diesem Schritt hat die Lehrkraft freigegeben (-1 = noch nicht gestartet)
    lock: true,      // Erklärungen lassen sich nicht wegklicken
    at: -1, done: false, waiting: null, active: 0, doneCount: 0
  };
  const post = (url, data) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(r => r.json().then(j => ({ status: r.status, body: j })));
  const STORE = 'klammiKlasse';
  const remember = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ code, id: Kl.id, key: Kl.key })); } catch (e) { /* egal */ } };
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || '{}'); } catch (e) { /* egal */ }
  if (saved.code !== code) saved = {};

  function leave(message) { Kl.ended = true; Kl.error = message; Kl.waiting = null; G.muted = false; }

  function join() {
    post('/api/class/join', { code, id: saved.id, key: saved.key }).then(r => {
      if (r.status !== 200) { Kl.error = r.body.error || 'Beitreten hat nicht geklappt.'; return; }
      Object.assign(Kl, { id: r.body.id, key: r.body.key, name: r.body.name, step: r.body.step, lock: r.body.lock, joined: true, error: '' });
      Kl.resume = Math.max(0, r.body.at | 0);   // nach dem Neuladen: in diesem Level weitermachen
      remember();
    }).catch(() => { Kl.error = 'Keine Verbindung. Ich versuche es gleich nochmal.'; setTimeout(join, 3000); });
  }
  join();

  // Was Klammi hier gerade sagt, wird dem Server gemeldet. Das Lehrergerät spricht den Satz dann für alle.
  const saidQ = [];
  const say = K.say.bind(K);
  K.say = function (text, o = {}) {
    if (Kl.joined && !Kl.ended && Kl.at >= 0) {
      const f = Voice.file(norm(o.voice || text), o.who);
      if (f) { saidQ.push(f); beat(); }
    }
    return say(text, o);
  };

  let beating = false, again = false;
  function beat() {
    if (!Kl.joined || Kl.ended) return;
    if (beating) { again = true; return; }
    beating = true;
    post('/api/class/beat', { code, id: Kl.id, key: Kl.key, at: Kl.at, done: Kl.done, said: saidQ.splice(0, 8), idle: Kl.waiting || Kl.done ? 0 : Math.round(G.t - G.progressT) })
      .then(r => {
        beating = false;
        if (again) { again = false; beat(); }
        if (r.status === 404) return leave('Die Klasse wurde beendet. Du kannst allein weiterspielen.');
        if (r.status === 403) { Kl.joined = false; saved = {}; return join(); }
        if (r.status === 200) Object.assign(Kl, { step: r.body.step, active: r.body.active, doneCount: r.body.done, lock: r.body.lock });
      }).catch(() => { beating = false; });
  }
  setInterval(beat, 1500);

  // Levelwechsel: nur so weit, wie freigegeben ist. Sonst warten.
  const go = G.go;
  G.go = function (name) {
    const i = STEPS.indexOf(name);
    if (Kl.joined && !Kl.ended && i >= 0 && i > Kl.step) {
      if (STEPS.indexOf(G.sceneName) >= 0) Kl.done = true;
      Kl.waiting = name;
      beat();
      return;
    }
    go(name);
    if (i >= 0) { Kl.at = i; Kl.done = false; Kl.waiting = null; beat(); }
  };

  const frameStep = G.frameStep;
  G.frameStep = function (dt) {
    if (!Kl.ended) {
      G.muted = true;
      // der Lautsprecher-Knopf hat hier keine Funktion
      if (G.mouse.pressed && G.sceneName !== 'title' && G.hit(G.muteRect)) G.mouse.pressed = false;
      if (G.sceneName === 'title') {
        // Start durch die Lehrkraft: alle Geräte beginnen gleichzeitig
        if (Kl.joined && Kl.step >= 0) {
          K.scale = 1;
          if (!Kl.resume) G.track('start');
          G.go(STEPS[Math.min(Kl.resume || 0, Kl.step)]);
        }
        else G.mouse.pressed = false;
      } else if (Kl.joined) {
        if (Kl.waiting && STEPS.indexOf(Kl.waiting) <= Kl.step) { const n = Kl.waiting; Kl.waiting = null; G.go(n); }
        if (G.sceneName === 'end' && G.scene.phase === 'cert' && !Kl.done) { Kl.done = true; beat(); }
        if (G.mouse.pressed && !Kl.full) { Kl.full = true; G.fullscreen(); }
      }
    }
    frameStep(dt);
  };

  const render = G.render;
  G.render = function () {
    render();
    const ctx = G.ctx, m = G.mouse;
    if (Kl.ended) {
      if (Kl.error && G.t - (Kl.endT || (Kl.endT = G.t)) < 8) { G.box(ctx, 120, 150, 400, 26, C.win); G.text(ctx, Kl.error, 320, 160, C.text, 1, 'center'); }
      return;
    }
    const hop = -Math.round(Math.abs(Math.sin(G.t * 5)) * 4);
    if (G.sceneName === 'title') {
      G.window(ctx, 170, 212, 330, 96, 'KLASSE ' + Kl.code);
      if (Kl.error) G.wrap(Kl.error, 300).forEach((l, i) => G.text(ctx, l, 335, 240 + i * 12, C.dark, 1, 'center'));
      else if (!Kl.joined) G.text(ctx, 'Verbinde mit der Klasse ...', 335, 252, C.text, 1, 'center');
      else {
        G.text(ctx, 'Du bist:', 335, 232, C.text, 1, 'center');
        G.text(ctx, Kl.name, 335, 244 + hop, C.dark, 3, 'center');
        G.text(ctx, 'Gleich geht es los! Warte auf den Start.', 335, 286, C.text, 1, 'center');
      }
    } else {
      // Namensschild in der Taskleiste (über dem Lautsprecher-Knopf)
      G.box(ctx, 440, 339, 146, 18, C.title);
      G.text(ctx, Kl.name ? Kl.code + ': ' + Kl.name : 'Klasse ' + Kl.code, 513, 345, C.green, 1, 'center');
      if (Kl.waiting) {
        G.rect(ctx, 0, 0, 640, 336, 'rgba(0,0,0,0.55)');
        G.window(ctx, 160, 104, 320, 124, 'GESCHAFFT!');
        G.text(ctx, 'Super gemacht, ' + Kl.name + '!', 320, 128 + hop, C.dark, 2, 'center');
        G.text(ctx, 'Warte kurz, bis deine Klasse so weit ist.', 320, 160, C.text, 1, 'center');
        const total = Math.max(1, Kl.active), n = Math.min(total, Kl.doneCount);
        G.box(ctx, 200, 180, 240, 14, C.white);
        G.rect(ctx, 201, 181, Math.round(238 * n / total), 12, C.green);
        G.text(ctx, n + ' von ' + total + ' sind fertig', 320, 202, C.text, 1, 'center');
      }
    }
    if (G.cursor === 'arrow') G.sprite(ctx, CURSOR, m.x, m.y);
  };
})();
