/* =========================================================
   EASTER EGG — monedas + minijuego "BUG HUNT"
   Usa helpers globales de script.js (PAL, Sfx, Wipe, show...)
   ========================================================= */

function drawRows(ctx, rows, x, y) {
  x = Math.round(x); y = Math.round(y);
  rows.forEach((row, ry) => [...row].forEach((ch, rx) => {
    if (ch === "." || !PAL[ch]) return;
    ctx.fillStyle = PAL[ch];
    ctx.fillRect(x + rx, y + ry, 1, 1);
  }));
}

const COIN = [
  "..oooo..",
  ".osooox.",
  "osooxoox",
  "osooxoox",
  "osooxoox",
  "ooooxoox",
  ".ooooox.",
  "..xxxx.."
];
const paintCoin = cv => drawRows(cv.getContext("2d"), COIN, 0, 0);
$$("[data-coin]").forEach(paintCoin);

/* =========================================================
   MINIJUEGO
   ========================================================= */
window.Game = (() => {
  const W = 256, H = 224;
  const wrap = $("#game");
  const cv = $("#gameCanvas");
  const ctx = cv.getContext("2d");
  const api = { active: false, start, stop };

  const SHIP = [
    "......c......",
    ".....ccc.....",
    ".....cwc.....",
    "..g..ccc..g..",
    "..gcccccccg..",
    ".gcccbcbcccg.",
    "gccccbbbccccg",
    "gg..o...o..gg"
  ];
  const SHIP_B = swap(SHIP, { o: "p" });
  const BUGS = {
    // escarabajo
    A: [[
      "..x.....x..",
      "...x...x...",
      "...ppppp...",
      "..pkpppkp..",
      ".ppppppppp.",
      "xpvpvpvpvpx",
      "..ppppppp..",
      ".x..x.x..x."
    ]],
    // vaquita
    B: [[
      "....xxx....",
      "...xkxkx...",
      "..ooooooo..",
      ".oxoooooxo.",
      ".ooooxoooo.",
      ".oxoooooxo.",
      "..ooooooo..",
      ".x.x...x.x."
    ]],
    // mosca
    C: [[
      "...........",
      ".ccc...ccc.",
      "cwwcc.ccwwc",
      ".cccgggccc.",
      "...gkgkg...",
      "...ggggg...",
      "....ggg....",
      "...g...g..."
    ]]
  };
  BUGS.A.push(BUGS.A[0].map((r, i) => i === 0 ? ".x.......x." : i === 7 ? "x..x...x..x" : r));
  BUGS.B.push(BUGS.B[0].map((r, i) => i === 7 ? "x.x.....x.x" : r));
  BUGS.C.push(swap(BUGS.C[0], { c: "w", w: "c" }));
  const PTS = { C: 30, A: 20, B: 10 };
  const EXPLOSION = new Audio("assets/audio/sfx/explosion.wav");
  EXPLOSION.preload = "auto";
  let winDone = false;   // true cuando terminó el tema Victory

  let state, raf, last, t, keys = {}, pointerX = null, firing = false, stopping = false;
  let player, bullets, bombs, bugs, parts, stars, score, lives, form, fireCd, bombCd, diveCd, endT;

  stars = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: .3 + Math.random() }));

  function fit() {
    const s = Math.min((innerWidth - 32) / W, (innerHeight - 90) / H);
    const scale = s >= 2 ? Math.floor(s) : Math.max(1, s);
    cv.style.width = W * scale + "px";
    cv.style.height = H * scale + "px";
  }

  function reset() {
    player = { x: W / 2 - 6, y: H - 22, w: 13, h: 8, inv: 0 };
    bullets = []; bombs = []; parts = [];
    score = 0; lives = 4; t = 0;
    fireCd = 0; bombCd = 2.5; diveCd = 6;
    winDone = false;
    form = { y: 28, baseX: (W - (6 * 20 + 11)) / 2, sway: 0, phase: 0 };
    bugs = [];
    ["C", "A", "A", "B"].forEach((type, row) => {
      for (let col = 0; col < 7; col++) {
        bugs.push({ type, row, col, ox: col * 20, oy: row * 15, x: 0, y: 0, w: 11, h: 8, alive: true, dive: null });
      }
    });
    placeBugs();
  }

  function placeBugs() {
    bugs.forEach(b => {
      b.sx = form.baseX + form.sway + b.ox + Math.sin(t * 4 + b.col) * 1.2;
      b.sy = form.y + b.oy;
      if (!b.dive) { b.x = b.sx; b.y = b.sy; }
    });
  }

  function boom(x, y, colors, n = 10) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 50;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .4 + Math.random() * .3, c: colors[i % colors.length] });
    }
  }

  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function hurt() {
    if (player.inv > 0 || state !== "play") return;
    lives--;
    player.inv = 2;
    boom(player.x + 6, player.y + 4, [PAL.c, PAL.w, PAL.g], 16);
    [300, 200, 120].forEach((f, i) => Sfx.tone(f, .1, i * .08, "sawtooth", .04));
    if (lives <= 0) end("lose");
  }

  function end(result) {
    if (state !== "play") return;
    state = result;
    endT = 0;
    if (result === "win") {
      Music.jingle("victory").then(() => { winDone = true; });
      addBonus(score + 500);
      Logros.unlock("ganador");
    } else {
      Music.silence();
      if (Sfx.on) {
        EXPLOSION.currentTime = 0;
        EXPLOSION.volume = .8;
        EXPLOSION.play().catch(() => {});
      }
      boom(player.x + 6, player.y + 4, [PAL.o, PAL.p, PAL.w, PAL.c], 40);
    }
  }

  function update(dt) {
    t += dt;
    stars.forEach(s => { s.y += s.s * dt * 18; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
    parts = parts.filter(p => (p.life -= dt) > 0);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; });

    if (state !== "play") {
      if (state === "win" || state === "lose") {
        endT += dt;
        if (state === "win" && endT > 3.5 && winDone) stop();
        if (state === "lose" && endT > 8) stop();
      }
      return;
    }

    const alive = bugs.filter(b => b.alive);
    if (!alive.length) return end("win");
    const k = 1 + (1 - alive.length / bugs.length) * .6;

    // formación
    const amp = (form.baseX - 6) * .8;
    form.phase += dt * .5 * k;
    form.sway = Math.sin(form.phase) * amp;
    form.y += dt * 1.3 * k;
    placeBugs();

    // bichos en picada
    alive.forEach(b => {
      if (!b.dive) return;
      const d = b.dive;
      if (!d.returning) {
        d.t += dt;
        b.y = d.sy + d.t * 45;
        b.x = d.sx + Math.sin(d.t * 2) * 22 + (player.x - d.sx) * Math.min(1, d.t / 3) * .35;
        if (b.y > H + 10) { d.returning = true; d.back = 0; }
      } else {
        d.back += dt;
        const p = Math.min(1, d.back);
        b.x = b.sx; b.y = -12 + (b.sy + 12) * p;
        if (p >= 1) b.dive = null;
      }
    });
    if ((diveCd -= dt) <= 0) {
      const cand = alive.filter(b => !b.dive);
      if (cand.length) {
        const b = cand[Math.floor(Math.random() * cand.length)];
        b.dive = { t: 0, sx: b.x, sy: b.y };
        Sfx.tone(700, .12, 0, "triangle", .04); Sfx.tone(500, .12, .1, "triangle", .04);
      }
      diveCd = (4.5 + Math.random() * 3) / k;
    }

    // bombas
    if ((bombCd -= dt) <= 0) {
      const b = alive[Math.floor(Math.random() * alive.length)];
      bombs.push({ x: b.x + 5, y: b.y + 8, w: 2, h: 5, vy: 50 + Math.random() * 20 });
      bombCd = (1.8 + Math.random() * 1.4) / k;
    }
    bombs.forEach(b => b.y += b.vy * dt);
    bombs = bombs.filter(b => b.y < H);

    // jugador
    let dx = 0;
    if (keys.ArrowLeft || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;
    if (dx) { pointerX = null; player.x += dx * 115 * dt; }
    else if (pointerX !== null) {
      const target = pointerX - player.w / 2;
      const step = 170 * dt;
      player.x += Math.max(-step, Math.min(step, target - player.x));
    }
    player.x = Math.max(2, Math.min(W - player.w - 2, player.x));
    player.inv = Math.max(0, player.inv - dt);

    // disparo
    fireCd -= dt;
    if ((keys[" "] || firing) && fireCd <= 0 && bullets.length < 3) {
      bullets.push({ x: player.x + 5, y: player.y - 3, w: 3, h: 5 });
      fireCd = .2;
      Sfx.tone(1400, .04, 0, "square", .02); Sfx.tone(900, .04, .03, "square", .02);
    }
    bullets.forEach(b => b.y -= 240 * dt);
    bullets = bullets.filter(b => b.y > -6);

    // colisiones
    bullets.forEach(bl => {
      const b = alive.find(b => b.alive && hit(bl, b));
      if (!b) return;
      b.alive = false; bl.y = -99;
      const pts = PTS[b.type] * (b.dive ? 2 : 1);
      score += pts;
      boom(b.x + 5, b.y + 4, b.type === "C" ? [PAL.g, PAL.c] : b.type === "A" ? [PAL.p, PAL.v] : [PAL.o, PAL.s]);
      Sfx.tone(180 + Math.random() * 60, .08, 0, "sawtooth", .035);
    });
    bombs.forEach(b => { if (hit(b, player)) { b.y = H + 9; hurt(); } });
    alive.forEach(b => {
      if (b.alive && b.dive && !b.dive.returning && hit(b, player)) {
        b.alive = false; boom(b.x + 5, b.y + 4, [PAL.p, PAL.o]); hurt();
      }
      if (b.alive && !b.dive && b.y + b.h >= player.y - 2) end("lose");
    });
  }

  function text(str, x, y, color, size = 8, align = "center") {
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    ctx.fillStyle = PAL.k;
    ctx.fillText(str, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }
  const blinkOn = () => Math.floor(t * 2.5) % 2 === 0;

  function render() {
    ctx.fillStyle = PAL.k;
    ctx.fillRect(0, 0, W, H);
    stars.forEach(s => { ctx.fillStyle = s.s > 1 ? PAL.v : PAL.x; ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); });

    // piso
    ctx.fillStyle = PAL.d;
    ctx.fillRect(0, H - 10, W, 10);
    ctx.fillStyle = PAL.p;
    ctx.fillRect(0, H - 10, W, 1);

    const frame = Math.floor(t * 3) % 2;
    bugs.forEach(b => { if (b.alive) drawRows(ctx, BUGS[b.type][frame], b.x, b.y); });

    bombs.forEach(b => {
      ctx.fillStyle = Math.floor(t * 10) % 2 ? PAL.p : PAL.o;
      ctx.fillRect(Math.round(b.x), Math.round(b.y), 2, 2);
      ctx.fillRect(Math.round(b.x) + (Math.floor(b.y / 3) % 2 ? 1 : -1), Math.round(b.y) + 2, 2, 3);
    });
    bullets.forEach(b => {
      ctx.fillStyle = PAL.c; ctx.fillRect(Math.round(b.x) + 1, Math.round(b.y), 1, 4);
      ctx.fillStyle = PAL.w; ctx.fillRect(Math.round(b.x) + 1, Math.round(b.y), 1, 1);
    });

    if (state !== "lose" && !(player.inv > 0 && Math.floor(t * 14) % 2)) {
      drawRows(ctx, frame ? SHIP : SHIP_B, player.x, player.y);
    }
    parts.forEach(p => { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });

    // HUD
    text("SCORE " + String(score).padStart(5, "0"), 4, 4, PAL.w, 8, "left");
    for (let i = 0; i < lives; i++) drawRows(ctx, SHIP, W - 16 - i * 16, 3);

    if (state === "intro") {
      ctx.fillStyle = "rgba(20,16,42,.82)";
      ctx.fillRect(0, 0, W, H);
      text("BUG HUNT", W / 2, 36, PAL.g, 16);
      text("ELIMINA TODOS LOS BUGS", W / 2, 66, PAL.w);
      text("ANTES DEL DEPLOY", W / 2, 78, PAL.w);
      [["C", 102], ["A", 120], ["B", 138]].forEach(([type, y]) => {
        drawRows(ctx, BUGS[type][frame], W / 2 - 44, y);
        text(`= ${PTS[type]} PTS`, W / 2 - 24, y + 1, PAL.m, 8, "left");
      });
      text("EN PICADA VALEN X2", W / 2, 158, PAL.o);
      if (blinkOn()) text(matchMedia("(hover: none)").matches ? "TOCA PARA EMPEZAR" : "ESPACIO PARA EMPEZAR", W / 2, 184, PAL.o);
    } else if (state === "win") {
      ctx.fillStyle = "rgba(20,16,42,.7)";
      ctx.fillRect(0, 70, W, 84);
      text("NIVEL SUPERADO!", W / 2, 82, PAL.g, 12);
      text("DEPLOY EXITOSO · 0 BUGS", W / 2, 106, PAL.w);
      if (blinkOn()) text(`+${score + 500} PTS`, W / 2, 126, PAL.o);
    } else if (state === "lose") {
      ctx.fillStyle = "rgba(20,16,42,.75)";
      ctx.fillRect(0, 64, W, 96);
      text("GAME OVER", W / 2, 76, PAL.p, 16);
      text("LOS BUGS LLEGARON", W / 2, 102, PAL.w);
      text("A PRODUCCION", W / 2, 114, PAL.w);
      if (blinkOn()) text("ENTER REINTENTAR · ESC SALIR", W / 2, 138, PAL.o);
    }
  }

  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    if (api.active && !stopping) raf = requestAnimationFrame(loop);
  }

  function begin() {
    reset();
    state = "play";
    Music.play("boss");   // al reintentar después de perder vuelve la música
    Sfx.select();
  }

  async function start() {
    if (api.active) return;
    api.active = true;
    Coins.clear();
    Music.play("boss");
    await document.fonts.load('8px "Press Start 2P"').catch(() => {});
    await Wipe.cover(innerWidth / 2, innerHeight / 2);
    wrap.hidden = false;
    fit();
    reset();
    state = "intro";
    keys = {}; pointerX = null; firing = false;
    await Wipe.reveal();
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  async function stop() {
    if (!api.active || stopping) return;
    stopping = true;
    cancelAnimationFrame(raf);
    await Wipe.cover(innerWidth / 2, innerHeight / 2);
    wrap.hidden = true;
    Music.play("menu");
    if (current !== "menu") {
      await show("menu", { instant: true });
      history.replaceState(null, "", "#/");
    }
    await Wipe.reveal();
    api.active = false;
    stopping = false;
  }

  /* ----- Controles ----- */
  addEventListener("keydown", e => {
    if (!api.active) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter", "Backspace"].includes(e.key)) e.preventDefault();
    if (e.key === "Escape") return stop();
    keys[k] = true;
    if (state === "intro" && (k === " " || k === "Enter")) begin();
    else if (state === "lose" && k === "Enter") begin();
    else if (state === "win" && endT > 1 && (k === " " || k === "Enter")) stop();
  });
  addEventListener("keyup", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys[k] = false;
  });

  const toGameX = e => {
    const r = cv.getBoundingClientRect();
    return (e.clientX - r.left) / r.width * W;
  };
  cv.addEventListener("pointerdown", e => {
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    if (state === "intro" || state === "lose") return begin();
    pointerX = toGameX(e);
    firing = true;
  });
  cv.addEventListener("pointermove", e => {
    if (e.pointerType === "mouse" || firing) pointerX = toGameX(e);
  });
  ["pointerup", "pointercancel"].forEach(ev => cv.addEventListener(ev, () => { firing = false; }));
  addEventListener("resize", () => { if (api.active) fit(); });

  return api;
})();

