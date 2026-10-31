/* =========================================================
   GUIDO MEINI — PORTFOLIO 8 BITS
   ========================================================= */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- Paleta ---------- */
const PAL = {
  g: "#4CF07A", m: "#3FD9B0", c: "#2EE6F0", b: "#3FB8FF", v: "#9B4DFF",
  p: "#E04BC8", d: "#3A1E6B", o: "#F28C28", s: "#E8B08A", x: "#3B3F4A",
  k: "#14102A", w: "#EDE9FF"
};
const SPARK_COLORS = [PAL.g, PAL.m, PAL.c, PAL.b, PAL.v, PAL.p, PAL.o];

/* =========================================================
   SPRITES (12x12, cada letra es un color de la paleta)
   ========================================================= */
const swap = (rows, map) => rows.map(r => [...r].map(ch => map[ch] ?? ch).join(""));

const player = [
  "....vvvv....",
  "...vvvvvv...",
  "..vvssssvv..",
  "..vskssksv..",
  "..vssssssv..",
  "...ssppss...",
  "....ssss....",
  "..bbbbbbbb..",
  ".bbbcbbcbbb.",
  "sbbbbbbbbbbs",
  "..bbbbbbbb..",
  "..xx....xx.."
];
const sword = [
  "..........cc",
  ".........cwc",
  "........cwc.",
  ".......cwc..",
  "......cwc...",
  ".....cwc....",
  "..o.cwc.....",
  "...ooc......",
  "...oo.......",
  "..vv.o......",
  ".vv.........",
  "vv.........."
];
const gem = [
  "............",
  "...cccccc...",
  "..cwcccccc..",
  ".cwcccccccc.",
  "bbbbbbbbbbbb",
  ".bccbbbbbbb.",
  "..bccbbbbb..",
  "...bcbbbb...",
  "....bbbb....",
  ".....bb.....",
  "............",
  "............"
];
const cap = [
  "............",
  ".....vv.....",
  "...vvvvvv...",
  ".vvvvvvvvvv.",
  "vvvvvvvvvvvv",
  ".vvvvvvvvvvo",
  "..dddddd..o.",
  "..dddddd..o.",
  "..dddddd.ooo",
  "...dddd.....",
  "............",
  "............"
];
const trophy = [
  "............",
  "..oooooooo..",
  "o.oswooooo.o",
  "o.oswooooo.o",
  "..oosooooo..",
  "...oooooo...",
  ".....oo.....",
  ".....oo.....",
  "....oooo....",
  "...xxxxxx...",
  "...xxxxxx...",
  "............"
];
const chest = [
  "............",
  "............",
  "..dddddddd..",
  ".dvvvvvvvvd.",
  ".dvvvvvvvvd.",
  ".ddddoodddd.",
  ".dvvvoovvvd.",
  ".dvvvvvvvvd.",
  ".dvvvvvvvvd.",
  ".dddddddddd.",
  "............",
  "............"
];
const mail = [
  "............",
  "............",
  ".cccccccccc.",
  ".cbccccccbc.",
  ".ccbccccbcc.",
  ".cccbccbccc.",
  ".ccccbbcccc.",
  ".cccccccccc.",
  ".cccccccccc.",
  ".cccccccccc.",
  "............",
  "............"
];
const coin = [
  "............",
  "............",
  "....oooo....",
  "...osooox...",
  "..osooxoox..",
  "..osooxoox..",
  "..osooxoox..",
  "..ooooxoox..",
  "...ooooox...",
  "....xxxx....",
  "............",
  "............"
];
const bug = [
  "............",
  "............",
  "..x.....x...",
  "...x...x....",
  "...ppppp....",
  "..pkpppkp...",
  ".ppppppppp..",
  "xpvpvpvpvpx.",
  "..ppppppp...",
  ".x..x.x..x..",
  "............",
  "............"
];
const lock = [
  "............",
  "....wwww....",
  "...ww..ww...",
  "...ww..ww...",
  "..vvvvvvvv..",
  "..vvvvvvvv..",
  "..vvvkkvvv..",
  "..vvvkkvvv..",
  "..vvvvvvvv..",
  "..dddddddd..",
  "............",
  "............"
];

