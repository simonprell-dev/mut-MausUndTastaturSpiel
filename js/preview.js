'use strict';
// KLAMMI.exe – Vorschau für die Lehrkraft-Seite (?vorschau=1, läuft dort in einem kleinen Rahmen)
// Zeigt ein Level so, wie die Kinder es sehen. Niemand muss spielen:
//  - Die Seite der Lehrkraft sagt per Nachricht, welches Level gezeigt wird.
//  - Auf Wunsch spielt ein eingebauter Vorspieler die Lösung vor. Er folgt denselben Hinweisen (hint()),
//    die im Spiel auch den grünen Hilfe-Pfeil steuern.
(function () {
  if (typeof location === 'undefined' || !new URLSearchParams(location.search).has('vorschau')) return;
  G.preview = true;
  G.klass = { lock: true, ended: false };   // gleicher Sprechblasen-Takt wie auf den Schülergeräten
  G.track = () => {};                       // die Vorschau zählt nicht als Spiel
  const links = document.getElementById('links');
  if (links) links.style.visibility = 'hidden';   // nur verstecken: die Startseite füllt die Links noch aus

  // Levelwechsel gibt es hier nur auf Anweisung der Lehrkraft-Seite
  let allow = true;
  const go = G.go;
  G.go = name => { if (allow) go(name); };
  G.next = async () => {};

  let demo = false, nextAct = 0, dbl = 0, dragging = false, act = null;
  function show(scene, withDemo) {
    demo = withDemo; act = null; dbl = 0; dragging = false; nextAct = G.t + 0.8;
    G.mouse.down = false; G.held = {};
    allow = true; K.scale = 1; go(scene); allow = false;
  }
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'klammi-preview') return;
    const d = e.data;
    if (!G.scenes[d.scene]) return;
    if (d.restart || d.scene !== G.sceneName || !!d.demo !== demo) show(d.scene, !!d.demo);
  });

  const m = G.mouse;
  const press = () => { m.pressed = true; m.down = true; };
  const moveTo = (x, y, then, o) => { act = Object.assign({ x, y, then }, o || {}); };

  const frameStep = G.frameStep;
  G.frameStep = function (dt) {
    G.muted = true;
    if (!allow) {
      if (m.down && !dragging) { m.down = false; m.released = true; }
      G.held = {};
      const idle = G.sceneName === 'end' && G.scene.phase === 'cert';
      const h = demo && !idle && G.scene.hint ? G.scene.hint() : null;
      if (act) {
        // der Zeiger gleitet zum Ziel; bewegliche Ziele (Käfer, Virus) werden verfolgt
        if (act.follow && h && h.type === 'click') { act.x = h.x; act.y = h.y; }
        const dx = act.x - m.x, dy = act.y - m.y, dist = Math.hypot(dx, dy), step = (act.slow ? 200 : 460) * dt;
        if (dist <= step) { m.x = act.x; m.y = act.y; const then = act.then; act = null; if (then) then(); }
        else { m.x += dx / dist * step; m.y += dy / dist * step; }
      } else if (h && h.type === 'keys') {
        G.held[h.hold] = true;
        if (h.press) G.keysPressed.push(h.press);
      } else if (dbl && G.t >= dbl) { dbl = 0; press(); nextAct = G.t + 0.7; }
      else if (h && !dbl && G.t >= nextAct && !(K.line && K.line.block)) {
        nextAct = G.t + 0.6;
        if (h.type === 'click') moveTo(h.x, h.y, press, { follow: true });
        else if (h.type === 'hover') moveTo(h.x, h.y);
        else if (h.type === 'dbl') moveTo(h.x, h.y, () => { press(); dbl = G.t + 0.22; });
        else if (h.type === 'rclick') moveTo(h.x, h.y, () => { m.rpressed = true; });
        else if (h.type === 'wheel') { m.wheel += h.d * 100; nextAct = G.t + 0.25; }
        else if (h.type === 'key') { G.keysPressed.push(h.key); nextAct = G.t + 0.45; }
        else if (h.type === 'drag') {
          moveTo(h.x1, h.y1, () => {
            press(); dragging = true;
            moveTo(h.x2, h.y2, () => { m.down = false; m.released = true; dragging = false; nextAct = G.t + 0.6; }, { slow: true });
          });
        }
      }
    }
    frameStep(dt);
  };
  allow = true;   // der allererste Aufruf (Startbild) kommt aus G.init
  const init = G.init;
  G.init = function () { init(); allow = false; };
})();
