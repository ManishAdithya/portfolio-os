/*
 * Animated cosmos wallpapers, generated procedurally on a <canvas> (no image files).
 * Heavy textures (gas, dust, galaxy, planet) are rendered once per resize; each frame only
 * composites them with parallax, twinkling stars, slow rotation and shooting stars.
 */
(function () {
  const { $, store } = OS;
  const M = 40; // parallax margin (CSS px)

  /* ---------- math + noise ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeNoise(seed) {
    const r = rng(seed), P = new Uint8Array(512), V = new Float32Array(256);
    for (let i = 0; i < 256; i++) { P[i] = i; V[i] = r(); }
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = P[i]; P[i] = P[j]; P[j] = tmp; }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const n = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1, nm = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); nm += a; a *= 0.5; f *= 2.03; } return s / nm; };
    return { n, fbm };
  }
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const gauss = (r) => (r() + r() + r() + r() - 2) * 0.87;
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

  /* ---------- stars ---------- */
  function starColor(r) {
    const x = r();
    return x < 0.07 ? "155,176,255" : x < 0.22 ? "190,205,255" : x < 0.58 ? "248,247,255" : x < 0.8 ? "255,242,228" : x < 0.93 ? "255,214,165" : "255,186,120";
  }
  const spriteCache = {};
  function sprite(col, spikes) {
    const key = col + spikes;
    if (spriteCache[key]) return spriteCache[key];
    const c = mk(128, 128), g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.04, `rgba(${col},.95)`);
    gr.addColorStop(0.1, `rgba(${col},.35)`);
    gr.addColorStop(0.28, `rgba(${col},.07)`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    if (spikes) {
      g.globalCompositeOperation = "lighter";
      [0, Math.PI / 2].forEach((a) => {
        g.save(); g.translate(64, 64); g.rotate(a);
        const lg = g.createLinearGradient(-64, 0, 64, 0);
        lg.addColorStop(0, `rgba(${col},0)`); lg.addColorStop(0.5, "rgba(255,255,255,.85)"); lg.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = lg; g.fillRect(-64, -0.7, 128, 1.4);
        g.restore();
      });
    }
    return (spriteCache[key] = c);
  }
  // faint background stars baked into a canvas; weight(x,y) in 0..1 controls density
  function starLayer(w, h, K, r, count, weight) {
    const c = mk(w * K, h * K), g = c.getContext("2d");
    g.scale(K, K);
    for (let i = 0; i < count; i++) {
      const x = r() * w, y = r() * h;
      if (weight && r() > weight(x, y)) continue;
      const m = Math.pow(r(), 3.2), s = m > 0.8 ? 1.7 : m > 0.4 ? 1.15 : 0.75;
      g.fillStyle = `rgba(${starColor(r)},${0.12 + m * 0.88})`;
      g.fillRect(x, y, s, s);
    }
    return c;
  }
  function makeBright(w, h, r, n, weight) {
    const out = [];
    for (let i = 0; i < n * 3 && out.length < n; i++) {
      const x = r() * w, y = r() * h;
      if (weight && r() > weight(x, y)) continue;
      const size = 7 + Math.pow(r(), 5) * 46;
      out.push({ x, y, size, col: starColor(r), sp: 0.4 + r() * 1.6, ph: r() * 6.28, spikes: size > 26 });
    }
    return out;
  }
  function drawBright(g, list, t, ox, oy) {
    g.save(); g.globalCompositeOperation = "lighter";
    for (const s of list) {
      g.globalAlpha = 0.6 + 0.4 * Math.sin(t * s.sp + s.ph);
      g.drawImage(sprite(s.col, s.spikes), s.x + ox - s.size / 2, s.y + oy - s.size / 2, s.size, s.size);
    }
    g.restore();
  }
  function bgFill(g, w, h, inner, outer, cx = 0.5, cy = 0.5) {
    const gr = g.createRadialGradient(w * cx, h * cy, 0, w * cx, h * cy, Math.max(w, h) * 0.75);
    gr.addColorStop(0, inner); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  function paint(w, h, fn) {
    const c = mk(w, h), x = c.getContext("2d"), im = x.createImageData(c.width, c.height), d = im.data;
    for (let py = 0; py < c.height; py++) for (let px = 0; px < c.width; px++) fn(px, py, d, (py * c.width + px) * 4);
    x.putImageData(im, 0, 0);
    return c;
  }
  function newBase(W, H, K) {
    const bw = W + 2 * M, bh = H + 2 * M, c = mk(bw * K, bh * K), g = c.getContext("2d");
    g.scale(K, K);
    return { bw, bh, c, g };
  }

  /* ---------- shooting stars (all scenes) ---------- */
  let shoot = null, nextShoot = 5;
  function shooting(g, t, W, H) {
    if (!shoot && t > nextShoot) {
      shoot = { x: W * (0.1 + Math.random() * 0.7), y: H * Math.random() * 0.4, a: 0.3 + Math.random() * 0.5, t0: t, len: 110 + Math.random() * 140, sp: 650 + Math.random() * 450 };
      nextShoot = t + 7 + Math.random() * 11;
    }
    if (!shoot) return;
    const e = t - shoot.t0, life = 0.95;
    if (e > life) { shoot = null; return; }
    const d = e * shoot.sp, cx = Math.cos(shoot.a), sy = Math.sin(shoot.a);
    const x = shoot.x + cx * d, y = shoot.y + sy * d, tx = x - cx * shoot.len, ty = y - sy * shoot.len;
    const fade = Math.sin((Math.PI * e) / life);
    const lg = g.createLinearGradient(tx, ty, x, y);
    lg.addColorStop(0, "rgba(200,215,255,0)"); lg.addColorStop(1, `rgba(255,255,255,${0.85 * fade})`);
    g.save(); g.globalCompositeOperation = "lighter";
    g.strokeStyle = lg; g.lineWidth = 1.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(x, y); g.stroke();
    g.globalAlpha = fade; g.drawImage(sprite("220,230,255", false), x - 9, y - 9, 18, 18);
    g.restore();
  }

  /* ================= Scenes ================= */
  const SCENES = {
    /* ---------- 1. Spiral galaxy ---------- */
    galaxy(W, H, K) {
      const r = rng(11), N = makeNoise(11), B = newBase(W, H, K), { bw, bh } = B;
      bgFill(B.g, bw, bh, "#0b0a1c", "#020207", 0.6, 0.5);
      const hs = 3 / Math.ceil(bw / 6);
      B.g.drawImage(paint(bw / 6, bh / 6, (x, y, d, i) => {
        const v = N.fbm(x * hs, y * hs, 5), a = ss(0.48, 0.85, v);
        d[i] = 70; d[i + 1] = 55; d[i + 2] = 130; d[i + 3] = a * 70;
      }), 0, 0, bw, bh);
      B.g.drawImage(starLayer(bw, bh, K, r, Math.round((bw * bh) / 600)), 0, 0, bw, bh);
      const bright = makeBright(bw, bh, r, Math.round((bw * bh) / 15000));

      // galaxy texture (face-on); tilted and rotated at draw time
      const S = Math.min(1800, Math.round(Math.max(W, H) * 0.95 * K)), G = mk(S, S), q = G.getContext("2d"), c = S / 2, Rm = S * 0.48, u = S / 1600;
      q.globalCompositeOperation = "lighter";
      let gr = q.createRadialGradient(c, c, 0, c, c, Rm);
      gr.addColorStop(0, "rgba(150,160,230,.1)"); gr.addColorStop(0.5, "rgba(120,130,210,.03)"); gr.addColorStop(1, "rgba(100,110,200,0)");
      q.fillStyle = gr; q.fillRect(0, 0, S, S);
      const armAt = (rr) => Math.log(1 + rr * 9) * 2.15;
      const n = Math.min(70000, Math.round((S * S) / 32));
      for (let i = 0; i < n; i++) {
        const field = r() < 0.22, rr = Math.min(1, -Math.log(1 - r() * 0.995) * 0.31);
        const th = field ? r() * 6.2832 : (i & 1) * Math.PI + armAt(rr) + gauss(r) * (0.13 + 0.22 * (1 - rr));
        const x = c + Math.cos(th) * rr * Rm, y = c + Math.sin(th) * rr * Rm;
        const col = rr < 0.16 ? "255,222,182" : field ? "228,218,206" : r() < 0.75 ? "170,198,255" : "255,242,228";
        q.fillStyle = `rgba(${col},${(field ? 0.12 : 0.55) * (0.4 + r() * 0.6) * (1 - rr * 0.5)})`;
        const s = r() < 0.035 ? 2 * u : u;
        q.fillRect(x, y, s, s);
      }
      for (let i = 0; i < 150; i++) { // star-forming regions
        const rr = 0.22 + r() * 0.62, th = (i & 1) * Math.PI + armAt(rr) + gauss(r) * 0.1;
        const x = c + Math.cos(th) * rr * Rm, y = c + Math.sin(th) * rr * Rm, rad = (1.5 + r() * 4) * u;
        gr = q.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, "rgba(255,130,180,.4)"); gr.addColorStop(1, "rgba(255,90,150,0)");
        q.fillStyle = gr; q.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      gr = q.createRadialGradient(c, c, 0, c, c, Rm * 0.4); // bulge
      gr.addColorStop(0, "rgba(255,240,210,1)"); gr.addColorStop(0.07, "rgba(255,218,170,.8)"); gr.addColorStop(0.3, "rgba(240,185,140,.22)"); gr.addColorStop(1, "rgba(220,160,140,0)");
      q.fillStyle = gr; q.fillRect(0, 0, S, S);
      q.globalCompositeOperation = "source-over"; // dust lanes on the inner edge of each arm
      for (let i = 0; i < 16000; i++) {
        const rr = 0.1 + r() * 0.82, th = (i & 1) * Math.PI + armAt(rr) - 0.24 + gauss(r) * 0.07;
        const s = (1.5 + r() * 3.2) * u;
        q.fillStyle = "rgba(8,5,12,.11)";
        q.fillRect(c + Math.cos(th) * rr * Rm, c + Math.sin(th) * rr * Rm, s, s);
      }
      q.globalCompositeOperation = "lighter"; // bloom
      [[8, 0.65], [32, 0.5]].forEach(([div, a]) => { const sm = mk(S / div, S / div); sm.getContext("2d").drawImage(G, 0, 0, sm.width, sm.height); q.globalAlpha = a; q.drawImage(sm, 0, 0, S, S); });
      q.globalAlpha = 1;

      return (g, t, px, py) => {
        g.drawImage(B.c, -M + px * 10, -M + py * 10, bw, bh);
        drawBright(g, bright, t, -M + px * 18, -M + py * 18);
        const port = H > W, D = port ? H * 0.9 : Math.max(W, H) * 0.8;
        g.save(); g.globalCompositeOperation = "lighter";
        g.translate(W * (port ? 0.5 : 0.6) + px * 28, H * (port ? 0.6 : 0.5) + py * 28);
        g.rotate(-0.38); g.scale(1, 0.46); g.rotate(t * 0.008);
        g.drawImage(G, -D / 2, -D / 2, D, D);
        g.restore();
      };
    },

    /* ---------- 2. Nebula ---------- */
    nebula(W, H, K) {
      const r = rng(23), N = makeNoise(23), B = newBase(W, H, K), { bw, bh } = B;
      bgFill(B.g, bw, bh, "#08061a", "#020106", 0.6, 0.5);
      B.g.drawImage(starLayer(bw, bh, K, r, Math.round((bw * bh) / 520)), 0, 0, bw, bh);
      const nw = Math.ceil(bw / 4), nh = Math.ceil(bh / 4), k = 3.2 / Math.max(nw, nh);
      const em = mk(nw, nh), du = mk(nw, nh), ex = em.getContext("2d"), dx = du.getContext("2d");
      const ei = ex.createImageData(nw, nh), di = dx.createImageData(nw, nh), E = ei.data, Dd = di.data;
      const A = [255, 62, 112], Bc = [42, 196, 214], C = [118, 92, 255];
      for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
        const X = x * k, Y = y * k, i = (y * nw + x) * 4;
        const mx = (x / nw - 0.6) * 1.25, my = y / nh - 0.5, mask = ss(0.95, 0.1, Math.sqrt(mx * mx + my * my));
        if (mask <= 0) continue;
        const qx = N.fbm(X + 1.7, Y + 9.2, 4), qy = N.fbm(X + 8.3, Y + 2.8, 4);
        const dn = N.fbm(X + 2.3 * qx, Y + 2.3 * qy, 6);
        const dens = ss(0.36, 0.82, dn) * mask;
        const ridge = 1 - Math.abs(N.fbm(X * 2.2 + 4 + qx, Y * 2.2 + 4 + qy, 5) * 2 - 1), fil = Math.pow(ridge, 7) * mask;
        const m = N.fbm(X * 0.8 + 11, Y * 0.8 + 3, 3);
        let cr, cg, cb;
        if (m < 0.5) { const f = m * 2; cr = C[0] + (A[0] - C[0]) * f; cg = C[1] + (A[1] - C[1]) * f; cb = C[2] + (A[2] - C[2]) * f; }
        else { const f = Math.min(1, (m - 0.5) * 2.4); cr = A[0] + (Bc[0] - A[0]) * f; cg = A[1] + (Bc[1] - A[1]) * f; cb = A[2] + (Bc[2] - A[2]) * f; }
        const dust = ss(0.55, 0.72, N.fbm(X * 1.7 + 20, Y * 1.7 + 20, 5)) * Math.min(1, mask * 1.4);
        let bri = (Math.pow(dens, 1.5) * 1.05 + fil * 0.6 * Math.sqrt(dens)) * (1 - dust * 0.9);
        const hot = Math.max(0, bri - 0.75) * 2; // dense cores turn whiter
        E[i] = cr * bri + 255 * hot; E[i + 1] = cg * bri + 235 * hot; E[i + 2] = cb * bri + 225 * hot; E[i + 3] = Math.min(255, bri * 300);
        Dd[i + 3] = dust * 205;
      }
      ex.putImageData(ei, 0, 0); dx.putImageData(di, 0, 0);
      B.g.imageSmoothingQuality = "high";
      B.g.drawImage(du, 0, 0, bw, bh);
      B.g.globalCompositeOperation = "lighter"; B.g.drawImage(em, 0, 0, bw, bh); B.g.globalCompositeOperation = "source-over";
      const bright = makeBright(bw, bh, r, Math.round((bw * bh) / 17000));
      for (let i = 0; i < 6; i++) bright.push({ x: bw * (0.45 + r() * 0.3), y: bh * (0.3 + r() * 0.4), size: 34 + r() * 30, col: r() < 0.5 ? "190,205,255" : "248,247,255", sp: 0.5 + r(), ph: r() * 6, spikes: true });

      return (g, t, px, py) => {
        g.drawImage(B.c, -M + px * 10, -M + py * 10, bw, bh);
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.2;
        g.drawImage(em, -M + px * 16 + Math.sin(t * 0.05) * 12, -M + py * 16 + Math.cos(t * 0.04) * 9, bw * 1.015, bh * 1.015);
        g.restore();
        drawBright(g, bright, t, -M + px * 20, -M + py * 20);
      };
    },

    /* ---------- 3. Black hole ---------- */
    blackhole(W, H, K) {
      const r = rng(37), N = makeNoise(37), B = newBase(W, H, K), { bw, bh } = B;
      bgFill(B.g, bw, bh, "#0a0710", "#010103", 0.6, 0.5);
      B.g.drawImage(starLayer(bw, bh, K, r, Math.round((bw * bh) / 650)), 0, 0, bw, bh);
      const bright = makeBright(bw, bh, r, Math.round((bw * bh) / 20000));
      // accretion disk, face-on; rIn = inner edge as a fraction of the radius.
      // Noise is sampled on a polar grid first (cheap), then mapped to pixels by lookup.
      const disk = (Ts, rIn) => {
        const NA = 1024, NR = 192, r0 = rIn * 0.92, grid = new Float32Array(NA * NR), ringN = new Float32Array(NR);
        for (let ri = 0; ri < NR; ri++) ringN[ri] = N.fbm((r0 + ((1 - r0) * ri) / (NR - 1)) * 26 + 3, 1.3, 3);
        for (let ai = 0; ai < NA; ai++) {
          const a = (ai / NA) * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
          for (let ri = 0; ri < NR; ri++) {
            const rad = r0 + ((1 - r0) * ri) / (NR - 1);
            grid[ai * NR + ri] = 0.4 + (0.55 * ringN[ri] + 0.45 * N.fbm(ca * 3 + rad * 7, sa * 3 + rad * 7, 4)) * 0.95;
          }
        }
        return paint(Ts, Ts, (x, y, d, i) => {
        const dx = x / (Ts / 2) - 1, dy = y / (Ts / 2) - 1, rad = Math.sqrt(dx * dx + dy * dy);
        if (rad < r0 || rad > 1) return;
        const ai = ((((Math.atan2(dy, dx) / 6.2832) + 1) % 1) * NA) | 0, ri = Math.min(NR - 1, (((rad - r0) / (1 - r0)) * (NR - 1)) | 0);
        const tc = 1 - (rad - rIn) / (1 - rIn);
        const b = Math.pow(Math.max(0, tc), 1.7) * ss(r0, rIn * 1.06, rad) * grid[ai * NR + ri];
        let cr, cg, cb;
        if (tc > 0.6) { const f = (tc - 0.6) / 0.4; cr = 255; cg = 160 + 85 * f; cb = 70 + 150 * f; }
        else { const f = tc / 0.6; cr = 170 + 85 * f; cg = 50 + 110 * f; cb = 15 + 55 * f; }
        const k2 = Math.min(1, b * 1.6);
        d[i] = cr * k2; d[i + 1] = cg * k2; d[i + 2] = cb * k2; d[i + 3] = Math.min(255, b * 360);
        });
      };
      const T = disk(Math.min(1000, Math.round(Math.min(W, H) * 1.4 * K)), 0.34), L = disk(600, 0.7);

      return (g, t, px, py) => {
        g.drawImage(B.c, -M + px * 10, -M + py * 10, bw, bh);
        drawBright(g, bright, t, -M + px * 18, -M + py * 18);
        const port = H > W, cx = W * (port ? 0.5 : 0.6) + px * 22, cy = H * (port ? 0.52 : 0.48) + py * 22;
        const Rs = Math.min(W, H) * (port ? 0.15 : 0.135), Rd = Rs / 0.34 * 1.05, Rl = (Rs * 1.05) / 0.7, rot = t * 0.06;
        g.save(); g.globalCompositeOperation = "lighter";
        let gr = g.createRadialGradient(cx, cy, Rs, cx, cy, Rd * 1.4);
        gr.addColorStop(0, "rgba(255,160,80,.28)"); gr.addColorStop(0.4, "rgba(255,110,40,.08)"); gr.addColorStop(1, "rgba(255,90,30,0)");
        g.fillStyle = gr; g.fillRect(cx - Rd * 1.5, cy - Rd * 1.5, Rd * 3, Rd * 3);
        const flat = (clipTop) => {
          g.save(); g.beginPath();
          clipTop ? g.rect(cx - Rd - 2, cy - Rd, Rd * 2 + 4, Rd) : g.rect(cx - Rd - 2, cy, Rd * 2 + 4, Rd);
          g.clip(); g.translate(cx, cy); g.scale(1, 0.15); g.rotate(rot);
          g.drawImage(T, -Rd, -Rd, Rd * 2, Rd * 2); g.restore();
        };
        flat(true); // far half of the disk
        g.save(); g.beginPath(); g.rect(cx - Rl - 2, cy - Rl - 2, Rl * 2 + 4, Rl + 2); g.clip(); // lensed image above
        g.translate(cx, cy); g.rotate(-rot * 0.8); g.drawImage(L, -Rl, -Rl, Rl * 2, Rl * 2); g.restore();
        g.save(); g.globalAlpha = 0.5; g.beginPath(); g.rect(cx - Rl - 2, cy, Rl * 2 + 4, Rl + 2); g.clip(); // fainter image below
        g.translate(cx, cy); g.scale(1, 0.8); g.rotate(rot * 0.8); g.drawImage(L, -Rl * 0.9, -Rl * 0.9, Rl * 1.8, Rl * 1.8); g.restore();
        gr = g.createRadialGradient(cx - Rd * 0.5, cy, 0, cx - Rd * 0.5, cy, Rd * 0.6); // doppler beaming: approaching side brighter
        gr.addColorStop(0, "rgba(255,220,170,.22)"); gr.addColorStop(1, "rgba(255,200,150,0)");
        g.save(); g.translate(0, cy); g.scale(1, 0.2); g.translate(0, -cy); g.fillStyle = gr; g.fillRect(cx - Rd * 1.2, cy - Rd, Rd * 1.4, Rd * 2); g.restore();
        g.restore();
        g.fillStyle = "#000"; g.beginPath(); g.arc(cx, cy, Rs, 0, 6.2832); g.fill(); // event horizon shadow
        g.save(); g.globalCompositeOperation = "lighter";
        g.strokeStyle = "rgba(255,225,185,.22)"; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, Rs * 1.03, 0, 6.2832); g.stroke();
        g.strokeStyle = "rgba(255,240,215,.9)"; g.lineWidth = 1.1; g.beginPath(); g.arc(cx, cy, Rs * 1.025, 0, 6.2832); g.stroke();
        flat(false); // near half of the disk, in front of the shadow
        g.restore();
      };
    },

    /* ---------- 4. Planet horizon at sunrise ---------- */
    planet(W, H, K) {
      const r = rng(51), N = makeNoise(51), B = newBase(W, H, K), { bw, bh } = B;
      const R = Math.max(W, H) * 1.15, cx = bw * 0.48, cy = bh * (H > W ? 0.68 : 0.62) + R;
      const sunX = bw * (H > W ? 0.7 : 0.74), sunY = cy - Math.sqrt(Math.max(0, R * R - (sunX - cx) ** 2));
      // sun sits just behind the limb, so only a thin crescent near the horizon is in daylight
      let lx = ((sunX - cx) / R) * 0.32, ly = ((sunY - cy) / R) * 0.32, lz = -0.95;
      const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      const above = (x, y) => ((x - cx) ** 2 + (y - cy) ** 2 > (R * 1.02) ** 2 ? 1 : 0);
      bgFill(B.g, bw, bh, "#06081a", "#010206", 0.7, 0.3);
      B.g.drawImage(starLayer(bw, bh, K, r, Math.round((bw * bh) / 600), above), 0, 0, bw, bh);
      const bright = makeBright(bw, bh, r, Math.round((bw * bh) / 18000), (x, y) => above(x, y + 30));
      const pw = Math.ceil(bw / 2), ph = Math.ceil(bh / 2), y0 = Math.max(0, Math.floor((cy - R * 1.05) / 2));
      const P = mk(pw, ph), px2 = P.getContext("2d"), im = px2.createImageData(pw, ph), d = im.data;
      for (let y = y0; y < ph; y++) for (let x = 0; x < pw; x++) {
        const X = x * 2 + 1, Y = y * 2 + 1, dx = (X - cx) / R, dy = (Y - cy) / R, d2 = dx * dx + dy * dy, i = (y * pw + x) * 4;
        if (d2 > 1.09) continue;
        if (d2 <= 1) {
          const nz = Math.sqrt(1 - d2), dl = dx * lx + dy * ly + nz * lz, l = Math.max(0, dl);
          const u = Math.atan2(dx, nz) * 3, v = Math.asin(Math.max(-1, Math.min(1, dy))) * 3;
          const land = N.fbm(u * 1.2 + 3, v * 1.2 + 7, 5), isLand = land > 0.56;
          const clouds = ss(0.5, 0.86, N.fbm(u * 4.2 + 20, v * 8.5 + 20, 7));
          let ar = 10, ag = 28, ab = 64;
          if (isLand) { const f = (land - 0.56) * 4; ar = 62 + f * 70; ag = 70 + f * 30; ab = 42 + f * 10; }
          ar += (235 - ar) * clouds; ag += (240 - ag) * clouds; ab += (250 - ab) * clouds;
          const sh = l * 1.4 + 0.012;
          let cr = ar * sh, cg = ag * sh, cb = ab * sh;
          const tw = ss(-0.16, 0, dl) * (1 - ss(0, 0.22, dl));
          cr += 255 * tw * 0.2; cg += 110 * tw * 0.2; cb += 50 * tw * 0.2;
          if (isLand && dl < -0.04 && clouds < 0.45) {
            const cn = N.n(u * 95, v * 95);
            if (cn > 0.7) { const li = (cn - 0.7) * 3.3 * (1 - clouds * 2) * ss(-0.04, -0.2, dl); cr += 255 * li; cg += 170 * li; cb += 80 * li; }
          }
          const rim = Math.pow(1 - nz, 2.4), atm = rim * (0.06 + 1.5 * Math.max(0, dl + 0.32));
          cr += 70 * atm; cg += 140 * atm; cb += 255 * atm;
          d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
        } else {
          const dd = Math.sqrt(d2), h = 1 - (dd - 1) / 0.044, dirl = (dx / dd) * lx + (dy / dd) * ly;
          const glow = h * h * (0.12 + 1.4 * Math.max(0, dirl + 0.35));
          d[i] = 90 * glow * 1.4; d[i + 1] = 160 * glow * 1.4; d[i + 2] = 255 * glow * 1.4; d[i + 3] = Math.min(255, glow * 255);
        }
      }
      px2.putImageData(im, 0, 0);
      B.g.imageSmoothingQuality = "high";
      B.g.drawImage(P, 0, 0, bw, bh);
      const moon = paint(80, 80, (x, y, dd, i) => { // small cratered moon lit by the same sun
        const mx = x / 40 - 1, my = y / 40 - 1, m2 = mx * mx + my * my;
        if (m2 > 1) return;
        const nz = Math.sqrt(1 - m2), l = Math.max(0, mx * lx + my * ly + nz * Math.abs(lz) * 0.6 + 0.25);
        const al = 150 + N.fbm(mx * 4 + 50, my * 4 + 50, 4) * 90 - ss(0.62, 0.7, N.n(mx * 9 + 9, my * 9)) * 60;
        dd[i] = al * l; dd[i + 1] = al * l * 0.97; dd[i + 2] = al * l * 1.02; dd[i + 3] = 255 * ss(1, 0.94, m2);
      });

      return (g, t, ppx, ppy) => {
        const ox = -M + ppx * 10, oy = -M + ppy * 10;
        g.drawImage(B.c, ox, oy, bw, bh);
        drawBright(g, bright, t, -M + ppx * 18, -M + ppy * 18);
        g.drawImage(moon, W * 0.18 + Math.sin(t * 0.02) * 18 + ppx * 14 - 20, H * 0.2 + ppy * 14 - 20, 40, 40);
        const sx = sunX + ox, sy = sunY + oy, pulse = 0.94 + 0.06 * Math.sin(t * 0.7);
        g.save(); g.globalCompositeOperation = "lighter";
        let gr = g.createRadialGradient(sx, sy, 0, sx, sy, H * 0.65);
        gr.addColorStop(0, `rgba(255,244,228,${0.42 * pulse})`); gr.addColorStop(0.12, "rgba(255,215,170,.14)"); gr.addColorStop(0.45, "rgba(150,170,255,.04)"); gr.addColorStop(1, "rgba(120,140,255,0)");
        g.fillStyle = gr; g.fillRect(sx - H, sy - H, H * 2, H * 2);
        gr = g.createRadialGradient(sx, sy, 0, sx, sy, 34);
        gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,250,240,.7)"); gr.addColorStop(1, "rgba(255,240,220,0)");
        g.fillStyle = gr; g.fillRect(sx - 34, sy - 34, 68, 68);
        g.save(); g.translate(sx, sy); g.scale(1, 0.012); // anamorphic streak
        gr = g.createRadialGradient(0, 0, 0, 0, 0, W * 0.55);
        gr.addColorStop(0, `rgba(175,200,255,${0.55 * pulse})`); gr.addColorStop(1, "rgba(150,180,255,0)");
        g.fillStyle = gr; g.fillRect(-W * 0.55, -W * 0.55, W * 1.1, W * 1.1); g.restore();
        [[0.45, 14, "120,200,255"], [0.75, 26, "180,140,255"], [1.2, 9, "255,200,140"], [1.55, 40, "120,255,200"]].forEach(([f, rad, col]) => {
          const gx = sx + (W / 2 - sx) * f, gy = sy + (H / 2 - sy) * f;
          gr = g.createRadialGradient(gx, gy, 0, gx, gy, rad);
          gr.addColorStop(0, `rgba(${col},.07)`); gr.addColorStop(0.8, `rgba(${col},.04)`); gr.addColorStop(1, `rgba(${col},0)`);
          g.fillStyle = gr; g.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
        });
        g.restore();
      };
    },

    /* ---------- 5. Deep space with the Milky Way ---------- */
    deep(W, H, K) {
      const r = rng(71), N = makeNoise(71), B = newBase(W, H, K), { bw, bh } = B;
      bgFill(B.g, bw, bh, "#06060f", "#010103");
      const x0 = 0, y0 = bh * 0.9, x1 = bw, y1 = bh * 0.08, len = Math.hypot(x1 - x0, y1 - y0), nx = (x1 - x0) / len, ny = (y1 - y0) / len;
      const bandW = Math.min(bw, bh) * 0.17;
      const dist = (x, y) => Math.abs((x - x0) * ny - (y - y0) * nx), along = (x, y) => ((x - x0) * nx + (y - y0) * ny) / len;
      const sc = 4, k = 3.4 / Math.ceil(bw / sc);
      const mw = paint(bw / sc, bh / sc, (x, y, d, i) => {
        const X = x * sc, Y = y * sc, dd = dist(X, Y) / bandW, prof = Math.exp(-dd * dd);
        if (prof < 0.01) return;
        const s = along(X, Y), bump = Math.exp(-(((s - 0.55) / 0.22) ** 2));
        const v = N.fbm(x * k, y * k, 6), dust = ss(0.55, 0.7, N.fbm(x * k * 5 + 9, y * k * 5 + 9, 5)) * prof;
        const bri = prof * (0.25 + 0.75 * v) * (0.5 + 0.9 * bump) * (1 - dust * 0.6);
        d[i] = 170 + 85 * bump; d[i + 1] = 185 + 40 * bump; d[i + 2] = 255 - 65 * bump; d[i + 3] = Math.min(255, bri * 240);
      });
      B.g.imageSmoothingQuality = "high";
      B.g.drawImage(starLayer(bw, bh, K, r, Math.round((bw * bh) / 210), (x, y) => 0.14 + 0.86 * Math.exp(-((dist(x, y) / (bandW * 1.25)) ** 2))), 0, 0, bw, bh);
      B.g.globalCompositeOperation = "lighter"; B.g.drawImage(mw, 0, 0, bw, bh); B.g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 9; i++) { // distant galaxies
        const gx = r() * bw, gy = r() * bh, gs = 4 + r() * 9;
        B.g.save(); B.g.translate(gx, gy); B.g.rotate(r() * 3.14); B.g.scale(1, 0.35 + r() * 0.4);
        const gr = B.g.createRadialGradient(0, 0, 0, 0, 0, gs);
        gr.addColorStop(0, "rgba(255,235,210,.7)"); gr.addColorStop(0.3, "rgba(200,190,255,.25)"); gr.addColorStop(1, "rgba(180,170,255,0)");
        B.g.fillStyle = gr; B.g.fillRect(-gs, -gs, gs * 2, gs * 2); B.g.restore();
      }
      const bright = makeBright(bw, bh, r, Math.round((bw * bh) / 12000));
      return (g, t, px, py) => {
        g.drawImage(B.c, -M + px * 10, -M + py * 10, bw, bh);
        drawBright(g, bright, t, -M + px * 22, -M + py * 22);
      };
    }
  };

  const LIST = [
    ["galaxy", "Spiral galaxy", "radial-gradient(ellipse 45% 22% at 58% 50%, #fff1d6 0%, #c7b8ff 18%, #3a3170 48%, transparent 75%), #04030a"],
    ["nebula", "Nebula", "radial-gradient(circle at 55% 45%, rgba(255,70,120,.9) 0%, transparent 38%), radial-gradient(circle at 72% 62%, rgba(40,200,210,.8) 0%, transparent 40%), radial-gradient(circle at 40% 60%, rgba(120,90,255,.7) 0%, transparent 45%), #05030d"],
    ["blackhole", "Black hole", "radial-gradient(circle at 55% 48%, #000 0 13%, #fff0d6 15%, #ff9a4a 21%, rgba(120,40,10,.6) 34%, transparent 50%), #030208"],
    ["planet", "Planet sunrise", "radial-gradient(circle at 74% 58%, #fff 0, rgba(255,230,200,.6) 6%, transparent 22%), radial-gradient(ellipse 120% 70% at 48% 140%, #0d1a3a 66%, #6fb4ff 68%, transparent 73%), #03040c"],
    ["deep", "Milky Way", "linear-gradient(150deg, #020208 30%, #3b3550 48%, #8a7a6a 52%, #3b3550 56%, #020208 72%)"]
  ];

  /* ---------- engine ---------- */
  const host = $("#wallpaper");
  const canvas = document.createElement("canvas");
  canvas.id = "wp-canvas";
  host.prepend(canvas);
  const g = canvas.getContext("2d");
  let id = "galaxy", draw = null, pending = true, W = 0, H = 0, K = 1, last = 0;
  const start = performance.now(), mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const reduced = () => document.body.classList.contains("reduce-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches;

  function build() {
    W = innerWidth; H = innerHeight; K = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * K); canvas.height = Math.round(H * K);
    try { draw = SCENES[id](W, H, K); } catch (e) { console.error(e); draw = null; }
    pending = false; shoot = null;
    render(performance.now());
  }
  function render(now) {
    if (!draw) return;
    const t = (now - start) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    g.setTransform(K, 0, 0, K, 0, 0);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    g.fillStyle = "#020206"; g.fillRect(0, 0, W, H);
    draw(g, t, mouse.x, mouse.y);
    if (!reduced()) shooting(g, t, W, H);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || $("#desktop").classList.contains("hidden")) return;
    if (pending) { build(); return; }
    if (reduced() || now - last < 33) return; // ~30 fps is plenty for slow motion
    last = now;
    render(now);
  }
  requestAnimationFrame(loop);

  addEventListener("pointermove", (e) => { mouse.tx = -(e.clientX / innerWidth - 0.5) * 2; mouse.ty = -(e.clientY / innerHeight - 0.5) * 2; });
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => (pending = true), 250); });

  OS.Wallpaper = {
    list: LIST,
    get id() { return id; },
    set(next) { id = SCENES[next] ? next : "galaxy"; pending = true; },
    // build ahead of time (e.g. while the login screen is up) so the desktop appears instantly
    prepare() { setTimeout(() => { if (pending) build(); }, 350); },
    buildNow() { build(); }
  };
})();