const SPRITES = {
  player: [player, swap(player, { k: "s" })],            // parpadea
  sword:  [sword,  swap(sword,  { w: "c", c: "w" })],     // brillo en la hoja
  gem:    [gem,    swap(gem,    { w: "c", c: "w" })],
  cap:    [cap,    swap(cap,    { o: "p" })],
  trophy: [trophy, swap(trophy, { w: "s", s: "w" })],
  chest:  [chest,  swap(chest,  { o: "g" })],
  mail:   [mail,   mail.map((r, y) => y < 2 ? "..........pp" : r)], // notificación
  coin:   [coin,   coin],
  bug:    [bug,    bug],
  lock:   [lock,   lock]
};

function paintSprite(cv, rows) {
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, 12, 12);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === "." || !PAL[ch]) return;
    ctx.fillStyle = PAL[ch];
    ctx.fillRect(x, y, 1, 1);
  }));
}

const spriteEls = $$("canvas[data-sprite]");
spriteEls.forEach(cv => paintSprite(cv, SPRITES[cv.dataset.sprite][0]));
if (!reduceMotion) {
  let frame = 0;
  setInterval(() => {
    frame ^= 1;
    spriteEls.forEach(cv => {
      if (cv.offsetParent) paintSprite(cv, SPRITES[cv.dataset.sprite][frame]);
    });
  }, 480);
}

/* =========================================================
   SONIDO 8 BITS (WebAudio)
   ========================================================= */
const Sfx = {
  ctx: null,
  on: store.get("gm-sound", true),
  init() {
    if (!this.ctx && window.AudioContext) this.ctx = new AudioContext();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(freq, dur = .08, when = 0, type = "square", vol = .04) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + .02);
  },
  move()   { this.tone(880, .04); },
  select() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .09, i * .06)); },
  back()   { [784, 587, 392].forEach((f, i) => this.tone(f, .08, i * .06)); },
  coin()   { this.tone(988, .07); this.tone(1319, .3, .07); },
  blip()   { this.tone(1200, .05, 0, "triangle", .05); },
  type()   { this.tone(300 + Math.random() * 120, .02, 0, "square", .015); },
  win()    { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, .12, i * .1)); }
};

const soundBtn = $("#soundBtn");
function renderSound() {
  soundBtn.setAttribute("aria-pressed", String(Sfx.on));
  $("#soundLabel").textContent = Sfx.on ? "ON" : "OFF";
}
renderSound();
soundBtn.addEventListener("click", () => {
  Sfx.init();
  Sfx.on = !Sfx.on;
  store.set("gm-sound", Sfx.on);
  renderSound();
  Sfx.blip();
});
/* =========================================================
   MÚSICA DE FONDO
   ========================================================= */
