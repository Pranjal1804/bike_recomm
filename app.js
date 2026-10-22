/**
 * MotoMatch India — Application layer
 * ====================================
 * Wires the redesigned interface to the unchanged recommendation engine
 * (engine.js → window.BikeEngine). Preference state, PURPOSE_MAP and the
 * userPrefs contract passed to runEnsemble() are identical to the original app.
 */
"use strict";
document.documentElement.classList.add("js");

(function () {
  const { BIKES } = BikeEngine;
  let io; // IntersectionObserver for .rise reveals
  const MEDIA = window.BIKE_MEDIA || {};
  const SPECS = window.BIKE_SPECS || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const byId = id => BIKES.find(b => b.id === +id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ─── formatting ───
  const fmtPrice = p => p >= 100000 ? `₹${(p / 100000).toFixed(2)}L` : `₹${Math.round(p / 1000)}K`;
  const fmtBudget = fmtPrice;
  const fmtMileage = v => ["", "Not important", "Low", "Medium", "High", "Critical"][v] || "Medium";
  const fmtComfort = v => ["", "Full sporty", "Sporty", "Balanced", "Comfortable", "Max comfort"][v] || "Balanced";
  const EXP = ["", "Beginner", "Intermediate", "Expert"];
  const SEG = { commuter: "Commuter", naked: "Naked", sports: "Supersport", adventure: "Adventure", cruiser: "Cruiser" };
  const PURP = { commuting: "Commuting", touring: "Touring", sports: "Sport", adventure: "Adventure", cruiser: "Cruising" };
  const BRAND = b => ({ "royal-enfield": "Royal Enfield", ktm: "KTM", tvs: "TVS", bmw: "BMW" }[b] || b.charAt(0).toUpperCase() + b.slice(1));
  const shortName = b => b.name;
  const num = (v, d = 0) => (+v).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });

  $$("[data-count]").forEach(el => (el.textContent = BIKES.length));

  // ─── dataset statistics (for honest relative statements) ───
  const STAT = {};
  ["price", "power", "torque", "mileage", "weight", "groundClearance", "cc", "comfort"].forEach(k => {
    const vals = BIKES.map(b => b[k]);
    STAT[k] = { min: Math.min(...vals), max: Math.max(...vals) };
  });
  STAT.p2w = (() => { const v = BIKES.map(b => b.power / b.weight * 1000); return { min: Math.min(...v), max: Math.max(...v) }; })();
  const share = (k, v, lower) => BIKES.filter(b => (lower ? b[k] > v : b[k] < v)).length; // # bikes this one beats

  // ─── media ───
  const NOIMG_SVG = `<svg viewBox="0 0 200 110" aria-hidden="true"><g fill="none" stroke="#a4abb4" stroke-width="1.4"><circle cx="42" cy="78" r="28"/><circle cx="160" cy="78" r="28"/><path d="M42 78 L82 52 L120 52 L160 78 M120 52 L138 24 L152 22 M70 46 L112 40 L118 52 M82 52 L96 74 L130 74"/></g></svg>`;
  function media(b) { return MEDIA[b.id] || null; }
  function imgTag(b, opts = {}) {
    const m = media(b);
    if (!m) return `<div class="noimg">${NOIMG_SVG}<span>No licensed photograph sourced for this model</span></div>`;
    const src = opts.large ? m.large : m.src;
    return `<img src="${esc(src)}" alt="${esc(b.name)}${m.note ? " — " + esc(m.note) : ""}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" width="960" height="720" data-fallback="1" />`;
  }
  const studio = b => (media(b) && media(b).studio ? "is-studio" : "");
  function bgStyle(b) { const m = media(b); return m ? `style="background-image:url('${m.src.replace(/'/g, "%27")}')"` : ""; }
  // Graceful image failure → honest placeholder
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.fallback) {
      const ph = document.createElement("div");
      ph.className = "noimg";
      ph.innerHTML = `${NOIMG_SVG}<span>Photo unavailable offline</span>`;
      img.replaceWith(ph);
    }
  }, true);

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("is-on"), 2200);
  }

  // ═══ HERO ═══
  (function hero() {
    const b = byId(29), m = media(b);
    const rows = [["Engine", `${num(b.cc)} cc`], ["Power", `${b.power} bhp`], ["Torque", `${b.torque} Nm`], ["Weight", `${b.weight} kg`], ["Price", fmtPrice(b.price)], ["Segment", SEG[b.segment]]];
    $("#heroReadout").innerHTML = `<dt class="ro-name" style="--i:0">${esc(b.name)}</dt>` + rows.map(([k, v], i) => `<dt style="--i:${i + 1}">${k}</dt><dd style="--i:${i + 1}">${v}</dd>`).join("");
    $("#heroModelTag").textContent = `MODEL ${String(b.id).padStart(3, "0")} · ${b.brand.toUpperCase()}`;
    if (m) $("#heroCredit").innerHTML = `Photo: <a href="${m.page}" target="_blank" rel="noopener">Wikimedia Commons</a> · ${m.license}`;
    $("#heroImg").addEventListener("error", () => $(".hero__bike").classList.add("is-missing"));
  })();

  // nav solidity
  const nav = $("#nav");
  const onNav = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onNav, { passive: true }); onNav();

  // ═══ STATE (same contract as the original app) ═══
  const state = { budget: 150000, power: 20, mileageImp: 3, experience: 1, comfort: 3, maxWeight: 180, purpose: "commuting", segment: "any", brand: "any" };
  const PURPOSE_MAP = {
    commuting: ["commuting", "sports"],
    touring: ["touring", "adventure", "cruiser"],
    sports: ["sports", "commuting"],
    adventure: ["adventure", "touring"],
    cruiser: ["cruiser", "touring"]
  };
  const userPrefs = () => ({
    budget: state.budget, power: state.power, mileageImp: state.mileageImp, comfort: +state.comfort,
    experience: +state.experience, maxWeight: state.maxWeight, purpose: state.purpose,
    relatedPurposes: PURPOSE_MAP[state.purpose] || [], segment: state.segment, brand: state.brand
  });

  // sliders
  function slider(id, out, fmt, key) {
    const el = $("#" + id), o = $("#" + out);
    const paint = () => el.style.setProperty("--val", ((+el.value - +el.min) / (+el.max - +el.min)) * 100 + "%");
    el.addEventListener("input", () => { state[key] = +el.value; o.textContent = fmt(+el.value); paint(); schedule(); });
    el._sync = () => { el.value = state[key]; o.textContent = fmt(state[key]); paint(); };
    el._sync();
  }
  slider("budget", "budgetVal", fmtBudget, "budget");
  slider("power", "powerVal", v => `${v} bhp`, "power");
  slider("mileageImp", "mileageImpVal", fmtMileage, "mileageImp");
  slider("comfort", "comfortVal", fmtComfort, "comfort");
  slider("bikeWeight", "weightVal", v => `≤ ${v} kg`, "maxWeight");

  // brand options generated from the dataset (adds BMW, Kawasaki, Jawa which the old UI omitted)
  const brands = [...new Set(BIKES.map(b => b.brand))].sort();
  $("#brandGroup").innerHTML = `<button type="button" role="radio" class="seg__b is-on" data-value="any" aria-checked="true">Any</button>` +
    brands.map(b => `<button type="button" role="radio" class="seg__b" data-value="${b}" aria-checked="false">${esc(BRAND(b))} <sup>${BIKES.filter(x => x.brand === b).length}</sup></button>`).join("");

  function radio(groupId, key, cast = v => v) {
    const g = $("#" + groupId);
    const set = v => {
      $$(".seg__b", g).forEach(b => { const on = b.dataset.value === String(v); b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
    };
    g.addEventListener("click", e => { const b = e.target.closest(".seg__b"); if (!b) return; state[key] = cast(b.dataset.value); set(b.dataset.value); schedule(); });
    g.addEventListener("keydown", e => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const items = $$(".seg__b", g), i = items.findIndex(b => b.classList.contains("is-on"));
      const n = items[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
      n.click(); n.focus();
    });
    g._sync = () => set(state[key]);
    g._sync();
  }
  radio("purposeGroup", "purpose");
  radio("experienceGroup", "experience", v => +v);
  radio("segmentGroup", "segment");
  radio("brandGroup", "brand");

  // ═══ RUN THE ENSEMBLE ═══
  let last = null, compareTouched = false, raf = 0;
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); }

  function run() {
    const prefs = userPrefs();
    const { ensemble, ahpResult } = BikeEngine.runEnsemble(BIKES, prefs);
    last = { ensemble, ahpResult, prefs };
    renderFilterNote(prefs);
    renderBoard(ensemble, prefs);
    renderTelemetry(ensemble, ahpResult, prefs);
    renderDecision(ensemble[0], prefs, ensemble);
    if (!compareTouched) setCompare(ensemble.slice(0, 3).map(r => r.bike.id), true);
  }

  function renderFilterNote(prefs) {
    const note = $("#filterNote");
    if (prefs.brand !== "any") {
      const n = BIKES.filter(b => b.brand === prefs.brand).length;
      if (n < 3) { note.hidden = false; note.textContent = `Only ${n} ${BRAND(prefs.brand)} bike${n > 1 ? "s" : ""} in the dataset. The engine filters by brand when at least 3 exist, so all brands are being ranked.`; return; }
    }
    note.hidden = true;
  }

  // Reasons and trade-offs — every line is a direct comparison of dataset fields with the brief.
  function assess(b, prefs) {
    const why = [], trade = [];
    const d = prefs.budget - b.price;
    if (d >= 0) why.push(`${fmtPrice(b.price)} — ${fmtPrice(d)} inside your ${fmtPrice(prefs.budget)} budget.`);
    else trade.push(`${fmtPrice(b.price)} — ${fmtPrice(-d)} (${Math.round(-d / prefs.budget * 100)}%) over your budget.`);
    const pd = b.power - prefs.power;
    if (Math.abs(pd) <= Math.max(3, prefs.power * 0.2)) why.push(`${b.power} bhp sits within ${Math.abs(pd).toFixed(1)} bhp of your ${prefs.power} bhp target.`);
    else if (pd > 0) trade.push(`${b.power} bhp is ${pd.toFixed(1)} bhp above your target — more than you asked for.`);
    else trade.push(`${b.power} bhp is ${(-pd).toFixed(1)} bhp short of your target.`);
    if (b.purpose.includes(prefs.purpose)) why.push(`Listed for ${PURP[prefs.purpose].toLowerCase()} in the dataset.`);
    else trade.push(`Not listed for ${PURP[prefs.purpose].toLowerCase()}; tagged ${b.purpose.map(p => PURP[p].toLowerCase()).join(", ")}.`);
    if (b.experience <= prefs.experience) why.push(`Rated suitable for ${EXP[b.experience].toLowerCase()} riders — matches your experience.`);
    else trade.push(`Rated for ${EXP[b.experience].toLowerCase()} riders; you selected ${EXP[prefs.experience].toLowerCase()}.`);
    if (b.weight <= prefs.maxWeight) why.push(`${b.weight} kg, under your ${prefs.maxWeight} kg limit.`);
    else trade.push(`${b.weight} kg, ${b.weight - prefs.maxWeight} kg over your weight limit.`);
    if (prefs.mileageImp >= 4) (b.mileage >= 45 ? why : trade).push(`Claimed ${b.mileage} kmpl — ${b.mileage >= 45 ? "strong" : "modest"} for a brief where mileage is ${fmtMileage(prefs.mileageImp).toLowerCase()}.`);
    const cd = b.comfort - prefs.comfort;
    if (Math.abs(cd) <= 1) why.push(`Comfort rating ${b.comfort}/5 is close to your ${fmtComfort(prefs.comfort).toLowerCase()} preference.`);
    else trade.push(`Comfort rating ${b.comfort}/5 — ${cd < 0 ? "firmer and sportier" : "softer and more relaxed"} than you asked for.`);
    if (!b.abs) trade.push("No ABS listed in the dataset.");
    return { why, trade };
  }

  function renderBoard(ens, prefs) {
    const top = ens[0], b = top.bike, m = media(b);
    const pct = r => Math.round(r.ensembleScore * 100);
    const lead = `
      <article class="lead">
        <div class="lead__media ${studio(b)}">${imgTag(b)}</div>
        <div>
          <p class="lead__rank">#01 · Top match</p>
          <h3 class="lead__name">${esc(b.name)}</h3>
          <div class="lead__score"><b>${pct(top)}</b><span>Ensemble score · normalised against all ${BIKES.length} bikes</span></div>
          <ul class="chips">
            <li>${fmtPrice(b.price)}</li><li>${b.power} bhp</li><li>${b.torque} Nm</li><li>${b.mileage} kmpl</li><li>${b.weight} kg</li><li>${b.abs ? "ABS" : "No ABS"}</li>
          </ul>
          <div class="lead__actions">
            <button class="mini" type="button" data-tear="${b.id}">Tear down</button>
            <button class="mini" type="button" data-cmp="${b.id}" aria-pressed="${compareIds.includes(b.id)}">${compareIds.includes(b.id) ? "In compare" : "+ Compare"}</button>
            <a class="mini" href="#decision" style="display:grid;place-items:center;text-decoration:none">Why this →</a>
          </div>
          ${m && m.note ? `<p class="tp-src" style="margin-top:10px">Photo: ${esc(m.note)}</p>` : ""}
        </div>
      </article>`;
    const rows = ens.slice(1, 9).map((r, i) => {
      const x = r.bike;
      return `<li class="row">
        <span class="row__n">${String(i + 2).padStart(2, "0")}</span>
        <span class="row__img ${studio(x)}" ${bgStyle(x)} role="img" aria-label="${esc(x.name)}"></span>
        <span class="row__name">${esc(x.name)}<small>${fmtPrice(x.price)} · ${x.power} bhp · ${x.weight} kg · ${SEG[x.segment]} ·
          <button class="linkbtn" type="button" data-tear="${x.id}">Tear down</button> ·
          <button class="linkbtn" type="button" data-cmp="${x.id}" aria-pressed="${compareIds.includes(x.id)}">${compareIds.includes(x.id) ? "In compare" : "Compare"}</button></small></span>
        <span class="row__pct">${pct(r)}</span>
        <span class="row__bar"><i style="transform:scaleX(${r.ensembleScore.toFixed(3)})"></i></span>
      </li>`;
    }).join("");
    $("#board").innerHTML = lead + `<ol class="rows" start="2">${rows}</ol>`;
  }

  function renderTelemetry(ens, ahp, prefs) {
    const crit = ["Budget", "Power", "Mileage", "Comfort", "Experience", "Purpose", "Weight", "Ground clr."];
    const w = ahp.weights;
    const top = ens[0];
    const ms = top.modelScores;
    const models = [["TOPSIS", ms.topsis, "25%"], ["AHP", ms.ahp, "25%"], ["Fuzzy", ms.fuzzy, "20%"], ["K-NN", ms.knn, "15%"], ["WSM", ms.wsm, "15%"]];
    $("#telemetryBody").innerHTML = `
      <div class="tm">
        <h4>AHP criterion weights</h4>
        <ul class="tm-bars">${crit.map((c, i) => `<li><span>${c}</span><i style="transform:scaleX(${(w[i] / Math.max(...w)).toFixed(3)})"></i><b>${(w[i] * 100).toFixed(1)}%</b></li>`).join("")}</ul>
        <p style="margin-top:10px">λmax ${ahp.lambdaMax.toFixed(3)} · CI ${ahp.CI.toFixed(3)} · CR ${ahp.CR.toFixed(3)} ${ahp.CR < 0.1 ? "(consistent, CR &lt; 0.10)" : "(above the 0.10 consistency threshold)"}</p>
      </div>
      <div class="tm">
        <h4>Model scores for ${esc(top.bike.name)}</h4>
        <ul class="tm-bars">${models.map(([n, v, wt]) => `<li><span>${n} <small>×${wt}</small></span><i style="transform:scaleX(${v.toFixed(3)})"></i><b>${Math.round(v * 100)}</b></li>`).join("")}</ul>
        <p style="margin-top:10px">Each model's scores are min–max normalised across the field, then blended with the weights shown.${ens.length < BIKES.length ? ` Ranking limited to ${ens.length} bikes by your segment/brand filter.` : ""}</p>
      </div>
      <div class="tm">
        <h4>Top five — per-model view</h4>
        <table class="tm-table"><thead><tr><th>Bike</th><th>TOP</th><th>FUZ</th><th>KNN</th><th>Σ</th></tr></thead>
        <tbody>${ens.slice(0, 5).map(r => `<tr><td>${esc(r.bike.name)}</td><td>${Math.round(r.modelScores.topsis * 100)}</td><td>${Math.round(r.modelScores.fuzzy * 100)}</td><td>${Math.round(r.modelScores.knn * 100)}</td><td>${Math.round(r.ensembleScore * 100)}</td></tr>`).join("")}</tbody></table>
      </div>`;
  }

  function renderDecision(top, prefs, ens) {
    const b = top.bike, m = media(b);
    $("#decTitle").textContent = b.name;
    $("#decMeta").textContent = `${BRAND(b.brand)} · ${SEG[b.segment]} · ${num(b.cc, 1)} cc · ${fmtPrice(b.price)} · Ensemble ${Math.round(top.ensembleScore * 100)}`;
    const dm = $("#decMedia");
    dm.className = "decision__media " + studio(b);
    dm.innerHTML = imgTag(b, { large: true }) + (m ? `<span class="credit">${m.note ? esc(m.note) + " · " : ""}Wikimedia Commons · ${m.license}</span>` : "");
    const { why, trade } = assess(b, prefs);
    $("#decWhy").innerHTML = why.map(t => `<li>${esc(t)}</li>`).join("") || `<li class="none">No direct matches against your brief — it ranks on overall balance.</li>`;
    $("#decTrade").innerHTML = trade.map(t => `<li>${esc(t)}</li>`).join("") || `<li class="none">No compromises against the brief you set.</li>`;
    $("#decTear").onclick = () => tearDown(b.id);
    $("#decCompare").onclick = () => { setCompare(ens.slice(0, 3).map(r => r.bike.id)); $("#compare").scrollIntoView(); };
  }

  // ═══ ACTIONS shared across sections ═══
  function tearDown(id) {
    $("#tdBike").value = id;
    Teardown.setBike(id);
    const r = $("#teardown").getBoundingClientRect();
    const dist = $("#teardown").offsetHeight - innerHeight;
    // land just after the explode so the visitor sees the separated machine
    const target = window.scrollY + r.top + dist * (Teardown.reduced ? 0 : 0.255);
    window.scrollTo({ top: target, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-tear]");
    if (t) { e.preventDefault(); tearDown(t.dataset.tear); return; }
    const c = e.target.closest("[data-cmp]");
    if (c) { e.preventDefault(); toggleCompare(+c.dataset.cmp); }
  });

  // ═══ COMPARE ═══
  let compareIds = [];
  const optionList = sel => `<option value="">— Empty slot —</option>` + Object.keys(SEG).map(s =>
    `<optgroup label="${SEG[s]}">${BIKES.filter(b => b.segment === s).map(b => `<option value="${b.id}" ${+sel === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")}</optgroup>`).join("");

  function setCompare(ids, auto) {
    compareIds = ids.filter(Boolean).slice(0, 3);
    if (!auto) compareTouched = true;
    renderCompare();
    syncCompareButtons();
  }
  function toggleCompare(id) {
    compareTouched = true;
    if (compareIds.includes(id)) { compareIds = compareIds.filter(x => x !== id); toast(`Removed ${byId(id).name} from compare`); }
    else if (compareIds.length >= 3) { toast("Compare holds three bikes — remove one first"); return; }
    else { compareIds.push(id); toast(`Added ${byId(id).name} to compare`); }
    renderCompare(); syncCompareButtons();
  }
  function syncCompareButtons() {
    $$("[data-cmp]").forEach(b => {
      const on = compareIds.includes(+b.dataset.cmp);
      b.setAttribute("aria-pressed", on);
      if (b.classList.contains("mini") || b.classList.contains("linkbtn")) b.textContent = on ? "In compare" : (b.classList.contains("linkbtn") ? "Compare" : "+ Compare");
    });
  }

  function renderCompare() {
    const slots = [0, 1, 2].map(i => compareIds[i] || "");
    $("#cmpPick").innerHTML = slots.map((id, i) => `<label class="cmp__slot">Slot ${i + 1}<select data-slot="${i}">${optionList(id)}</select></label>`).join("");
    $$("#cmpPick select").forEach(s => s.addEventListener("change", () => {
      const next = [0, 1, 2].map(i => +$(`#cmpPick select[data-slot="${i}"]`).value || null).filter(Boolean);
      setCompare([...new Set(next)]);
    }));
    const bikes = compareIds.map(byId);
    if (!bikes.length) { $("#cmpWrap").innerHTML = `<p class="cmp-empty">Choose bikes above, or use “Compare” anywhere on the page.</p>`; return; }

    const p2w = b => b.power / b.weight * 1000;
    const ROWS = [
      { sect: "Price & fit" },
      { k: "Ex-showroom price", v: b => b.price, f: fmtPrice, best: "min", stat: "price" },
      { k: "Segment", v: b => SEG[b.segment] },
      { k: "Listed purposes", v: b => b.purpose.map(p => PURP[p]).join(", ") },
      { k: "Experience level", v: b => b.experience, f: v => EXP[v], best: "min" },
      { sect: "Performance" },
      { k: "Displacement", v: b => b.cc, f: v => `${num(v, 1)} cc`, stat: "cc" },
      { k: "Power", v: b => b.power, f: v => `${v} bhp`, best: "max", stat: "power" },
      { k: "Torque", v: b => b.torque, f: v => `${v} Nm`, best: "max", stat: "torque" },
      { k: "Power-to-weight", v: p2w, f: v => `${v.toFixed(0)} bhp/t`, best: "max", stat: "p2w" },
      { sect: "Practicality" },
      { k: "Claimed mileage", v: b => b.mileage, f: v => `${v} kmpl`, best: "max", stat: "mileage" },
      { k: "Kerb weight", v: b => b.weight, f: v => `${v} kg`, best: "min", stat: "weight" },
      { k: "Ground clearance", v: b => b.groundClearance, f: v => `${v} mm`, best: "max", stat: "groundClearance" },
      { k: "ABS", v: b => b.abs ? 1 : 0, f: v => v ? "Yes" : "No", best: "max" },
      { k: "Comfort rating", v: b => b.comfort, f: v => `${v} / 5`, best: "max", stat: "comfort" },
      { sect: "Hardware (sourced, where available)" },
      { k: "Frame", v: b => SPECS[b.id]?.frame },
      { k: "Front suspension", v: b => SPECS[b.id]?.frontSusp },
      { k: "Front brake", v: b => SPECS[b.id]?.frontBrake },
      { k: "Tyres F / R", v: b => SPECS[b.id]?.tyreF ? `${SPECS[b.id].tyreF} / ${SPECS[b.id].tyreR}` : undefined },
      { k: "Fuel tank", v: b => SPECS[b.id]?.fuelTank, f: v => `${v} L` },
      { k: "Seat height", v: b => SPECS[b.id]?.seatHeight, f: v => `${v} mm` }
    ];
    const head = `<thead><tr><th scope="col"><span class="sr">Specification</span></th>${bikes.map(b => `<th scope="col"><div class="cmp__head"><div class="cmp__img ${studio(b)}" ${bgStyle(b)} role="img" aria-label="${esc(b.name)}">${media(b) ? "" : `<div class="noimg">${NOIMG_SVG}</div>`}</div><h3>${esc(b.name)}</h3></div></th>`).join("")}</tr></thead>`;
    const body = ROWS.map(r => {
      if (r.sect) return `<tr class="sect"><th colspan="${bikes.length + 1}" scope="colgroup">${r.sect}</th></tr>`;
      const vals = bikes.map(r.v);
      const present = vals.filter(v => v !== undefined && v !== null);
      let bestV = null;
      if (r.best && bikes.length > 1 && present.length > 1) {
        bestV = r.best === "max" ? Math.max(...present) : Math.min(...present);
        if (present.every(v => v === bestV)) bestV = null; // no winner on ties
      }
      return `<tr><th scope="row">${r.k}</th>${vals.map(v => {
        if (v === undefined || v === null) return `<td class="na">Not in dataset</td>`;
        const S = r.stat && STAT[r.stat];
        const bar = S ? `<span class="cbar"><i style="width:${(Math.max(.04, (v - S.min) / (S.max - S.min)) * 100).toFixed(1)}%"></i></span>` : "";
        return `<td class="${bestV !== null && v === bestV ? "best" : ""}">${esc(r.f ? r.f(v) : v)}${bar}</td>`;
      }).join("")}</tr>`;
    }).join("");
    $("#cmpWrap").innerHTML = `<table class="cmp">${head}<tbody>${body}</tbody></table>`;
  }

  // ═══ LINEUP ═══
  function segTabs(el, onPick) {
    const segs = ["all", ...Object.keys(SEG)];
    el.innerHTML = segs.map((s, i) => `<button role="tab" type="button" aria-selected="${i === 0}" data-seg="${s}">${s === "all" ? "All" : SEG[s]}<sup>${s === "all" ? BIKES.length : BIKES.filter(b => b.segment === s).length}</sup></button>`).join("");
    el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", el).forEach(x => x.setAttribute("aria-selected", x === b));
      onPick(b.dataset.seg);
    });
  }
  function renderLineup(seg) {
    const list = BIKES.filter(b => seg === "all" || b.segment === seg).sort((a, b) => a.price - b.price);
    $("#lineupGrid").innerHTML = list.map(b => {
      const m = media(b);
      return `<article class="card rise">
        <div class="card__media ${studio(b)}">${imgTag(b)}<span class="card__seg">${SEG[b.segment]}</span>${m && m.note ? `<span class="card__note">${esc(m.note)}</span>` : ""}</div>
        <div class="card__body">
          <span class="card__brand">${esc(BRAND(b.brand))} · ${fmtPrice(b.price)}</span>
          <h3 class="card__name">${esc(b.name)}</h3>
          <dl class="card__stats"><div><dt>cc</dt><dd>${Math.round(b.cc)}</dd></div><div><dt>bhp</dt><dd>${b.power}</dd></div><div><dt>kmpl</dt><dd>${b.mileage}</dd></div><div><dt>kg</dt><dd>${b.weight}</dd></div></dl>
          <div class="card__actions"><button class="mini" type="button" data-tear="${b.id}">Tear down</button><button class="mini" type="button" data-cmp="${b.id}" aria-pressed="false">+ Compare</button></div>
        </div></article>`;
    }).join("");
    syncCompareButtons();
    observeRise();
  }
  segTabs($("#lineupTabs"), renderLineup);
  renderLineup("all");

  // ═══ USE CASES ═══
  const UC = [
    { key: "commuting", t: "Daily commute", d: "Traffic, short hops, running cost. Light, frugal, forgiving.", img: 4 },
    { key: "touring", t: "Long-distance touring", d: "Highways and long days. Torque, comfort, stability.", img: 23 },
    { key: "sports", t: "Performance", d: "Corners and track days. Power-to-weight, brakes, chassis.", img: 19 },
    { key: "adventure", t: "Adventure", d: "Broken roads and the hills. Clearance, travel, big front wheel.", img: 21 },
    { key: "cruiser", t: "Cruising", d: "Relaxed pace, low seat, character. Torque over revs.", img: 34 }
  ];
  $("#ucList").innerHTML = UC.map((u, i) => {
    const b = byId(u.img), m = media(b), n = BIKES.filter(x => x.purpose.includes(u.key)).length;
    return `<button class="uc" type="button" data-uc="${u.key}">
      ${m ? `<img src="${esc(m.src)}" alt="" loading="lazy" decoding="async" data-fallback="1" />` : ""}
      <span class="uc__body">
        <span class="uc__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="uc__t">${u.t}</span>
        <span class="uc__d">${u.d}</span>
        <span class="uc__c">${n} bikes tagged · pictured: ${esc(b.name)}</span>
        <span class="uc__go">Set as purpose →</span>
      </span></button>`;
  }).join("");
  $("#ucList").addEventListener("click", e => {
    const b = e.target.closest("[data-uc]"); if (!b) return;
    state.purpose = b.dataset.uc; $("#purposeGroup")._sync(); run();
    $("#configure").scrollIntoView();
    toast(`Purpose set to ${PURP[state.purpose]}`);
  });

  // ═══ SPEC SHEET ═══
  let specSeg = "all", sortKey = "price", sortDir = 1;
  function renderSpecs() {
    const rows = BIKES.filter(b => specSeg === "all" || b.segment === specSeg).slice().sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      return (typeof x === "string" ? x.localeCompare(y) : (x - y)) * sortDir;
    });
    $("#specTable tbody").innerHTML = rows.map(b => `<tr data-tear="${b.id}" tabindex="0" aria-label="Tear down ${esc(b.name)}">
      <td>${esc(b.name)}</td><td>${SEG[b.segment]}</td><td class="num">${b.cc}</td><td class="num">${b.power}</td><td class="num">${b.torque}</td>
      <td class="num">${b.mileage}</td><td class="num">${b.weight}</td><td class="num">${b.groundClearance}</td><td class="num">${fmtPrice(b.price)}</td>
      <td class="${b.abs ? "yes" : "no"}">${b.abs ? "Yes" : "No"}</td></tr>`).join("");
    $$("#specTable th button").forEach(btn => {
      if (btn.dataset.sort === sortKey) btn.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending"); else btn.removeAttribute("aria-sort");
    });
  }
  $("#specTable thead").addEventListener("click", e => {
    const b = e.target.closest("button[data-sort]"); if (!b) return;
    if (sortKey === b.dataset.sort) sortDir *= -1; else { sortKey = b.dataset.sort; sortDir = 1; }
    renderSpecs();
  });
  $("#specTable tbody").addEventListener("keydown", e => { if (e.key === "Enter") { const r = e.target.closest("tr[data-tear]"); if (r) tearDown(r.dataset.tear); } });
  segTabs($("#specTabs"), s => { specSeg = s; renderSpecs(); });
  renderSpecs();

  // ═══ TEARDOWN ═══
  const sel = $("#tdBike");
  sel.innerHTML = Object.keys(SEG).map(s => `<optgroup label="${SEG[s]}">${BIKES.filter(b => b.segment === s).map(b => `<option value="${b.id}">${esc(b.name)}${SPECS[b.id] ? " ◆" : ""}</option>`).join("")}</optgroup>`).join("");
  sel.value = 29;
  sel.addEventListener("change", () => Teardown.setBike(+sel.value));

  function specRow(label, value, unit = "", src) {
    if (value === undefined || value === null || value === "") return `<div><dt>${label}</dt><dd class="na">Not in dataset</dd></div>`;
    return `<div><dt>${label}</dt><dd>${esc(value)}${unit}${src ? '<span class="src-tag" title="From the cited source">SRC</span>' : ""}</dd></div>`;
  }

  function chapterData(ch, b) {
    const X = SPECS[b.id] || {};
    const n = BIKES.length;
    const rows = [];
    let imp = "";
    switch (ch.key) {
      case "engine": {
        const spec = b.power / b.cc * 1000, p2w = b.power / b.weight * 1000;
        rows.push(specRow("Displacement", num(b.cc, 1), " cc"), specRow("Peak power", b.power, " bhp"), specRow("Peak torque", b.torque, " Nm"),
          specRow("Specific output", spec.toFixed(0), " bhp/L"), specRow("Power-to-weight", p2w.toFixed(0), " bhp/t"),
          specRow("Engine", X.engineType, "", 1), specRow("Gearbox", X.gearbox, "", 1));
        imp = `More torque than ${share("torque", b.torque)} of ${n} bikes in the dataset; power-to-weight beats ${BIKES.filter(x => x.power / x.weight * 1000 < p2w).length}.`;
        break;
      }
      case "frame":
        rows.push(specRow("Kerb weight", b.weight, " kg"), specRow("Ground clearance", b.groundClearance, " mm"), specRow("Frame type", X.frame, "", 1), specRow("Seat height", X.seatHeight, " mm", 1));
        {
          const lighter = share("weight", b.weight, true), heavier = share("weight", b.weight);
          imp = (lighter >= heavier ? `Lighter than ${lighter} of ${n} bikes in the dataset` : `Heavier than ${heavier} of ${n} bikes in the dataset`) + `; more ground clearance than ${share("groundClearance", b.groundClearance)}.`;
        }
        break;
      case "suspension":
        rows.push(specRow("Front", X.frontSusp, "", 1), specRow("Rear", X.rearSusp, "", 1), specRow("Comfort rating", `${b.comfort} / 5`), specRow("Ground clearance", b.groundClearance, " mm"));
        imp = b.comfort >= 4 ? `Rated ${b.comfort}/5 for comfort — among the plusher bikes in the set.` : b.comfort <= 2 ? `Rated ${b.comfort}/5 for comfort — tuned firm; expect to feel broken roads.` : `Rated ${b.comfort}/5 for comfort — a middle-of-the-road setup.`;
        break;
      case "brakes":
        rows.push(specRow("ABS", b.abs ? "Yes" : "No"), specRow("ABS type", X.absType, "", 1), specRow("Front brake", X.frontBrake, "", 1), specRow("Rear brake", X.rearBrake, "", 1));
        imp = b.abs ? "ABS is fitted — the single most valuable safety system on a motorcycle." : `No ABS listed. ${BIKES.filter(x => x.abs).length} of ${n} bikes in the dataset have it; weigh this heavily.`;
        break;
      case "wheels":
        rows.push(specRow("Front tyre", X.tyreF, "", 1), specRow("Rear tyre", X.tyreR, "", 1), specRow("Wheels", X.wheels, "", 1), specRow("Segment", SEG[b.segment]));
        imp = X.tyreF ? `Front ${X.tyreF}, rear ${X.tyreR}. Check replacement tyre availability and price before you buy.` : "Tyre sizes for this model are not in the dataset — check the manufacturer's spec sheet.";
        break;
      case "fuel": {
        const range = X.fuelTank ? Math.round(X.fuelTank * b.mileage) : null;
        rows.push(specRow("Claimed mileage", b.mileage, " kmpl"), specRow("Fuel tank", X.fuelTank, " L", 1), specRow("Est. range per fill", range, " km"), specRow("Gearbox", X.gearbox, "", 1));
        imp = range ? `≈ ${range} km per tank at the claimed ${b.mileage} kmpl (tank × mileage; real-world will be lower).` : `Claimed ${b.mileage} kmpl — better than ${share("mileage", b.mileage)} of ${n} bikes.`;
        break;
      }
      case "ergo":
        rows.push(specRow("Comfort rating", `${b.comfort} / 5`), specRow("Experience level", EXP[b.experience]), specRow("Listed purposes", b.purpose.map(p => PURP[p]).join(", ")), specRow("Seat height", X.seatHeight, " mm", 1));
        imp = `Dataset rates it for ${EXP[b.experience].toLowerCase()} riders and tags it for ${b.purpose.map(p => PURP[p].toLowerCase()).join(", ")}.`;
        break;
    }
    return { rows: rows.join(""), imp };
  }

  function renderPanel(panel, b, ch, state) {
    const X = SPECS[b.id];
    const src = X ? `<p class="tp-src">Hardware marked SRC: <a href="${X.source.url}" target="_blank" rel="noopener">${esc(X.source.label)}</a>. Other figures: project dataset.</p>` : `<p class="tp-src">Figures from the project dataset. Model-specific hardware (tyres, brakes, suspension) is sourced for the six models marked ◆ in the selector.</p>`;
    if (state === -4 || state === -5) { panel.innerHTML = ""; return; }
    if (state === -1) {
      panel.innerHTML = `<p class="tp-code">00 · OVERVIEW</p><h3 class="tp-title">Exploded view</h3>
        <p class="tp-role">${b.name} separated into its major assemblies. Keep scrolling to inspect each one, or select a part directly.</p>
        <dl class="tp-specs">${specRow("Segment", SEG[b.segment])}${specRow("Price", fmtPrice(b.price))}${specRow("Engine", num(b.cc, 1), " cc")}${specRow("Power / torque", `${b.power} bhp · ${b.torque} Nm`)}${specRow("Weight", b.weight, " kg")}</dl>${src}`;
      return;
    }
    if (state === -3) {
      panel.innerHTML = `<p class="tp-code">08 · REASSEMBLY</p><h3 class="tp-title">Understand the machine.</h3>
        <p class="tp-role">You've seen the trade-offs component by component. Now let the models find the one that fits how you ride.</p>
        <ul class="tp-look"><li>${b.pros.map(esc).join("</li><li>")}</li></ul>
        <div class="decision__actions"><a class="btn btn--primary" href="#configure">Find my bike <span aria-hidden="true">→</span></a><button class="btn btn--ghost" type="button" data-cmp="${b.id}">Compare</button></div>`;
      syncCompareButtons();
      return;
    }
    const d = chapterData(ch, b);
    panel.innerHTML = `<p class="tp-code">${ch.code} · ${esc(b.name.toUpperCase())}</p>
      <h3 class="tp-title">${ch.title}</h3>
      <p class="tp-role">${ch.role}</p>
      <dl class="tp-specs">${d.rows}</dl>
      <p class="tp-implication">${esc(d.imp)}</p>
      <ul class="tp-look">${ch.look.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
      ${src}`;
  }

  function onBikeChange(b) {
    $("#tdName").textContent = b.name;
    if (+sel.value !== b.id) sel.value = b.id;
    const m = media(b);
    const im = $(".td-plate__img");
    im.className = "td-plate__img" + (m ? (m.studio ? " is-studio" : "") : " is-none");
    im.style.backgroundImage = m ? `url("${m.large}")` : "";
    im.setAttribute("role", "img");
    im.setAttribute("aria-label", m ? `Photograph: ${b.name}${m.note ? " (" + m.note + ")" : ""}` : `No licensed photograph available for ${b.name}`);
    $(".td-plate__cap").innerHTML = m ? `${m.note ? esc(m.note) + " · " : ""}<a href="${m.page}" target="_blank" rel="noopener" style="color:inherit">Commons</a> · ${m.license}` : "Reference photo unavailable";
    $("#tdIntroSpecs").innerHTML = [["Engine", Math.round(b.cc), "cc"], ["Power", b.power, "bhp"], ["Torque", b.torque, "Nm"], ["Weight", b.weight, "kg"], ["Price", fmtPrice(b.price), ""]]
      .map(([k, v, u]) => `<div><dt>${k}</dt><dd>${v}<small>${u}</small></dd></div>`).join("");
  }

  Teardown.init({ initialBikeId: 29, renderPanel, onBikeChange });

  // ═══ CREDITS (lazy: authors fetched from Commons only when opened) ═══
  const credits = $("#credits");
  credits.addEventListener("toggle", async () => {
    if (!credits.open || credits.dataset.loaded) return;
    credits.dataset.loaded = "1";
    const list = $("#creditsList");
    const entries = Object.entries(MEDIA).map(([id, m]) => ({ id, m, b: byId(id) }));
    list.innerHTML = entries.map(({ id, m, b }) => `<li id="cr-${id}"><strong>${esc(b.name)}</strong> — <a href="${m.page}" target="_blank" rel="noopener">${esc(m.file)}</a>, <span class="cr-a">author on file page</span>, <a href="${m.licenseUrl}" target="_blank" rel="noopener">${m.license}</a>${m.note ? ` · ${esc(m.note)}` : ""}</li>`).join("");
    try {
      const titles = entries.map(e => "File:" + e.m.file);
      for (let i = 0; i < titles.length; i += 40) {
        const url = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&format=json&origin=*&titles=" + encodeURIComponent(titles.slice(i, i + 40).join("|"));
        const j = await fetch(url).then(r => r.json());
        const norm = {}; (j.query.normalized || []).forEach(x => (norm[x.to] = x.from));
        Object.values(j.query.pages).forEach(p => {
          const t = (norm[p.title] || p.title).replace(/^File:/, "");
          const e = entries.find(x => x.m.file === t);
          const artist = p.imageinfo && p.imageinfo[0].extmetadata.Artist ? p.imageinfo[0].extmetadata.Artist.value.replace(/<[^>]+>/g, "").trim() : "";
          if (e && artist) $(`#cr-${e.id} .cr-a`).textContent = artist;
        });
      }
    } catch (err) { /* offline: links to file pages remain the attribution */ }
  });

  // ═══ scroll-in reveals ═══
  function observeRise() {
    if (!("IntersectionObserver" in window)) { $$(".rise").forEach(el => el.classList.add("is-in")); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".rise:not(.is-in)").forEach(el => io.observe(el));
  }
  $$(".section__head").forEach(el => el.classList.add("rise"));
  observeRise();

  run();
})();
