/**
 * MotoMatch — Scroll-driven mechanical teardown
 * ==============================================
 * A blueprint-style exploded view of the selected motorcycle.
 *
 * Design notes
 *  - Every visual state is a PURE FUNCTION of scroll progress p ∈ [0,1].
 *    Nothing accumulates, so scrolling up restores earlier states exactly and
 *    resizing simply recomputes the same frame.
 *  - The schematic is generated from a per-segment geometry table. It is a
 *    representative layout for the bike's class, not a measured drawing of the
 *    individual model — the UI says so. The real photograph of the chosen model
 *    stays on screen as a reference plate throughout.
 *  - Only transform / opacity / stroke-dashoffset change during scroll.
 */
"use strict";

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const ramp = (p, a, b) => clamp((p - a) / (b - a));

  // ── Timeline (fractions of the pinned scroll distance) ──
  const T = {
    plateStart: 0.05, plateEnd: 0.13,          // photo → reference plate, schematic draws in
    explodeStart: 0.13, explodeEnd: 0.24,       // parts separate (staggered)
    chaptersStart: 0.26, chaptersEnd: 0.84,     // component focus chapters
    reassembleStart: 0.85, reassembleEnd: 0.95, // parts return
    photoBack: 0.95                             // photo returns
  };

  // ── Geometry per segment (viewBox units; ground at y = 600) ──
  const GEO = {
    commuter: { Rf: 148, Rr: 148, ra: [352, 452], fa: [850, 452], head: [726, 226], piv: [522, 414], fork: "tele", shock: "twin", wheel: "cast", rearBrake: "drum", exhaust: "long", body: "commuter", cool: "air", light: "round", bar: "upright", cylH: 82 },
    naked:    { Rf: 145, Rr: 145, ra: [362, 455], fa: [840, 455], head: [712, 214], piv: [528, 402], fork: "usd", shock: "mono", wheel: "cast", rearBrake: "disc", exhaust: "under", body: "naked", cool: "liquid", light: "angular", bar: "flat", cylH: 96 },
    sports:   { Rf: 145, Rr: 145, ra: [362, 455], fa: [836, 455], head: [706, 228], piv: [528, 402], fork: "usd", shock: "mono", wheel: "cast", rearBrake: "disc", exhaust: "side", body: "sports", cool: "liquid", light: "fairing", bar: "clip", cylH: 92 },
    adventure:{ Rf: 166, Rr: 150, ra: [348, 450], fa: [874, 434], head: [738, 184], piv: [522, 394], fork: "usd", shock: "mono", wheel: "spoke", rearBrake: "disc", exhaust: "high", body: "adv", cool: "liquid", light: "beak", bar: "wide", cylH: 100 },
    cruiser:  { Rf: 156, Rr: 150, ra: [340, 450], fa: [868, 444], head: [720, 222], piv: [516, 410], fork: "tele", shock: "twin", wheel: "spoke", rearBrake: "disc", exhaust: "long", body: "classic", cool: "air", light: "round", bar: "upright", cylH: 100 }
  };

  // Explode vectors: [dx, dy, rotateDeg]. Order = stagger order.
  const EXPLODE = {
    cockpit: [250, -255, -4],
    fairing: [230, -150, 0],
    tank: [150, -225, -3],
    seat: [40, -205, 2],
    fork: [185, -40, 0],
    wheelF: [335, 10, 0],
    brakeF: [110, 265, 0],
    frame: [0, -40, 0],
    engine: [120, 195, 0],
    exhaust: [-30, 370, 0],
    drive: [-40, 210, 0],
    swingarm: [-150, 125, 0],
    wheelR: [-315, 10, 0],
    brakeR: [870, 330, 0]
  };
  // Camera: tight on the assembled machine, wide for the exploded layout.
  const VB_WIDE = [-175, -70, 1550, 1040];
  const ORDER = Object.keys(EXPLODE);

  const PART_LABEL = {
    cockpit: "Cockpit", fairing: "Fairing", tank: "Fuel tank", seat: "Seat & tail", fork: "Front suspension",
    wheelF: "Front wheel & tyre", brakeF: "Front brake", frame: "Frame", engine: "Engine",
    exhaust: "Exhaust", drive: "Final drive", swingarm: "Swingarm & rear shock",
    wheelR: "Rear wheel & tyre", brakeR: "Rear brake"
  };

  // ── Small vector helpers ──
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = a => Math.hypot(a[0], a[1]);
  const norm = a => mul(a, 1 / (len(a) || 1));
  const perp = a => [-a[1], a[0]];
  const P = pts => pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  function bar(a, b, w) {
    const n = mul(perp(norm(sub(b, a))), w / 2);
    return P([add(a, n), add(b, n), sub(b, n), sub(a, n)]);
  }
  const f = n => n.toFixed(1);

  // ── Build all part groups as SVG markup ──
  function buildParts(g, bike) {
    const [hx, hy] = g.head, [fx, fy] = g.fa, [rx, ry] = g.ra, [px, py] = g.piv;
    const forkDir = norm(sub(g.fa, g.head));
    const headBot = add(g.head, mul(forkDir, 72));
    const C = [px + 82, py + 30];                 // crank centre
    const railY = hy + 88;                        // seat rail height
    const twin = bike && bike.cc >= 600;
    const parts = {};
    const tw = 24;                                // tyre section

    // WHEELS
    function wheel(cx, cy, R, kind) {
      let s = `<circle cx="${cx}" cy="${cy}" r="${R}" class="s fill-d"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${R - 5}" class="s thin tread" pathLength="1"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${R - tw}" class="s"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${R - tw - 7}" class="s thin"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="16" class="s fill-m"/><circle cx="${cx}" cy="${cy}" r="5" class="s"/>`;
      const ri = R - tw - 7;
      if (kind === "spoke") {
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * Math.PI * 2, b = a + (i % 2 ? 0.5 : -0.5);
          s += `<line x1="${f(cx + Math.cos(b) * 14)}" y1="${f(cy + Math.sin(b) * 14)}" x2="${f(cx + Math.cos(a) * ri)}" y2="${f(cy + Math.sin(a) * ri)}" class="s hair"/>`;
        }
      } else {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const a1 = a - 0.09, a2 = a + 0.09, a3 = a + 0.2, a4 = a - 0.2;
          s += `<polygon points="${P([[cx + Math.cos(a1) * 17, cy + Math.sin(a1) * 17], [cx + Math.cos(a2) * 17, cy + Math.sin(a2) * 17], [cx + Math.cos(a3) * ri, cy + Math.sin(a3) * ri], [cx + Math.cos(a4) * ri, cy + Math.sin(a4) * ri]])}" class="s fill-m"/>`;
        }
      }
      return s;
    }
    parts.wheelF = wheel(fx, fy, g.Rf, g.wheel);
    parts.wheelR = wheel(rx, ry, g.Rr, g.wheel);

    // BRAKES
    function disc(cx, cy, r, caliperAngle) {
      let s = `<circle cx="${cx}" cy="${cy}" r="${r}" class="s fill-m"/><circle cx="${cx}" cy="${cy}" r="${r - 12}" class="s thin"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${r - 6}" class="s hair holes" pathLength="60"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.38}" class="s thin"/>`;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; s += `<line x1="${f(cx + Math.cos(a) * r * 0.38)}" y1="${f(cy + Math.sin(a) * r * 0.38)}" x2="${f(cx + Math.cos(a) * (r - 12))}" y2="${f(cy + Math.sin(a) * (r - 12))}" class="s hair"/>`; }
      const a = caliperAngle, c = [cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6)];
      const t = perp([Math.cos(a), Math.sin(a)]);
      s += `<polygon points="${bar(add(c, mul(t, -24)), add(c, mul(t, 24)), 26)}" class="s fill-a"/>`;
      return s;
    }
    parts.brakeF = disc(fx, fy, g.Rf * 0.5, -2.35);
    parts.brakeR = g.rearBrake === "drum"
      ? `<circle cx="${rx}" cy="${ry}" r="${g.Rr * 0.36}" class="s fill-m"/><circle cx="${rx}" cy="${ry}" r="${g.Rr * 0.36 - 9}" class="s thin"/><path d="M${f(rx - 20)},${f(ry - g.Rr * 0.36 + 6)} L${f(rx + 34)},${f(ry - 70)}" class="s thin"/>`
      : disc(rx, ry, g.Rr * 0.38, -0.6);

    // FORK (+ front fender)
    {
      let s = "";
      const top = add(g.head, mul(forkDir, -18));
      const ax = [fx, fy];
      const split = add(top, mul(sub(ax, top), 0.55));
      const back = [-9, -3];
      for (const off of [back, [0, 0]]) {
        const cls = off === back ? "s fill-d ghost" : "s fill-m";
        if (g.fork === "usd") {
          s += `<polygon points="${bar(add(top, off), add(split, off), 26)}" class="${cls}"/>`;
          s += `<polygon points="${bar(add(split, off), add(ax, off), 15)}" class="${cls}"/>`;
        } else {
          s += `<polygon points="${bar(add(top, off), add(split, off), 15)}" class="${cls}"/>`;
          s += `<polygon points="${bar(add(split, off), add(ax, off), 24)}" class="${cls}"/>`;
        }
      }
      const n = perp(forkDir);
      const clampTop = add(g.head, mul(forkDir, -6)), clampBot = add(g.head, mul(forkDir, 60));
      s += `<polygon points="${bar(add(clampTop, mul(n, 26)), add(clampTop, mul(n, -22)), 9)}" class="s fill-d"/>`;
      s += `<polygon points="${bar(add(clampBot, mul(n, 26)), add(clampBot, mul(n, -22)), 11)}" class="s fill-d"/>`;
      // fender
      const fr = g.Rf + 10;
      const a1 = -2.55, a2 = -0.85;
      s += `<path d="M${f(fx + Math.cos(a1) * fr)},${f(fy + Math.sin(a1) * fr)} A${fr},${fr} 0 0 1 ${f(fx + Math.cos(a2) * fr)},${f(fy + Math.sin(a2) * fr)}" class="s thick"/>`;
      // spring hint
      s += `<line x1="${f(top[0])}" y1="${f(top[1])}" x2="${f(split[0])}" y2="${f(split[1])}" class="s hair dashed"/>`;
      parts.fork = s;
    }

    // FRAME
    {
      let s = "";
      const H1 = add(g.head, mul(forkDir, -10)), H2 = headBot;
      s += `<polygon points="${bar(H1, H2, 22)}" class="s fill-d"/>`; // steering head
      const seatJ = [px + 20, railY + 6];
      const tailEnd = [rx + 26, railY - 6];
      if (g.body === "naked" || g.body === "sports" || g.body === "adv") {
        // trellis: upper and lower rails with triangulation
        const U = [H1, [hx - 70, hy + 46], [hx - 150, hy + 70], [px + 60, py - 105], [px + 18, py - 70]];
        const L = [H2, [hx - 40, hy + 120], [hx - 120, py - 40], [px + 50, py - 20], [px, py]];
        s += `<polyline points="${P(U)}" class="s thick"/><polyline points="${P(L)}" class="s thick"/>`;
        for (let i = 1; i < U.length - 1; i++) s += `<line x1="${f(U[i][0])}" y1="${f(U[i][1])}" x2="${f(L[i][0])}" y2="${f(L[i][1])}" class="s"/><line x1="${f(U[i][0])}" y1="${f(U[i][1])}" x2="${f(L[i + 1][0])}" y2="${f(L[i + 1][1])}" class="s thin"/>`;
        s += `<polyline points="${P([U[3], seatJ, tailEnd])}" class="s"/><line x1="${f(px + 4)}" y1="${f(py - 8)}" x2="${f(tailEnd[0] + 60)}" y2="${f(railY + 8)}" class="s thin"/>`;
      } else {
        // cradle: backbone + downtubes under the engine
        const back = [[H1[0] - 4, H1[1] + 6], [hx - 120, hy + 44], [px + 40, railY - 4], [px + 6, py - 20], [px, py]];
        const down = [H2, [C[0] + 115, C[1] - 10], [C[0] + 92, C[1] + 82], [C[0] - 70, C[1] + 86], [px, py]];
        s += `<polyline points="${P(back)}" class="s thick"/><polyline points="${P(down)}" class="s thick"/>`;
        s += `<polyline points="${P([[px + 40, railY - 4], seatJ, tailEnd])}" class="s"/><line x1="${f(px + 2)}" y1="${f(py - 12)}" x2="${f(tailEnd[0] + 70)}" y2="${f(railY + 4)}" class="s thin"/>`;
      }
      s += `<circle cx="${px}" cy="${py}" r="9" class="s fill-a"/>`;
      parts.frame = s;
    }

    // ENGINE
    {
      let s = "";
      const h = g.cylH;
      const u = [Math.sin(0.36), -Math.cos(0.36)];
      const b1 = [C[0] - 18, C[1] - 30], b2 = [C[0] + 62, C[1] - 30];
      const t1 = add(b1, mul(u, h)), t2 = add(b2, mul(u, h));
      // crankcase + gearbox
      s += `<path d="M${C[0] - 92},${C[1] - 18} Q${C[0] - 96},${C[1] + 70} ${C[0] - 40},${C[1] + 74} L${C[0] + 56},${C[1] + 74} Q${C[0] + 88},${C[1] + 70} ${C[0] + 82},${C[1] + 10} L${C[0] + 62},${C[1] - 30} L${C[0] - 60},${C[1] - 34} Z" class="s fill-m"/>`;
      s += `<circle cx="${C[0] + 10}" cy="${C[1] + 26}" r="34" class="s thin"/><circle cx="${C[0] + 10}" cy="${C[1] + 26}" r="22" class="s hair"/>`;
      s += `<circle cx="${C[0] - 52}" cy="${C[1] + 20}" r="20" class="s hair"/>`;
      // cylinder + head
      s += `<polygon points="${P([b1, b2, t2, t1])}" class="s fill-d"/>`;
      const c1 = add(t1, mul(u, 30)), c2 = add(t2, mul(u, 30));
      s += `<polygon points="${P([add(t1, [-6, 0]), add(t2, [6, 0]), add(c2, [4, 0]), add(c1, [-4, 0])])}" class="s fill-m"/>`;
      if (g.cool === "air") {
        for (let i = 1; i < 9; i++) {
          const k = i / 9, a = add(add(b1, mul(sub(t1, b1), k)), [-12, 0]), b = add(add(b2, mul(sub(t2, b2), k)), [12, 0]);
          s += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" class="s hair"/>`;
        }
      } else {
        // radiator ahead of the cylinder
        const r0 = [C[0] + 90, C[1] - 150], r1 = [C[0] + 104, C[1] - 40];
        s += `<polygon points="${bar(r0, r1, 22)}" class="s fill-d"/>`;
        for (let i = 1; i < 10; i++) { const a = add(r0, mul(sub(r1, r0), i / 10)); s += `<line x1="${f(a[0] - 10)}" y1="${f(a[1])}" x2="${f(a[0] + 10)}" y2="${f(a[1])}" class="s hair"/>`; }
      }
      if (twin) s += `<text x="${C[0] - 70}" y="${C[1] + 62}" class="etch">2-CYL</text>`;
      parts.engine = s;
      parts._port = add(c2, mul(sub(b2, t2), 0.15));
    }

    // EXHAUST
    {
      let s = "";
      const port = parts._port;
      const lowF = [C[0] + 98, C[1] + 70], lowB = [C[0] - 40, C[1] + 92];
      const header = `M${f(port[0])},${f(port[1])} C${f(port[0] + 40)},${f(port[1] + 40)} ${f(lowF[0] + 10)},${f(lowF[1] - 30)} ${f(lowF[0])},${f(lowF[1])} S${f(lowB[0] + 60)},${f(lowB[1])} ${f(lowB[0])},${f(lowB[1])}`;
      const draw = (dy) => {
        let t = `<path d="${header}" transform="translate(0 ${dy})" class="s pipe"/>`;
        if (g.exhaust === "long") t += `<polygon transform="translate(0 ${dy})" points="${bar([lowB[0], lowB[1]], [rx - 30, ry + 10], 30)}" class="s fill-m"/>`;
        else if (g.exhaust === "under") t += `<rect transform="translate(0 ${dy})" x="${lowB[0] - 60}" y="${lowB[1] - 16}" width="110" height="38" rx="8" class="s fill-m"/>`;
        else if (g.exhaust === "side") t += `<polygon transform="translate(0 ${dy})" points="${bar([px - 10, py + 52], [rx + 70, ry - 46], 34)}" class="s fill-m"/>`;
        else t += `<path transform="translate(0 ${dy})" d="M${f(lowB[0])},${f(lowB[1])} C${f(px - 40)},${f(py + 60)} ${f(px - 60)},${f(railY + 70)} ${f(px - 90)},${f(railY + 50)}" class="s pipe"/><polygon transform="translate(0 ${dy})" points="${bar([px - 80, railY + 52], [rx + 40, railY + 20], 34)}" class="s fill-m"/>`;
        return t;
      };
      if (twin) s += `<g class="ghost">${draw(-10)}</g>`;
      s += draw(0);
      parts.exhaust = s;
    }

    // SWINGARM + SHOCK(S)
    {
      let s = `<polygon points="${bar([px, py], [rx, ry], 22)}" class="s fill-m"/><circle cx="${rx}" cy="${ry}" r="7" class="s"/>`;
      if (g.shock === "twin") {
        const a = [rx + 22, ry - 22], b = [rx + 52, railY + 10];
        s += `<polygon points="${bar(a, b, 12)}" class="s fill-d"/>`;
        const d = sub(b, a), n = perp(norm(d));
        let zz = "";
        for (let i = 0; i <= 12; i++) { const q = add(add(a, mul(d, 0.2 + 0.6 * i / 12)), mul(n, i % 2 ? 9 : -9)); zz += (i ? "L" : "M") + f(q[0]) + "," + f(q[1]); }
        s += `<path d="${zz}" class="s fill-none spring"/>`;
      } else {
        const a = [px - 58, py - 6], b = [px + 6, railY + 22];
        s += `<polygon points="${bar(a, b, 14)}" class="s fill-d"/>`;
        const d = sub(b, a), n = perp(norm(d));
        let zz = "";
        for (let i = 0; i <= 10; i++) { const q = add(add(a, mul(d, 0.15 + 0.6 * i / 10)), mul(n, i % 2 ? 10 : -10)); zz += (i ? "L" : "M") + f(q[0]) + "," + f(q[1]); }
        s += `<path d="${zz}" class="s fill-none spring"/>`;
      }
      parts.swingarm = s;
    }

    // FINAL DRIVE
    {
      const s1 = [px + 34, py + 8], r1 = 15, r2 = g.Rr * 0.3;
      parts.drive = `<circle cx="${s1[0]}" cy="${s1[1]}" r="${r1}" class="s fill-m"/><circle cx="${rx}" cy="${ry}" r="${r2}" class="s fill-none teeth" pathLength="44"/><circle cx="${rx}" cy="${ry}" r="${r2 - 6}" class="s thin"/>` +
        `<line x1="${s1[0]}" y1="${s1[1] - r1}" x2="${rx}" y2="${f(ry - r2)}" class="s chain"/><line x1="${s1[0]}" y1="${s1[1] + r1}" x2="${rx}" y2="${f(ry + r2)}" class="s chain"/>`;
    }

    // FUEL TANK (+ side panel)
    {
      const F = [hx - 22, hy + 26], R = [px + 46, railY - 6];
      let d;
      if (g.body === "classic") d = `M${F[0]},${F[1]} C${F[0] - 20},${F[1] - 42} ${R[0] + 80},${R[1] - 82} ${R[0]},${R[1] - 20} L${R[0] + 4},${R[1] + 4} C${R[0] + 60},${R[1] + 20} ${F[0] - 30},${F[1] + 60} ${F[0]},${F[1]} Z`;
      else if (g.body === "commuter") d = `M${F[0]},${F[1] + 4} C${F[0] - 30},${F[1] - 30} ${R[0] + 70},${R[1] - 60} ${R[0]},${R[1] - 10} L${R[0] + 6},${R[1] + 12} L${F[0] - 20},${F[1] + 62} Z`;
      else if (g.body === "adv") d = `M${F[0] + 6},${F[1] - 4} L${F[0] - 50},${F[1] - 34} C${F[0] - 110},${F[1] - 40} ${R[0] + 60},${R[1] - 70} ${R[0]},${R[1] - 16} L${R[0] + 10},${R[1] + 22} L${F[0] - 6},${F[1] + 92} Z`;
      else d = `M${F[0] + 6},${F[1] - 2} L${F[0] - 40},${F[1] - 36} C${F[0] - 90},${F[1] - 44} ${R[0] + 60},${R[1] - 70} ${R[0]},${R[1] - 18} L${R[0] + 14},${R[1] + 18} L${F[0] - 12},${F[1] + 86} Z`;
      let s = `<path d="${d}" class="s fill-b"/>`;
      s += `<path d="M${F[0] - 40},${F[1] + 10} C${F[0] - 80},${F[1] + 4} ${R[0] + 60},${R[1] - 30} ${R[0] + 20},${R[1] - 4}" class="s hair"/>`;
      s += `<circle cx="${(F[0] + R[0]) / 2 + 20}" cy="${F[1] - 14}" r="7" class="s thin"/>`;
      parts.tank = s;
    }

    // SEAT + TAIL + REAR FENDER
    {
      const S0 = [px + 50, railY - 10];
      let s = "";
      if (g.body === "sports") {
        s += `<path d="M${S0[0]},${S0[1]} L${px - 40},${railY - 4} L${px - 80},${railY - 24} L${rx + 10},${railY - 44} L${rx - 20},${railY - 30} L${rx + 30},${railY + 10} L${px + 40},${railY + 16} Z" class="s fill-b"/>`;
        s += `<path d="M${S0[0]},${S0[1]} L${px - 40},${railY - 4}" class="s thick"/>`;
      } else if (g.body === "classic") {
        s += `<path d="M${S0[0]},${S0[1] + 2} C${S0[0] - 30},${S0[1] - 26} ${px - 50},${railY - 30} ${px - 70},${railY - 4} L${px - 70},${railY + 8} L${S0[0] + 4},${railY + 10} Z" class="s fill-b"/>`;
        s += `<path d="M${px - 82},${railY - 2} L${rx + 30},${railY - 6} L${rx + 26},${railY + 8} L${px - 82},${railY + 10} Z" class="s fill-b"/>`;
        s += `<path d="M${rx + 70},${railY + 4} A${g.Rr + 12},${g.Rr + 12} 0 0 0 ${f(rx - g.Rr * 0.7)},${f(ry - g.Rr * 0.85)}" class="s thick"/>`;
      } else {
        const tail = g.body === "commuter" ? [rx - 10, railY - 16] : [rx - 4, railY - 34];
        s += `<path d="M${S0[0]},${S0[1]} C${S0[0] - 40},${S0[1] - 22} ${tail[0] + 60},${tail[1] - 8} ${tail[0]},${tail[1]} L${tail[0] - 8},${tail[1] + 22} L${px + 40},${railY + 14} Z" class="s fill-b"/>`;
        s += `<path d="M${S0[0] - 4},${S0[1] - 2} C${S0[0] - 40},${S0[1] - 24} ${tail[0] + 60},${tail[1] - 10} ${tail[0] + 4},${tail[1] - 2}" class="s thick"/>`;
        s += `<path d="M${tail[0] - 8},${tail[1] + 22} L${rx - 30},${ry - g.Rr + 40}" class="s thin"/>`;
      }
      s += `<rect x="${rx - 44}" y="${railY - (g.body === "classic" ? 4 : 30)}" width="18" height="10" rx="2" class="s fill-a"/>`;
      parts.seat = s;
    }

    // COCKPIT: bars, headlight, instruments, mirror
    {
      const n = perp(forkDir);
      const clamp0 = add(g.head, mul(forkDir, -14));
      let s = "";
      const barTop = g.bar === "clip" ? add(clamp0, [-30, 26]) : g.bar === "flat" ? add(clamp0, [-60, -34]) : g.bar === "wide" ? add(clamp0, [-70, -50]) : add(clamp0, [-80, -60]);
      s += `<path d="M${f(clamp0[0])},${f(clamp0[1])} Q${f(clamp0[0] - 10)},${f(barTop[1])} ${f(barTop[0])},${f(barTop[1])}" class="s thick"/>`;
      s += `<polygon points="${bar(barTop, add(barTop, [-34, 6]), 12)}" class="s fill-d"/>`;
      const L = add(add(g.head, mul(forkDir, 46)), mul(n, -48));
      if (g.light === "round") s += `<circle cx="${f(L[0] + 10)}" cy="${f(L[1])}" r="30" class="s fill-m"/><circle cx="${f(L[0] + 12)}" cy="${f(L[1])}" r="20" class="s fill-a"/>`;
      else if (g.light === "beak") s += `<polygon points="${P([[L[0] - 20, L[1] - 70], [L[0] + 36, L[1] - 26], [L[0] + 30, L[1] + 18], [L[0] - 10, L[1] + 26]])}" class="s fill-b"/><circle cx="${f(L[0] + 14)}" cy="${f(L[1] - 4)}" r="15" class="s fill-a"/><path d="M${f(L[0] + 34)},${f(L[1] + 28)} L${f(L[0] + 92)},${f(L[1] + 80)} L${f(L[0] + 40)},${f(L[1] + 56)} Z" class="s fill-b"/>`;
      else if (g.light === "fairing") s += `<polygon points="${P([[L[0] + 2, L[1] - 6], [L[0] + 40, L[1] + 10], [L[0] + 24, L[1] + 22]])}" class="s fill-a"/>`;
      else s += `<polygon points="${P([[L[0] - 8, L[1] - 30], [L[0] + 30, L[1] - 12], [L[0] + 34, L[1] + 14], [L[0] - 4, L[1] + 30]])}" class="s fill-m"/><line x1="${f(L[0] + 4)}" y1="${f(L[1] - 10)}" x2="${f(L[0] + 26)}" y2="${f(L[1])}" class="s accent"/>`;
      const I = add(clamp0, [-6, -26]);
      s += `<rect x="${f(I[0] - 20)}" y="${f(I[1] - 16)}" width="40" height="26" rx="5" class="s fill-d"/><rect x="${f(I[0] - 14)}" y="${f(I[1] - 10)}" width="28" height="14" rx="2" class="s fill-a"/>`;
      parts.cockpit = s;
    }

    // FAIRING (sports only)
    if (g.body === "sports") {
      const [x, y] = g.head;
      parts.fairing = `<path d="M${x - 8},${y - 28} L${x + 64},${y + 40} L${x + 76},${y + 96} L${x + 20},${y + 160} L${C[0] + 40},${C[1] + 70} L${C[0] - 40},${C[1] + 74} L${C[0] - 20},${C[1] + 20} L${x - 70},${y + 70} Z" class="s fill-b"/><path d="M${x - 10},${y - 30} L${x + 30},${y - 50}" class="s thick"/><path d="M${x + 20},${y + 50} L${C[0] + 30},${C[1] + 10}" class="s hair"/>`;
    }
    delete parts._port;
    return parts;
  }

  // ── Ground, grid, dimensioning (static decoration) ──
  function buildDecor(g, bike) {
    const ground = 600;
    const wb = Math.round(g.fa[0] - g.ra[0]);
    let s = `<line x1="-120" y1="${ground}" x2="1320" y2="${ground}" class="ground"/>`;
    for (let x = -100; x <= 1300; x += 40) s += `<line x1="${x}" y1="${ground}" x2="${x}" y2="${ground + (x % 200 === 0 ? 10 : 5)}" class="tick"/>`;
    const y = ground + 46;
    s += `<g class="dim"><line x1="${g.ra[0]}" y1="${y}" x2="${g.fa[0]}" y2="${y}"/><line x1="${g.ra[0]}" y1="${y - 8}" x2="${g.ra[0]}" y2="${y + 8}"/><line x1="${g.fa[0]}" y1="${y - 8}" x2="${g.fa[0]}" y2="${y + 8}"/><text x="${(g.ra[0] + g.fa[0]) / 2}" y="${y - 8}" text-anchor="middle">WHEELBASE · SCHEMATIC</text></g>`;
    if (bike) {
      const gx = g.piv[0] + 130;
      s += `<g class="dim"><line x1="${gx}" y1="${ground}" x2="${gx}" y2="${ground - 78}"/><line x1="${gx - 6}" y1="${ground - 78}" x2="${gx + 6}" y2="${ground - 78}"/><text x="${gx + 10}" y="${ground - 30}">GC ${bike.groundClearance} MM</text></g>`;
    }
    return s;
  }

  // ── Teardown controller ──
  const TD = {
    init(opts) {
      this.root = document.getElementById("teardown");
      if (!this.root) return;
      this.opts = opts;
      this.stage = this.root.querySelector(".td-stage");
      this.svg = this.root.querySelector("#tdSvg");
      this.partsLayer = this.svg.querySelector("#tdParts");
      this.decorLayer = this.svg.querySelector("#tdDecor");
      this.leader = this.svg.querySelector("#tdLeader");
      this.leaderDot = this.svg.querySelector("#tdLeaderDot");
      this.plate = this.root.querySelector(".td-plate");
      this.panel = this.root.querySelector(".td-panel");
      this.hud = this.root.querySelector(".td-hud");
      this.chipsEl = this.root.querySelector(".td-chips");
      this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.chapters = window.TEARDOWN_CHAPTERS;
      this.chapter = -2;
      this.virtualP = null;

      this.buildChips();
      this.setBike(opts.initialBikeId, true);

      if (this.reduced) {
        this.root.classList.add("is-static");
        this.virtualP = this.chapterP(0);
      }
      const onScroll = () => { if (!this.ticking) { this.ticking = true; requestAnimationFrame(() => { this.ticking = false; this.update(); }); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", () => { this.measure(); this.update(true); });
      this.measure();
      this.update(true);
    },

    buildChips() {
      const items = [{ key: "overview", code: "00", title: "Overview" }].concat(this.chapters);
      this.chipsEl.innerHTML = items.map((c, i) => `<button class="td-chip" data-i="${i - 1}" type="button"><span>${c.code}</span>${c.title}</button>`).join("") +
        `<button class="td-chip td-chip--re" data-i="re" type="button">Reassemble</button>`;
      this.chipsEl.addEventListener("click", e => {
        const b = e.target.closest(".td-chip"); if (!b) return;
        const i = b.dataset.i;
        if (i === "re") this.goTo(this.reduced ? 0.97 : 0.975);
        else if (+i < 0) this.goTo((T.explodeEnd + T.chaptersStart) / 2);
        else this.goTo(this.chapterP(+i));
      });
    },

    chapterP(i) {
      const span = (T.chaptersEnd - T.chaptersStart) / this.chapters.length;
      return T.chaptersStart + span * (i + 0.5);
    },

    goTo(p) {
      if (this.reduced) { this.virtualP = p; this.update(true); return; }
      const r = this.root.getBoundingClientRect();
      const top = window.scrollY + r.top;
      const dist = this.root.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + dist * p, behavior: "smooth" });
    },

    setBike(id, silent) {
      const bike = BikeEngine.BIKES.find(b => b.id === +id) || BikeEngine.BIKES[0];
      this.bike = bike;
      const g = GEO[bike.segment] || GEO.naked;
      this.geo = g;
      const x0 = g.ra[0] - g.Rr - 60, x1 = g.fa[0] + g.Rf + 70, y0 = g.head[1] - 120, y1 = 690;
      this.vbTight = [x0, y0, x1 - x0, y1 - y0];
      const parts = buildParts(g, bike);
      this.decorLayer.innerHTML = buildDecor(g, bike);
      this.partsLayer.innerHTML = ORDER.filter(k => parts[k]).map(k =>
        `<g class="part" data-part="${k}" tabindex="0" role="button" aria-label="${PART_LABEL[k]} — inspect">${parts[k]}</g>`).join("");
      this.partsLayer.querySelectorAll(".s:not([pathLength]):not(.chain):not(.dashed)").forEach(el => el.setAttribute("pathLength", "1"));
      this.partEls = {};
      this.partsLayer.querySelectorAll(".part").forEach(el => {
        const k = el.dataset.part;
        const bb = el.getBBox();
        this.partEls[k] = { el, cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2, bb };
        const inspect = () => {
          const idx = this.chapters.findIndex(c => c.parts.includes(k));
          if (idx >= 0) this.goTo(this.chapterP(idx));
        };
        el.addEventListener("click", inspect);
        el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inspect(); } });
      });
      this.opts.onBikeChange && this.opts.onBikeChange(bike);
      this.chapter = -2; // force panel refresh
      if (!silent) this.update(true);
    },

    measure() {
      // Reference-plate geometry: large & centred (k=0) → small top-left plate (k=1)
      // offset* values ignore CSS transforms, so this is stable mid-animation.
      const sw = this.stage.clientWidth, sh = this.stage.clientHeight;
      const x = this.plate.offsetLeft, y = this.plate.offsetTop, w = this.plate.offsetWidth, h = this.plate.offsetHeight;
      const mob = this.mobile();
      const targetW = Math.min(sw * (mob ? 0.92 : 0.62), sh * (mob ? 0.36 : 0.6) * (w / h));
      this.plateBig = { s: targetW / w, tx: sw / 2 - (x + w / 2), ty: sh * (mob ? 0.4 : 0.5) - (y + h / 2) };
    },

    progress() {
      if (this.virtualP != null) return this.virtualP;
      const r = this.root.getBoundingClientRect();
      const dist = this.root.offsetHeight - window.innerHeight;
      return clamp(-r.top / (dist || 1));
    },

    update(force) {
      if (!this.root) return;
      const r = this.root.getBoundingClientRect();
      if (!force && (r.bottom < -50 || r.top > window.innerHeight + 50)) return;
      const p = this.progress();
      if (!force && this.lastP != null && Math.abs(p - this.lastP) < 0.0004) return;
      this.lastP = p;
      this.render(p);
    },

    render(p) {
      const n = this.chapters.length;
      // 1 · reference plate
      const kIn = ease(ramp(p, T.plateStart, T.plateEnd));
      const kOut = ease(ramp(p, T.photoBack, 1));
      const k = kIn * (1 - kOut);
      const B = this.plateBig;
      const s = lerp(B.s, 1, k), tx = lerp(B.tx, 0, k), ty = lerp(B.ty, 0, k);
      this._ps = s; this._ptx = tx; this._pty = ty;
      this.plate.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      this.plate.classList.toggle("is-plate", k > 0.6);
      this.root.style.setProperty("--intro", (1 - k).toFixed(3));

      // 2 · schematic draw-in / draw-out
      const draw = ease(ramp(p, T.plateStart + 0.02, T.plateEnd + 0.01)) * (1 - ease(ramp(p, T.photoBack - 0.01, 0.995)));
      this.svg.style.setProperty("--draw", (1 - draw).toFixed(4));
      this.svg.style.opacity = Math.min(1, draw * 1.6).toFixed(3);

      // 3 · explode / reassemble per part (staggered)
      const count = ORDER.length;
      const span = T.explodeEnd - T.explodeStart, rspan = T.reassembleEnd - T.reassembleStart;
      const chapIdx = p >= T.chaptersStart && p < T.chaptersEnd ? Math.min(n - 1, Math.floor((p - T.chaptersStart) / ((T.chaptersEnd - T.chaptersStart) / n))) : -1;
      const focusParts = chapIdx >= 0 ? this.chapters[chapIdx].parts : [];
      const chapLocal = chapIdx >= 0 ? ((p - T.chaptersStart) / ((T.chaptersEnd - T.chaptersStart) / n)) - chapIdx : 0;
      let anchor = null;
      ORDER.forEach((key, i) => {
        const pe = this.partEls[key]; if (!pe) return;
        const st = (i / count) * span * 0.45;
        const e = ease(ramp(p, T.explodeStart + st, T.explodeStart + st + span * 0.55));
        const ri = (count - 1 - i);
        const rst = (ri / count) * rspan * 0.45;
        const rr = ease(ramp(p, T.reassembleStart + rst, T.reassembleStart + rst + rspan * 0.55));
        const amt = e * (1 - rr);
        const [dx, dy, rot] = EXPLODE[key];
        const focused = focusParts.includes(key);
        const pop = focused ? 1 + 0.06 * ease(clamp(chapLocal * 5)) * ease(clamp((1 - chapLocal) * 5)) : 1;
        const X = dx * amt, Y = dy * amt, R = rot * amt;
        pe.el.setAttribute("transform", `translate(${X.toFixed(2)} ${Y.toFixed(2)}) rotate(${R.toFixed(2)} ${pe.cx.toFixed(1)} ${pe.cy.toFixed(1)}) translate(${pe.cx.toFixed(1)} ${pe.cy.toFixed(1)}) scale(${pop.toFixed(4)}) translate(${(-pe.cx).toFixed(1)} ${(-pe.cy).toFixed(1)})`);
        pe.el.classList.toggle("is-focus", focused);
        if (focused && !anchor) anchor = [pe.cx + X, pe.cy + Y, pe.bb];
      });
      this.partsLayer.classList.toggle("has-focus", chapIdx >= 0);

      // camera follows the explode amount
      const gE = ease(ramp(p, T.explodeStart, T.explodeEnd)) * (1 - ease(ramp(p, T.reassembleStart, T.reassembleEnd)));
      const A = this.vbTight;
      const vb = A.map((v, i) => lerp(v, VB_WIDE[i], gE));
      this.svg.setAttribute("viewBox", vb.map(v => v.toFixed(1)).join(" "));
      this.decorLayer.style.opacity = (1 - gE * 0.75).toFixed(3);

      // 4 · leader line to the panel edge
      if (anchor && !this.mobile()) {
        const lt = ease(clamp(chapLocal * 4)) * ease(clamp((1 - chapLocal) * 8));
        const [ax, ay] = anchor;
        const ex = 1330, ey = clamp(ay, 40, 700);
        const mid = Math.max(ax + 60, 1180);
        this.leader.setAttribute("d", `M${ax.toFixed(1)},${ay.toFixed(1)} L${mid.toFixed(1)},${ey.toFixed(1)} L${ex},${ey.toFixed(1)}`);
        this.leader.style.strokeDashoffset = (1 - lt).toFixed(3);
        this.leader.style.opacity = lt > 0.01 ? 1 : 0;
        this.leaderDot.setAttribute("cx", ax.toFixed(1)); this.leaderDot.setAttribute("cy", ay.toFixed(1));
        this.leaderDot.style.opacity = lt;
      } else {
        this.leader.style.opacity = 0; this.leaderDot.style.opacity = 0;
      }

      // 5 · panel + chips + HUD
      const phase = p < T.plateStart ? "ASSEMBLED · REFERENCE PHOTO"
        : p < T.explodeStart ? "SCHEMATIC · DRAW-IN"
        : p < T.chaptersStart ? "EXPLODED VIEW"
        : chapIdx >= 0 ? `INSPECT · ${this.chapters[chapIdx].title.toUpperCase()}`
        : p < T.reassembleEnd ? "REASSEMBLY" : "ASSEMBLED";
      this.hud.querySelector("[data-hud=phase]").textContent = phase;
      this.hud.querySelector("[data-hud=pct]").textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
      this.hud.querySelector("[data-hud=bar]").style.transform = `scaleX(${p.toFixed(4)})`;

      const panelState = chapIdx >= 0 ? chapIdx : p >= T.photoBack ? -5 : (p >= T.explodeStart && p < T.reassembleStart ? -1 : (p >= T.reassembleStart ? -3 : -4));
      if (panelState !== this.chapter) {
        this.chapter = panelState;
        this.opts.renderPanel(this.panel, this.bike, chapIdx >= 0 ? this.chapters[chapIdx] : null, panelState);
        this.chipsEl.querySelectorAll(".td-chip").forEach(c => {
          const i = c.dataset.i;
          c.classList.toggle("is-active", (i === "re" && panelState === -3) || (+i === chapIdx && chapIdx >= 0) || (i === "-1" && panelState === -1));
          c.setAttribute("aria-pressed", c.classList.contains("is-active"));
        });
      }
      this.root.dataset.phase = panelState;
    },

    mobile() { return window.innerWidth < 900; }
  };

  window.Teardown = TD;
  window.TeardownTimeline = T;
})();