const Music = (() => {
  const tracks = {
    menu: new Audio("assets/audio/music/i-am-not-clumsy.mp3"),
    boss: new Audio("assets/audio/music/boss-battle.mp3"),
    victory: new Audio("assets/audio/music/victory.mp3")
  };
  const NAMES = { menu: "I AM NOT CLUMSY", boss: "BOSS BATTLE", victory: "VICTORY" };
  const MAX_VOL = .6;      // volumen real con el slider al 100%
  Object.values(tracks).forEach(a => { a.loop = true; a.preload = "none"; a.volume = 0; });
  tracks.victory.loop = false;

  let on = store.get("gm-music", true);
  let level = store.get("gm-music-vol", 6);   // 0..10
  let unlocked = false;   // el navegador no deja reproducir antes de una interacción
  let want = "menu";      // tema que debería sonar
  let playing = null;     // <audio> activo

  const target = () => (on ? level / 10 * MAX_VOL : 0);

  function fade(a, to, ms, done) {
    clearInterval(a._fade);
    const from = a.volume, start = performance.now();
    a._fade = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / ms);
      a.volume = from + (to - from) * p;
      if (p >= 1) { clearInterval(a._fade); done && done(); }
    }, 30);
  }

  function play(name) {
    want = name;
    $("#musicTrack").textContent = NAMES[name];
    if (!on || !level || !unlocked) return;
    const next = tracks[name];
    const prev = playing;
    if (prev === next && !next.paused) return;
    if (prev && prev !== next) fade(prev, 0, 400, () => prev.pause());
    playing = next;
    if (name === "boss" && prev !== next) next.currentTime = 0;
    next.play().catch(() => {});
    fade(next, target(), 700);
  }

  // Tema corto que suena una sola vez; la promesa se resuelve al terminar
  function jingle(name) {
    return new Promise(resolve => {
      const a = tracks[name];
      $("#musicTrack").textContent = NAMES[name];
      if (!on || !level || !unlocked) return resolve();
      if (playing && playing !== a) { const prev = playing; fade(prev, 0, 250, () => prev.pause()); }
      playing = a;
      let to;
      const done = () => { a.removeEventListener("ended", done); clearTimeout(to); resolve(); };
      to = setTimeout(done, 12000);
      a.addEventListener("ended", done);
      clearInterval(a._fade);
      a.currentTime = 0;
      a.volume = target();
      a.play().catch(done);
    });
  }

  // Corta lo que suena sin cambiar el tema elegido
  function silence() {
    if (playing) { const p = playing; fade(p, 0, 300, () => p.pause()); }
  }

  function stopAll() {
    Object.values(tracks).forEach(a => fade(a, 0, 300, () => a.pause()));
  }

  /* ----- Panel ----- */
  const btn = $("#musicBtn"), panel = $("#musicPanel"), range = $("#musicVol"), muteBtn = $("#musicMute");

  function render() {
    const audible = on && level > 0;
    $("#musicLabel").textContent = audible ? "ON" : "OFF";
    btn.classList.toggle("is-off", !audible);
    range.value = level;
    range.style.setProperty("--p", level * 10 + "%");
    $("#musicVolVal").textContent = level * 10 + "%";
    muteBtn.textContent = on ? "SILENCIAR" : "ACTIVAR MUSICA";
    muteBtn.classList.toggle("is-muted", !on);
    $("#musicEq").classList.toggle("is-on", !!(playing && !playing.paused && audible));
  }

  function setLevel(n) {
    level = Math.max(0, Math.min(10, n));
    store.set("gm-music-vol", level);
    if (level > 0 && !on) { on = true; store.set("gm-music", true); }
    unlocked = true;
    if (level === 0) stopAll();
    else if (playing && !playing.paused) { clearInterval(playing._fade); playing.volume = target(); }
    else play(want);
    render();
  }

  function setOn(v) {
    on = v;
    store.set("gm-music", on);
    unlocked = true;
    if (on && level === 0) { level = 5; store.set("gm-music-vol", level); }
    on ? play(want) : stopAll();
    render();
  }

  function open() {
    Logros.closePanel();
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    range.focus();
    Sfx.blip();
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.focus({ preventScroll: true });
  }

  btn.addEventListener("click", () => (panel.hidden ? open() : close()));
  $("#musicClose").addEventListener("click", close);
  range.addEventListener("input", () => setLevel(+range.value));
  $$(".ap-step", panel).forEach(b => b.addEventListener("click", () => { setLevel(level + +b.dataset.step); Sfx.move(); }));
  muteBtn.addEventListener("click", () => setOn(!on));
  addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { e.stopPropagation(); close(); } }, true);
  document.addEventListener("pointerdown", e => {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close();
  });
  Object.values(tracks).forEach(a => ["play", "pause"].forEach(ev => a.addEventListener(ev, render)));
  render();

  // pausa al cambiar de pestaña
  document.addEventListener("visibilitychange", () => {
    if (!playing || !on || !level || !unlocked) return;
    document.hidden ? playing.pause() : playing.play().catch(() => {});
  });

  return {
    play,
    jingle,
    silence,
    closePanel: close,
    get panelOpen() { return !panel.hidden; },
    unlock() { if (unlocked) return; unlocked = true; play(want); }
  };
})();

// El navegador solo permite audio después de una interacción
["pointerdown", "keydown"].forEach(ev =>
  addEventListener(ev, () => { Sfx.init(); Music.unlock(); }, { once: true, capture: true })
);

/* =========================================================
   FONDO: estrellas + grilla retro
   ========================================================= */
