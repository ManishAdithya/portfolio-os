/* Fun apps: Music (generated lo-fi), Paint, Snake. */
(function () {
  const { $, $$, h, esc, Sound, Ach, store, toast } = OS;
  const { registerApp } = OS.WM;

  /* ================= Music: lo-fi beats synthesized live with WebAudio ================= */
  const TRACKS = [
    { name: "Midnight Commit", artist: "lofi.exe", bpm: 78, color: "#7c6cff", icon: "moon", chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]] },
    { name: "Coffee & Code", artist: "lofi.exe", bpm: 86, color: "#f97316", icon: "coffee", chords: [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]] },
    { name: "Deploy on Friday", artist: "lofi.exe", bpm: 92, color: "#22c7a9", icon: "rocket", chords: [[62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 70], [57, 60, 64, 67]] }
  ];
  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const Player = {
    playing: false, track: 0, step: 0, nextTime: 0, timer: null, ctx: null, master: null, analyser: null, noise: null,
    init() {
      if (this.ctx) return true;
      const ctx = Sound.ensure(); if (!ctx) return false;
      this.ctx = ctx;
      this.master = ctx.createGain(); this.master.gain.value = 0.5;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 128;
      this.master.connect(lp).connect(this.analyser).connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
      // vinyl crackle bed
      const crackle = ctx.createBufferSource(); crackle.buffer = buf; crackle.loop = true;
      const cg = ctx.createGain(); cg.gain.value = 0.012; const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000;
      crackle.connect(hp).connect(cg).connect(this.master); crackle.start();
      return true;
    },
    env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); },
    pad(notes, t, dur) {
      notes.forEach((m) => [-6, 6].forEach((det) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = "triangle"; o.frequency.value = freq(m); o.detune.value = det;
        this.env(g, t, 0.25, 0.035, dur); o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.1);
      }));
    },
    bass(m, t, dur) { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = "sine"; o.frequency.value = freq(m - 24); this.env(g, t, 0.02, 0.22, dur); o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.05); },
    lead(m, t) { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = "sine"; o.frequency.value = freq(m + 12); this.env(g, t, 0.01, 0.05, 0.4); o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.5); },
    kick(t) { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); this.env(g, t, 0.005, 0.6, 0.3); o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.35); },
    hit(t, type, f, vol, dur) { const s = this.ctx.createBufferSource(), fl = this.ctx.createBiquadFilter(), g = this.ctx.createGain(); s.buffer = this.noise; fl.type = type; fl.frequency.value = f; this.env(g, t, 0.002, vol, dur); s.connect(fl).connect(g).connect(this.master); s.start(t); s.stop(t + dur + 0.05); },
    schedule() {
      const tr = TRACKS[this.track], spb = 60 / tr.bpm, s16 = spb / 4;
      while (this.nextTime < this.ctx.currentTime + 0.15) {
        const st = this.step % 64, bar = Math.floor(st / 16), inBar = st % 16, t = this.nextTime;
        const swing = inBar % 2 ? s16 * 0.12 : 0, ch = tr.chords[bar];
        if (inBar === 0) this.pad(ch, t, spb * 4);
        if (inBar === 0 || inBar === 10) this.bass(ch[0], t, spb * 1.4);
        if (inBar === 0 || inBar === 7 || inBar === 10) this.kick(t);
        if (inBar === 4 || inBar === 12) this.hit(t, "bandpass", 1800, 0.18, 0.18);
        if (inBar % 2 === 0) this.hit(t + swing, "highpass", 8000, inBar % 4 ? 0.03 : 0.06, 0.05);
        if ([3, 6, 11, 14].includes(inBar) && Math.random() < 0.55) this.lead(ch[Math.floor(Math.random() * ch.length)], t + swing);
        this.nextTime += s16; this.step++;
      }
    },
    play() {
      if (!this.init()) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.playing = true; this.nextTime = this.ctx.currentTime + 0.05;
      clearInterval(this.timer); this.timer = setInterval(() => this.schedule(), 25);
      this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.1);
      Ach.unlock("dj");
    },
    pause() { this.playing = false; clearInterval(this.timer); if (this.master) this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08); },
    setTrack(i) { this.track = (i + TRACKS.length) % TRACKS.length; this.step = 0; if (this.playing) { this.pause(); setTimeout(() => this.play(), 150); } }
  };
  OS.Player = Player;

  registerApp("music", {
    title: "Music", icon: "music", color: "#d946ef", w: 420, h: 560,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      body.innerHTML = `
        <div class="music">
          <div class="music-top"><div class="album"><i class="ti"></i></div><div><div class="tiny">Now playing</div><h3 class="tn"></h3><p class="muted ta"></p><p class="tiny tb"></p></div></div>
          <canvas></canvas>
          <div class="music-ctrl">
            <button class="prev" aria-label="Previous"><i class="ti ti-player-skip-back"></i></button>
            <button class="play" aria-label="Play"><i class="ti ti-player-play"></i></button>
            <button class="next" aria-label="Next"><i class="ti ti-player-skip-forward"></i></button>
          </div>
          <div class="tracks">${TRACKS.map((t, i) => `<button class="track" data-i="${i}"><span class="n">${i + 1}</span><span style="flex:1">${esc(t.name)}</span><span class="tiny">${t.bpm} bpm</span></button>`).join("")}</div>
        </div>`;
      const m = $(".music", body), playBtn = $(".play", body);
      const ui = () => {
        const t = TRACKS[Player.track];
        m.style.setProperty("--mc", t.color);
        $(".album i", body).className = "ti ti-" + t.icon;
        $(".album", body).classList.toggle("spin", Player.playing);
        $(".tn", body).textContent = t.name; $(".ta", body).textContent = t.artist;
        $(".tb", body).textContent = "Generated live in your browser · " + t.bpm + " bpm";
        $("i", playBtn).className = "ti ti-player-" + (Player.playing ? "pause" : "play");
        $$(".track", body).forEach((b) => b.classList.toggle("on", +b.dataset.i === Player.track));
      };
      playBtn.addEventListener("click", () => { Player.playing ? Player.pause() : Player.play(); ui(); });
      $(".prev", body).addEventListener("click", () => { Player.setTrack(Player.track - 1); ui(); });
      $(".next", body).addEventListener("click", () => { Player.setTrack(Player.track + 1); ui(); });
      $$(".track", body).forEach((b) => b.addEventListener("click", () => { Player.setTrack(+b.dataset.i); if (!Player.playing) Player.play(); ui(); }));
      ui();

      const cv = $("canvas", body), g = cv.getContext("2d");
      let raf, phase = 0;
      const data = new Uint8Array(64);
      const draw = () => {
        raf = requestAnimationFrame(draw);
        const dpr = devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight;
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = w * dpr; cv.height = hh * dpr; }
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
        if (Player.analyser && Player.playing) Player.analyser.getByteFrequencyData(data); else { phase += 0.03; data.forEach((_, i) => (data[i] = 18 + Math.sin(phase + i * 0.3) * 10)); }
        const n = 40, bw = w / n, col = TRACKS[Player.track].color;
        for (let i = 0; i < n; i++) {
          const v = data[Math.floor(i * 1.2)] / 255, bh = Math.max(3, v * hh * 0.9);
          g.fillStyle = col; g.globalAlpha = 0.35 + v * 0.65;
          g.beginPath(); g.roundRect ? g.roundRect(i * bw + 2, (hh - bh) / 2, bw - 4, bh, 3) : g.rect(i * bw + 2, (hh - bh) / 2, bw - 4, bh); g.fill();
        }
        g.globalAlpha = 1;
      };
      draw();
      ctx.onClose(() => { cancelAnimationFrame(raf); Player.pause(); });
    }
  });

  /* ================= Paint ================= */
  registerApp("paint", {
    title: "Paint", icon: "brush", color: "#f97316", w: 720, h: 520,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      const COLORS = ["#16142b", "#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"];
      body.innerHTML = `
        <div class="paint">
          <div class="paint-tools">
            <button class="tool-btn on" data-tool="brush" title="Brush"><i class="ti ti-brush"></i></button>
            <button class="tool-btn" data-tool="rainbow" title="Rainbow brush"><i class="ti ti-rainbow"></i></button>
            <button class="tool-btn" data-tool="spray" title="Spray"><i class="ti ti-spray"></i></button>
            <button class="tool-btn" data-tool="eraser" title="Eraser"><i class="ti ti-eraser"></i></button>
            <span class="sep"></span>
            ${COLORS.map((c, i) => `<button class="swatch ${i === 7 ? "on" : ""}" data-c="${c}" style="background:${c};${c === "#ffffff" ? "box-shadow:inset 0 0 0 1px #ccc" : ""}" aria-label="Colour ${c}"></button>`).join("")}
            <span class="sep"></span>
            <input type="range" min="2" max="40" value="8" aria-label="Brush size" />
            <span style="flex:1"></span>
            <button class="tool-btn" data-act="clear" title="Clear"><i class="ti ti-trash"></i></button>
            <button class="tool-btn" data-act="save" title="Save as PNG"><i class="ti ti-download"></i></button>
          </div>
          <div class="paint-canvas-wrap"><canvas></canvas></div>
        </div>`;
      const wrap = $(".paint-canvas-wrap", body), cv = $("canvas", body), g = cv.getContext("2d");
      let tool = "brush", color = "#8b5cf6", size = 8, hue = 0, drawing = false, last = null, strokes = 0;
      const fit = () => {
        const dpr = devicePixelRatio || 1, w = wrap.clientWidth, hh = wrap.clientHeight;
        if (!w || !hh) return;
        const copy = document.createElement("canvas"); copy.width = cv.width; copy.height = cv.height; copy.getContext("2d").drawImage(cv, 0, 0);
        cv.width = w * dpr; cv.height = hh * dpr; cv.style.width = w + "px"; cv.style.height = hh + "px";
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(copy, 0, 0);
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineCap = "round"; g.lineJoin = "round";
      };
      const ro = new ResizeObserver(fit); ro.observe(wrap);
      ctx.onClose(() => ro.disconnect());

      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      const stroke = (p) => {
        if (tool === "spray") {
          g.fillStyle = color;
          for (let i = 0; i < size * 2; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * size * 1.5; g.fillRect(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 1.5, 1.5); }
          return;
        }
        g.strokeStyle = tool === "eraser" ? "#fff" : tool === "rainbow" ? `hsl(${(hue = (hue + 4) % 360)},90%,60%)` : color;
        g.lineWidth = tool === "eraser" ? size * 2.5 : size;
        g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke();
      };
      cv.addEventListener("pointerdown", (e) => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); stroke(last); });
      cv.addEventListener("pointermove", (e) => { if (!drawing) return; const p = pos(e); stroke(p); last = p; });
      const end = () => { if (drawing && ++strokes >= 3) Ach.unlock("artist"); drawing = false; };
      cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);

      $$("[data-tool]", body).forEach((b) => b.addEventListener("click", () => { tool = b.dataset.tool; $$("[data-tool]", body).forEach((x) => x.classList.toggle("on", x === b)); Sound.click(); }));
      $$("[data-c]", body).forEach((b) => b.addEventListener("click", () => { color = b.dataset.c; if (tool === "eraser" || tool === "rainbow") $("[data-tool=brush]", body).click(); $$("[data-c]", body).forEach((x) => x.classList.toggle("on", x === b)); }));
      $("input[type=range]", body).addEventListener("input", (e) => (size = +e.target.value));
      $("[data-act=clear]", body).addEventListener("click", () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.restore(); Sound.close(); });
      $("[data-act=save]", body).addEventListener("click", () => { const a = document.createElement("a"); a.download = "masterpiece.png"; a.href = cv.toDataURL("image/png"); a.click(); toast("Saved masterpiece.png", "Frame it. Seriously.", { icon: "photo", color: "#f97316" }); });
    }
  });

  /* ================= Fun stuff folder ================= */
  registerApp("fun", {
    title: "Fun stuff", icon: "confetti", color: "#ec4899", w: 480, h: 320,
    render({ body }) {
      const items = [["music", "Music"], ["paint", "Paint"], ["snake", "Snake"], ["achievements", "Achievements"], ["settings", "Settings"]];
      body.innerHTML = `<div class="folder-grid">${items.map(([id, label], i) => {
        const a = OS.WM.apps[id];
        return `<button class="folder-item" data-app="${id}" style="animation-delay:${i * 50}ms"><span class="app-ico" style="--ico:${a.color}"><i class="ti ti-${a.icon}"></i></span><span>${esc(label)}</span></button>`;
      }).join("")}</div><p class="tiny" style="text-align:center;margin:0 0 14px">Breaks from looking at serious projects</p>`;
      $$(".folder-item", body).forEach((b) => b.addEventListener("click", () => OS.WM.open(b.dataset.app)));
    }
  });

  /* ================= Snake ================= */
  registerApp("snake", {
    title: "Snake", icon: "device-gamepad-2", color: "#84cc16", w: 460, h: 540,
    render(ctx) {
      const { body } = ctx;
      body.classList.add("no-scroll");
      body.innerHTML = `
        <div class="snake">
          <div class="snake-hud"><span>Score <b class="sc">0</b></span><span>Best <b class="best">${store.get("snakeBest", 0)}</b></span></div>
          <canvas width="400" height="400"></canvas>
          <div class="snake-overlay"><h2>Snake</h2><p class="muted" style="margin:0">Arrow keys or WASD · swipe on mobile</p><button class="btn accent go"><i class="ti ti-player-play"></i> Play</button></div>
        </div>`;
      const cv = $("canvas", body), g = cv.getContext("2d"), N = 20, S = 400 / N, ov = $(".snake-overlay", body);
      let snake, dir, nextDir, food, score, timer, speed, alive = false;
      const place = () => { do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; } while (snake.some((p) => p.x === food.x && p.y === food.y)); };
      const reset = () => { snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]; dir = nextDir = { x: 1, y: 0 }; score = 0; speed = 130; place(); $(".sc", body).textContent = 0; };
      const draw = () => {
        g.fillStyle = "#13112a"; g.fillRect(0, 0, 400, 400);
        g.fillStyle = "rgba(255,255,255,.03)";
        for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if ((x + y) % 2) g.fillRect(x * S, y * S, S, S);
        const t = Date.now() / 200;
        g.fillStyle = "#ffc46b"; g.shadowColor = "#ffc46b"; g.shadowBlur = 12 + Math.sin(t) * 6;
        g.beginPath(); g.arc(food.x * S + S / 2, food.y * S + S / 2, S / 2.6, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
        snake.forEach((p, i) => {
          g.fillStyle = `hsl(${140 - i * 3},75%,${60 - Math.min(i, 20)}%)`;
          const pad = i === 0 ? 1 : 2;
          g.beginPath(); g.roundRect ? g.roundRect(p.x * S + pad, p.y * S + pad, S - pad * 2, S - pad * 2, 5) : g.rect(p.x * S + pad, p.y * S + pad, S - pad * 2, S - pad * 2); g.fill();
        });
        const hd = snake[0]; g.fillStyle = "#0b0a16";
        g.fillRect(hd.x * S + S / 2 + dir.y * 4 - 2 + dir.x * 3, hd.y * S + S / 2 + dir.x * 4 - 2 + dir.y * 3, 3, 3);
        g.fillRect(hd.x * S + S / 2 - dir.y * 4 - 2 + dir.x * 3, hd.y * S + S / 2 - dir.x * 4 - 2 + dir.y * 3, 3, 3);
      };
      const step = () => {
        dir = nextDir;
        const hd = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (hd.x < 0 || hd.y < 0 || hd.x >= N || hd.y >= N || snake.some((p) => p.x === hd.x && p.y === hd.y)) return over();
        snake.unshift(hd);
        if (hd.x === food.x && hd.y === food.y) {
          score++; $(".sc", body).textContent = score; place();
          if (score >= 10) Ach.unlock("gamer");
          if (speed > 60) { speed -= 4; clearInterval(timer); timer = setInterval(step, speed); }
        } else snake.pop();
        draw();
      };
      const over = () => {
        alive = false; clearInterval(timer); Sound.error();
        const best = Math.max(score, store.get("snakeBest", 0)); store.set("snakeBest", best); $(".best", body).textContent = best;
        ov.innerHTML = `<h2>Game over</h2><p class="muted" style="margin:0">Score ${score} · Best ${best}</p><button class="btn accent go"><i class="ti ti-refresh"></i> Play again</button>`;
        ov.classList.remove("hidden"); $(".go", ov).addEventListener("click", start);
      };
      const start = () => { reset(); alive = true; ov.classList.add("hidden"); clearInterval(timer); timer = setInterval(step, speed); draw(); };
      $(".go", ov).addEventListener("click", start);
      const turn = (x, y) => { if (alive && (x !== -dir.x || y !== -dir.y)) nextDir = { x, y }; };
      const key = (e) => {
        if (!ctx.isFocused() || e.target.matches("input, textarea")) return;
        const k = e.key.toLowerCase();
        const map = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
        if (map[k]) { e.preventDefault(); turn(...map[k]); }
        else if ((k === " " || k === "enter") && !alive) { e.preventDefault(); start(); }
      };
      document.addEventListener("keydown", key);
      let touch = null;
      cv.addEventListener("pointerdown", (e) => (touch = { x: e.clientX, y: e.clientY }));
      cv.addEventListener("pointerup", (e) => {
        if (!touch) return; const dx = e.clientX - touch.x, dy = e.clientY - touch.y; touch = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
        Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy));
      });
      reset(); draw();
      const idle = setInterval(() => { if (!alive) draw(); }, 100);
      ctx.onClose(() => { clearInterval(timer); clearInterval(idle); document.removeEventListener("keydown", key); });
    }
  });
})();