/* =========================================================
   MONEDAS SECRETAS
   ========================================================= */
const Coins = (() => {
  const GOAL = 5;
  const hud = $("#hudCoins");
  const countEl = $("#coinCount");
  let count = 0, live = 0;

  const canSpawn = () =>
    $("#start").hidden && !Game.active && !busy && !document.hidden && live < 2;

  // Solo cuenta como "fondo" lo que no es contenido: body, main, la sección vacía o el canvas de fondo
  const SIZE = 40, PAD = 14;
  const isBackground = el =>
    !el || el === document.documentElement || el === document.body ||
    el.id === "app" || el.id === "bg" || el.classList.contains("view");

  function freeSpot() {
    for (let i = 0; i < 40; i++) {
      const x = 8 + Math.random() * (innerWidth - SIZE - 16);
      const y = 64 + Math.random() * (innerHeight - SIZE - 72);
      let ok = true;
      for (let gx = 0; gx <= 4 && ok; gx++) {
        for (let gy = 0; gy <= 4 && ok; gy++) {
          const px = x - PAD + (SIZE + PAD * 2) * gx / 4;
          const py = y - PAD + (SIZE + PAD * 2) * gy / 4;
          if (!isBackground(document.elementFromPoint(px, py))) ok = false;
        }
      }
      if (ok) return { x, y };
    }
    return null;
  }

  function spawn() {
    if (!canSpawn()) return;
    const spot = freeSpot();
    if (!spot) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "coin";
    b.setAttribute("aria-label", "Moneda");
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    paintCoin(c);
    b.appendChild(c);
    const { x, y } = spot;
    // anclada a la página: al scrollear no se cruza con el contenido
    b.style.left = x + scrollX + "px";
    b.style.top = y + scrollY + "px";
    live++;

    const leaveT = setTimeout(() => b.classList.add("is-leaving"), 6000);
    const removeT = setTimeout(remove, 7500);
    function remove() {
      clearTimeout(leaveT); clearTimeout(removeT);
      if (b.isConnected) { b.remove(); live--; }
    }
    b.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation();
      Sfx.init(); Sfx.coin();
      sparks(b, PAL.o);
      const r = b.getBoundingClientRect();
      floater("+1", r.left, r.top);
      remove();
      collect();
    });
    document.body.appendChild(b);
  }

  function collect() {
    count++;
    hud.hidden = false;
    countEl.textContent = count;
    if (count < GOAL) return;
    count = 0;
    toast("★ 5 MONEDAS ★ BUG HUNT DESBLOQUEADO");
    Logros.unlock("secreto");
    setTimeout(() => { countEl.textContent = "0"; Game.start(); }, 1300);
  }

  (function loop() {
    spawn();
    setTimeout(loop, 6000 + Math.random() * 7000);
  })();

  const clear = () => { $$(".coin").forEach(c => c.remove()); live = 0; };
  // al cambiar de sección o de tamaño, el contenido se mueve: limpiamos
  addEventListener("hashchange", clear);
  // (solo el ancho: en celulares el alto cambia al scrollear por la barra del navegador)
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; clear(); } });

  return { clear };
})();