(function background() {
  const cv = $("#bg");
  const ctx = cv.getContext("2d");
  const SCALE = 3;
  let W, H, stars = [], t = 0;

  function resize() {
    W = cv.width = Math.ceil(innerWidth / SCALE);
    H = cv.height = Math.ceil(innerHeight / SCALE);
    stars = Array.from({ length: Math.round(W * H / 260) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * .62,
      z: Math.random() < .15 ? 2 : 1,
      s: .05 + Math.random() * .2,
      c: Math.random() < .2 ? SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)] : "#EDE9FF",
      tw: Math.random() * 100
    }));
  }

  function draw() {
    ctx.fillStyle = "#14102A";
    ctx.fillRect(0, 0, W, H);

    // estrellas
    stars.forEach(s => {
      s.x -= s.s;
      if (s.x < 0) s.x = W;
      const on = Math.sin((t + s.tw) * .05) > -.6;
      if (!on) return;
      ctx.fillStyle = s.c;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.z, s.z);
    });

    // horizonte
    const hz = Math.floor(H * .66);
    const grad = ctx.createLinearGradient(0, hz - 30, 0, hz);
    grad.addColorStop(0, "rgba(155,77,255,0)");
    grad.addColorStop(1, "rgba(224,75,200,.35)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, hz - 30, W, 30);

    ctx.fillStyle = "#1a1236";
    ctx.fillRect(0, hz, W, H - hz);

    // líneas horizontales en perspectiva
    ctx.fillStyle = "rgba(224,75,200,.55)";
    const offset = (t * .015) % 1;
    for (let i = 0; i < 14; i++) {
      const p = (i + offset) / 14;
      const y = hz + Math.floor(Math.pow(p, 2.2) * (H - hz));
      ctx.fillRect(0, y, W, 1);
    }
    // líneas verticales que convergen
    ctx.fillStyle = "rgba(155,77,255,.5)";
    const cx = W / 2;
    for (let i = -16; i <= 16; i++) {
      for (let y = hz; y < H; y += 2) {
        const p = (y - hz) / (H - hz);
        const x = Math.floor(cx + i * (6 + p * W / 9));
        ctx.fillRect(x, y, 1, 2);
      }
    }
    ctx.fillStyle = PAL.p;
    ctx.fillRect(0, hz, W, 1);

    t++;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });
  resize();
  draw();
})();

/* =========================================================
   TRANSICIÓN PIXELADA
   ========================================================= */
const Wipe = (() => {
  const cv = $("#wipe");
  const ctx = cv.getContext("2d");
  const CELL = 32;
  let cells = [], cols, rows;

  function setup(ox, oy) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(innerWidth / CELL); rows = Math.ceil(innerHeight / CELL);
    const maxD = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy));
    cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const d = Math.hypot(x * CELL + CELL / 2 - ox, y * CELL + CELL / 2 - oy) / maxD;
      cells.push({ x, y, v: d * .8 + Math.random() * .2 });
    }
  }

  function render(t, covering) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const c of cells) {
      // al cubrir: se llenan las celdas con v < t. al descubrir: quedan las que v > t
      const filled = covering ? c.v < t : c.v >= t;
      if (!filled) continue;
      const edge = covering ? t - c.v < .08 : c.v - t < .08;
      ctx.fillStyle = edge ? SPARK_COLORS[(c.x + c.y) % SPARK_COLORS.length] : "#14102A";
      ctx.fillRect(c.x * CELL, c.y * CELL, CELL, CELL);
    }
  }

  function run(covering, dur) {
    return new Promise(resolve => {
      const start = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - start) / dur) * 1.08;
        render(t, covering);
        if (t < 1.08) requestAnimationFrame(step);
        else { if (!covering) ctx.clearRect(0, 0, innerWidth, innerHeight); resolve(); }
      })(start);
    });
  }

  return {
    async cover(ox = innerWidth / 2, oy = innerHeight / 2) {
      if (reduceMotion) return;
      setup(ox, oy);
      await run(true, 420);
    },
    async reveal() {
      if (reduceMotion) return;
      await run(false, 420);
    }
  };
})();

/* =========================================================
   PUNTAJE + EFECTOS
   ========================================================= */
const ROUTES = ["sobre-mi", "experiencia", "habilidades", "educacion", "certificados", "proyectos", "contacto"];
const visited = new Set(store.get("gm-visited", []));
const scoreEl = $("#score");
let bonus = store.get("gm-bonus", 0);
const renderScore = () => { scoreEl.textContent = String(visited.size * 100 + (visited.size === ROUTES.length ? 300 : 0) + bonus).padStart(6, "0"); };
function addBonus(pts) {
  bonus += pts;
  store.set("gm-bonus", bonus);
  scoreEl.classList.remove("bump"); void scoreEl.offsetWidth; scoreEl.classList.add("bump");
  renderScore();
}
renderScore();

function floater(text, x, y) {
  const el = document.createElement("span");
  el.className = "floater";
  el.textContent = text;
  el.style.left = x + "px"; el.style.top = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}

function award(route) {
  if (visited.has(route)) return;
  visited.add(route);
  store.set("gm-visited", [...visited]);
  const r = scoreEl.getBoundingClientRect();
  floater("+100", r.left, r.bottom + 4);
  scoreEl.classList.remove("bump"); void scoreEl.offsetWidth; scoreEl.classList.add("bump");
  renderScore();
  if (visited.size === ROUTES.length) {
    setTimeout(() => { Sfx.win(); Logros.unlock("completo"); }, 900);
  }
}

/* =========================================================
   LOGROS
   ========================================================= */
const Logros = (() => {
  // secret: no se revela hasta descubrir el minijuego
  const LIST = [
    {
      id: "completo", sprite: "trophy", name: "100% COMPLETADO",
      desc: "Visitaste todos los niveles", hint: () => `Visitá todos los niveles (${visited.size}/${ROUTES.length})`,
      reward: "+300 PTS", msg: "★ LOGRO: 100% COMPLETADO ★ +300 BONUS · GRACIAS POR JUGAR"
    },
    {
      id: "secreto", sprite: "coin", name: "BUG HUNT DESCUBIERTO", secret: true,
      desc: "Encontraste el minijuego secreto",
      msg: "★ LOGRO: BUG HUNT DESCUBIERTO ★ 5 MONEDAS"
    },
    {
      id: "ganador", sprite: "bug", name: "DEPLOY EXITOSO", secret: true,
      desc: "Ganaste Bug Hunt", hint: () => "Eliminá todos los bugs antes del deploy",
      reward: "+500 PTS", msg: "★ LOGRO: DEPLOY EXITOSO ★ 0 BUGS EN PRODUCCION"
    }
  ];

  const unlocked = new Set(store.get("gm-logros", []));
  // Partidas anteriores al sistema de logros (el bonus solo se gana con Bug Hunt)
  if (visited.size === ROUTES.length) unlocked.add("completo");
  if (bonus > 0) { unlocked.add("secreto"); unlocked.add("ganador"); }
  store.set("gm-logros", [...unlocked]);

  const btn = $("#logrosBtn"), panel = $("#logrosPanel"), list = $("#logrosList");

  function item(a) {
    const on = unlocked.has(a.id);
    const hidden = a.secret && !unlocked.has("secreto");
    const li = document.createElement("li");
    li.className = "logro" + (on ? " is-on" : "");

    const ico = document.createElement("canvas");
    ico.className = "logro-ico";
    ico.width = ico.height = 12;
    paintSprite(ico, SPRITES[on ? a.sprite : "lock"][0]);

    const body = document.createElement("div");
    const name = document.createElement("p");
    name.className = "logro-name";
    name.textContent = hidden ? "? ? ?" : a.name;
    const desc = document.createElement("p");
    desc.className = "logro-desc";
    desc.textContent = hidden ? "Logro secreto" : on ? a.desc : a.hint();
    body.append(name, desc);
    if (a.reward && !hidden) {
      const reward = document.createElement("p");
      reward.className = "logro-reward";
      reward.textContent = a.reward;
      body.append(reward);
    }

    li.append(ico, body);
    return li;
  }

  function render() {
    const count = `${unlocked.size}/${LIST.length}`;
    $("#logrosLabel").textContent = count;
    $("#logrosCount").textContent = count;
    btn.setAttribute("aria-label", `Logros: ${unlocked.size} de ${LIST.length}`);
    list.replaceChildren(...LIST.map(item));
  }

  function unlock(id) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    store.set("gm-logros", [...unlocked]);
    render();
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
    toast(LIST.find(a => a.id === id).msg);
  }

  function open() {
    Music.closePanel();
    render();   // el progreso de niveles cambia sin desbloquear nada
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    $("#logrosClose").focus();
    Sfx.blip();
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.focus({ preventScroll: true });
  }

  btn.addEventListener("click", () => (panel.hidden ? open() : close()));
  $("#logrosClose").addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { e.stopPropagation(); close(); } }, true);
  document.addEventListener("pointerdown", e => {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close();
  });
  render();

  return {
    unlock,
    closePanel: close,
    get panelOpen() { return !panel.hidden; }
  };
})();

function sparks(el, color) {
  if (reduceMotion) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2.6;
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    const a = (Math.PI * 2 * i) / 10 + Math.random() * .4;
    const d = 40 + Math.random() * 40;
    s.style.left = cx + "px"; s.style.top = cy + "px";
    s.style.setProperty("--dx", Math.round(Math.cos(a) * d / 4) * 4 + "px");
    s.style.setProperty("--dy", Math.round(Math.sin(a) * d / 4) * 4 + "px");
    s.style.setProperty("--c", color || SPARK_COLORS[i % SPARK_COLORS.length]);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
}

/* =========================================================
   TEXTO "TIPEADO" DEL MENÚ
   ========================================================= */
(function typedRoles() {
  const roles = ["ANALISTA EN SISTEMAS", "DESARROLLADOR PHP / SYMFONY", "ANALISIS FUNCIONAL", "TESTING Y DOCUMENTACION"];
  const el = $("#typed");
  if (reduceMotion) { el.textContent = roles[0]; return; }
  let ri = 0, ci = 0, del = false;
  (function tick() {
    const cur = roles[ri];
    el.textContent = cur.slice(0, ci);
    if (!del && ci < cur.length) { ci++; setTimeout(tick, 70); }
    else if (del && ci > 0) { ci--; setTimeout(tick, 30); }
    else { del = !del; if (!del) ri = (ri + 1) % roles.length; setTimeout(tick, del ? 1800 : 300); }
  })();
})();

/* =========================================================
   MENÚ: selección con mouse / teclado
   ========================================================= */
const tiles = $$(".tile");
let sel = 0;

function selectTile(i, sound = true) {
  if (i === sel && tiles[i].classList.contains("is-sel")) return;
  tiles.forEach(t => t.classList.remove("is-sel"));
  sel = i;
  tiles[i].classList.add("is-sel");
  if (sound) Sfx.move();
}

function neighbour(dir) {
  const cur = tiles[sel].getBoundingClientRect();
  const cx = cur.left + cur.width / 2, cy = cur.top + cur.height / 2;
  let best = -1, bestScore = Infinity;
  tiles.forEach((t, i) => {
    if (i === sel) return;
    const r = t.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const dx = x - cx, dy = y - cy;
    const ok = { left: dx < -5 && Math.abs(dy) < 20, right: dx > 5 && Math.abs(dy) < 20, up: dy < -20, down: dy > 20 }[dir];
    if (!ok) return;
    const score = dir === "left" || dir === "right" ? Math.abs(dx) : Math.abs(dy) * 3 + Math.abs(dx);
    if (score < bestScore) { bestScore = score; best = i; }
  });
  if (best === -1 && (dir === "left" || dir === "right")) {
    best = (sel + (dir === "right" ? 1 : -1) + tiles.length) % tiles.length;
  }
  return best;
}

tiles.forEach((t, i) => {
  t.addEventListener("mouseenter", () => { if (i !== sel) { selectTile(i); sparks(t, getComputedStyle(t).getPropertyValue("--ac")); } });
  t.addEventListener("focus", () => selectTile(i, false));
  t.addEventListener("click", e => { e.preventDefault(); pick(i); });
});

let picking = false;
async function pick(i) {
  if (busy || picking) return;
  picking = true;
  selectTile(i, false);
  const t = tiles[i];
  Sfx.select();
  sparks(t);
  t.classList.add("is-picked");
  await sleep(reduceMotion ? 0 : 420);
  t.classList.remove("is-picked");
  picking = false;
  const r = t.getBoundingClientRect();
  navigate(t.getAttribute("href"), r.left + r.width / 2, r.top + r.height / 2);
}

/* =========================================================
   ROUTER
   ========================================================= */
const views = $$(".view");
let current = null, busy = false, pendingOrigin = null;

function routeFromHash() {
  const r = location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(r) ? r : "menu";
}

function navigate(href, x, y) {
  if (x !== undefined) pendingOrigin = [x, y];
  if (location.hash === href) show(routeFromHash());
  else location.hash = href;
}

// Links "VOLVER" y logo
$$("[data-nav]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  if (routeFromHash() === "menu" && current === "menu") return;
  Sfx.back();
  const r = a.getBoundingClientRect();
  navigate("#/", r.left + r.width / 2, r.top + r.height / 2);
}));

addEventListener("hashchange", () => show(routeFromHash()));

async function show(route, { instant = false } = {}) {
  if (route === current) return;
  if (busy) { await sleep(50); return show(routeFromHash(), { instant }); }
  busy = true;
  document.body.classList.add("is-busy");

  const [ox, oy] = pendingOrigin || [innerWidth / 2, innerHeight / 2];
  pendingOrigin = null;
  if (!instant) await Wipe.cover(ox, oy);

  const prev = views.find(v => v.dataset.view === current);
  if (prev) { prev.hidden = true; prev.classList.remove("is-on", "is-entering"); leave(current); }

  const view = views.find(v => v.dataset.view === route);
  views.forEach(v => { if (v !== view) v.hidden = true; });
  view.hidden = false;
  scrollTo(0, 0);
  void view.offsetWidth;
  view.classList.add("is-on", "is-entering");
  setTimeout(() => view.classList.remove("is-entering"), 900);
  document.title = route === "menu" ? "Guido Meini | Analista en Sistemas" : `${view.dataset.title} · Guido Meini`;
  current = route;

  if (!instant) await Wipe.reveal();
  document.body.classList.remove("is-busy");
  busy = false;

  enter(route, view);
}

/* =========================================================
   ANIMACIONES POR VISTA
   ========================================================= */
const timers = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
const every = (fn, ms) => { const id = setInterval(fn, ms); timers.add(id); return id; };
function clearTimers() { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers.clear(); }

function leave() {
  clearTimers();
}

function enter(route, view) {
  if (route !== "menu") award(route);
  const heading = $(".view-title", view) || $("#menuTitle");

  switch (route) {
    case "menu":
      tiles[sel].classList.add("is-sel");
      tiles[sel].focus({ preventScroll: true });
      return;
    case "sobre-mi":    enterAbout(); break;
    case "habilidades": enterSkills(view); break;
    case "certificados": enterAchievements(view); break;
    case "proyectos":   enterProjects(); break;
  }
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

/* ----- Sobre mí: diálogo tipeado ----- */
const dialog = $("#dialog");
const pages = $$("#dialogPages p");
const pagesHTML = pages.map(p => p.innerHTML);
let page = 0, typing = null;

function typePage(i) {
  page = i;
  clearInterval(typing); timers.delete(typing);
  pages.forEach((p, j) => p.classList.toggle("on", j === i));
  $("#dialogCount").textContent = `${i + 1}/${pages.length}`;
  dialog.classList.remove("is-done");
  const p = pages[i];
  const text = p.textContent;
  if (reduceMotion) { p.innerHTML = pagesHTML[i]; dialog.classList.add("is-done"); return; }
  let n = 0;
  p.textContent = "";
  typing = every(() => {
    n += 2;
    p.textContent = text.slice(0, n);
    if (n % 6 === 0) Sfx.type();
    if (n >= text.length) finishPage();
  }, 28);
}
function finishPage() {
  clearInterval(typing); timers.delete(typing); typing = null;
  pages[page].innerHTML = pagesHTML[page];
  dialog.classList.add("is-done");
}
function advanceDialog() {
  if (typing) return finishPage();
  Sfx.blip();
  typePage((page + 1) % pages.length);
}
dialog.addEventListener("click", advanceDialog);
dialog.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advanceDialog(); }
});

function countUp(el) {
  const target = +el.dataset.count;
  if (reduceMotion) { el.textContent = target; return; }
  const steps = 16;
  let i = 0;
  const id = every(() => {
    i++;
    el.textContent = Math.round(target * i / steps);
    if (i >= steps) { clearInterval(id); timers.delete(id); }
  }, 45);
}

function enterAbout() {
  pages.forEach((p, j) => { p.innerHTML = pagesHTML[j]; });
  later(() => typePage(0), 350);
  $$(".counter-num").forEach((el, i) => { el.textContent = "0"; later(() => countUp(el), 250 + i * 150); });
}

/* ----- Habilidades: barras segmentadas ----- */
const LV_COLORS = { 8: PAL.g, 6: PAL.c, 3: PAL.o };
$$(".skill").forEach(sk => {
  const bar = $(".segbar", sk);
  bar.innerHTML = '<span class="seg"></span>'.repeat(10);
  bar.setAttribute("role", "img");
  bar.setAttribute("aria-label", `${sk.dataset.seg} de 10`);
});
function enterSkills(view) {
  const skills = $$(".skill", view);
  skills.forEach(sk => $$(".seg", sk).forEach(s => s.classList.remove("on")));
  skills.forEach((sk, si) => {
    const n = +sk.dataset.seg;
    const segs = $$(".seg", sk);
    for (let k = 0; k < n; k++) {
      later(() => {
        segs[k].style.setProperty("--c", LV_COLORS[n] || PAL.c);
        segs[k].classList.add("on");
        if (k === n - 1) Sfx.tone(440 + n * 60, .05, 0, "square", .025);
      }, reduceMotion ? 0 : 200 + si * 90 + k * 55);
    }
  });
}

/* ----- Certificados: logros que se desbloquean ----- */
function enterAchievements(view) {
  const achs = $$(".ach", view);
  const count = $("#achCount");
  count.textContent = "0";
  achs.forEach(a => { a.classList.add("is-locked"); a.classList.remove("unlocked"); });
  achs.forEach((a, i) => later(() => {
    a.classList.remove("is-locked");
    a.classList.add("unlocked");
    count.textContent = i + 1;
    Sfx.coin();
  }, reduceMotion ? 0 : 450 + i * 320));
}

/* ----- Certificados: visor de solo lectura -----
   Muestra una imagen (nunca el PDF) y sin opciones de descarga */
const Cert = (() => {
  const modal = $("#certModal"), img = $("#certImg"), status = $("#certStatus");
  let opener = null;

  function open(card) {
    const title = $("h3", card).textContent;
    opener = card;
    $("#certTitle").textContent = title;
    img.alt = `Certificado: ${title}`;
    img.hidden = true;
    status.hidden = false;
    status.textContent = "CARGANDO...";
    img.src = `assets/img/certificados/${card.dataset.cert}.jpg`;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    $("#certClose").focus();
    Sfx.select();
  }
  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    img.removeAttribute("src");
    document.body.classList.remove("no-scroll");
    opener.focus({ preventScroll: true });
    Sfx.back();
  }

  img.addEventListener("load", () => { status.hidden = true; img.hidden = false; });
  img.addEventListener("error", () => { if (img.getAttribute("src")) status.textContent = "NO SE PUDO CARGAR"; });

  $$(".ach[data-cert]").forEach(card => {
    const pick = () => { if (!card.classList.contains("is-locked")) open(card); };
    card.addEventListener("click", pick);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
    });
  });

  $("#certClose").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.addEventListener("contextmenu", e => e.preventDefault());
  modal.addEventListener("dragstart", e => e.preventDefault());
  addEventListener("keydown", e => {
    if (modal.hidden) return;
    if (e.key === "Escape") { e.stopPropagation(); close(); }
    else if (e.key === "Tab") e.preventDefault();   // el foco queda en el visor
  }, true);
  addEventListener("hashchange", close);

  return { get isOpen() { return !modal.hidden; } };
})();

/* ----- Proyectos: barra de carga infinita ----- */
function enterProjects() {
  const fill = $("#loaderFill"), pct = $("#loaderPct");
  let v = 0;
  const draw = () => { fill.style.width = v + "%"; pct.textContent = v; };
  if (reduceMotion) { v = 99; draw(); return; }
  every(() => {
    v = v >= 99 ? 0 : Math.min(99, v + Math.ceil(Math.random() * 6));
    draw();
  }, 180);
}

/* =========================================================
   TECLADO
   ========================================================= */
addEventListener("keydown", e => {
  if (!$("#start").hidden || window.Game?.active || Music.panelOpen || Logros.panelOpen || Cert.isOpen) return;
  if (busy) return;
  const keyDir = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" }[e.key];

  if (current === "menu") {
    if (keyDir) {
      e.preventDefault();
      const n = neighbour(keyDir);
      if (n > -1) { selectTile(n); tiles[n].focus({ preventScroll: true }); }
    } else if (e.key === "Enter" || e.key === " ") {
      const a = document.activeElement;
      // Enter sobre un tile ya dispara su click nativo
      if (a && a !== document.body && !(a.classList.contains("tile") && e.key === " ")) return;
      e.preventDefault();
      pick(sel);
    }
  } else if (e.key === "Escape" || (e.key === "Backspace" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName))) {
    e.preventDefault();
    Sfx.back();
    navigate("#/");
  }
});

/* =========================================================
   PANTALLA DE INICIO + ARRANQUE
   ========================================================= */
const startEl = $("#start");

async function pressStart() {
  if (startEl.classList.contains("is-pressed")) return;
  Sfx.init();
  Sfx.coin();
  startEl.classList.add("is-pressed");
  try { sessionStorage.setItem("gm-started", "1"); } catch {}
  await sleep(reduceMotion ? 0 : 650);
  await Wipe.cover(innerWidth / 2, innerHeight / 2);
  startEl.hidden = true;
  await show("menu", { instant: true });
  await Wipe.reveal();
}

let seenStart = false;
try { seenStart = sessionStorage.getItem("gm-started") === "1"; } catch {}

if (routeFromHash() === "menu" && !seenStart) {
  startEl.hidden = false;
  $("#startBtn").focus();
  startEl.addEventListener("click", pressStart);
  addEventListener("keydown", function onKey(e) {
    if (startEl.hidden) return removeEventListener("keydown", onKey);
    if (["Enter", " "].includes(e.key)) { e.preventDefault(); pressStart(); }
  });
} else {
  show(routeFromHash(), { instant: true });
}
