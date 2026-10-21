/**
 * MotoMatch India — Application UI Logic
 * Handles: Particle canvas, form interactions,
 *          result rendering, dataset table
 */

"use strict";

// ─── Particle Canvas ───
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.6 ? '#f97316' : Math.random() > 0.5 ? '#6366f1' : '#ffffff';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── Hero Bike Rotator ───
const HERO_BIKES = [
  { emoji: '🏍️', label: 'KTM Duke 390' },
  { emoji: '🏁', label: 'Yamaha R15 V4' },
  { emoji: '🛣️', label: 'RE Interceptor 650' },
  { emoji: '🏔️', label: 'RE Himalayan 450' },
  { emoji: '⚡', label: 'KTM RC 390' },
  { emoji: '🛵', label: 'Honda Shine 125' },
];
let heroIdx = 0;
setInterval(() => {
  heroIdx = (heroIdx + 1) % HERO_BIKES.length;
  document.getElementById('heroBikeEmoji').textContent = HERO_BIKES[heroIdx].emoji;
  document.getElementById('heroBikeLabel').textContent = HERO_BIKES[heroIdx].label;
}, 2500);

// ─── Navbar scroll effect ───
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (window.scrollY > 60) nb.classList.add('scrolled');
  else nb.classList.remove('scrolled');
});

// ─── State ───
const state = {
  budget: 150000,
  power: 20,
  mileageImp: 3,
  experience: 1,
  comfort: 3,
  maxWeight: 180,
  purpose: 'commuting',
  segment: 'any',
  brand: 'any',
};

const PURPOSE_MAP = {
  commuting: ['commuting', 'sports'],
  touring:   ['touring', 'adventure', 'cruiser'],
  sports:    ['sports', 'commuting'],
  adventure: ['adventure', 'touring'],
  cruiser:   ['cruiser', 'touring'],
};

// ─── Slider Handlers ───
function setupSlider(id, label, formatter) {
  const el = document.getElementById(id);
  const labelEl = document.getElementById(label);
  el.addEventListener('input', function () {
    state[id === 'bikeWeight' ? 'maxWeight' : id] = +this.value;
    labelEl.textContent = formatter(+this.value);
    updateSliderGradient(this);
  });
  updateSliderGradient(el);
}
function updateSliderGradient(el) {
  const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
  el.style.setProperty('--val', pct + '%');
}

function fmtBudget(v) {
  if (v >= 100000) return `₹${(v/100000).toFixed(2)}L`;
  return `₹${(v/1000).toFixed(0)}K`;
}
function fmtPower(v) { return `${v} bhp`; }
function fmtMileage(v) {
  const labels = ['', 'Not Important', 'Low', 'Medium', 'High', 'Critical'];
  return labels[v] || 'Medium';
}
function fmtWeight(v) { return `≤ ${v} kg`; }
function fmtComfort(v) {
  const labels = ['', 'Full Sporty', 'Sporty', 'Balanced', 'Comfortable', 'Max Comfort'];
  return labels[v] || 'Balanced';
}

setupSlider('budget', 'budgetVal', fmtBudget);
setupSlider('power', 'powerVal', fmtPower);
setupSlider('mileageImp', 'mileageImpVal', fmtMileage);
setupSlider('bikeWeight', 'weightVal', fmtWeight);
setupSlider('comfort', 'comfortVal', fmtComfort);

// ─── Pill Groups ───
function setupPillGroup(groupId, stateKey) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', function () {
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      state[stateKey] = this.dataset.value;
    });
  });
}
setupPillGroup('purposeGroup',    'purpose');
setupPillGroup('experienceGroup', 'experience');
setupPillGroup('segmentGroup',    'segment');
setupPillGroup('brandGroup',      'brand');

// Map experience text to number
const expMap = { beginner: 1, intermediate: 2, expert: 3 };
document.getElementById('experienceGroup').querySelectorAll('.pill').forEach(p => {
  p.addEventListener('click', function () {
    state.experience = expMap[this.dataset.value] ?? 1;
  });
});

// ─── Log ───
function log(msg, type = 'info') {
  const el = document.getElementById('logContent');
  const div = document.createElement('div');
  div.className = `log-${type}`;
  div.textContent = `> ${msg}`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
function clearLog() {
  document.getElementById('logContent').innerHTML = '';
}

// ─── Score Bars ───
function setScore(id, barId, score) {
  const pct = Math.round(score * 100);
  setTimeout(() => {
    document.getElementById(barId).style.width = pct + '%';
    document.getElementById(id).textContent = pct + '%';
  }, 100);
}

// ─── Main Recommendation Runner ───
window.runRecommendation = function () {
  const btn = document.getElementById('recommendBtn');
  btn.style.opacity = '0.7';
  btn.querySelector('.btn-text').textContent = '⏳ Running Models…';

  clearLog();
  log('Initializing user preference vector…', 'info');
  log(`Budget: ${fmtBudget(state.budget)} | Power: ${state.power} bhp`, 'info');
  log(`Mileage Importance: ${fmtMileage(state.mileageImp)} | Comfort: ${fmtComfort(state.comfort)}`, 'info');
  log(`Experience: ${['', 'Beginner', 'Intermediate', 'Expert'][state.experience]}`, 'info');
  log(`Purpose: ${state.purpose} | Segment: ${state.segment} | Brand: ${state.brand}`, 'info');

  setTimeout(() => {
    const userPrefs = {
      budget:     state.budget,
      power:      state.power,
      mileageImp: state.mileageImp,
      comfort:    +state.comfort,
      experience: +state.experience,
      maxWeight:  state.maxWeight,
      purpose:    state.purpose,
      relatedPurposes: PURPOSE_MAP[state.purpose] || [],
      segment:    state.segment,
      brand:      state.brand,
    };

    log('─────────────────────────────', 'info');
    log('[1/5] Running AHP weight derivation…', 'info');
    const { ensemble, ahpResult } = BikeEngine.runEnsemble(BikeEngine.BIKES, userPrefs);
    log(`AHP λmax = ${ahpResult.lambdaMax.toFixed(4)}, CR = ${ahpResult.CR.toFixed(4)} ${ahpResult.CR < 0.1 ? '✓ Consistent' : '⚠ Marginal'}`, 'success');
    log(`Derived weights: Budget=${(ahpResult.weights[0]*100).toFixed(1)}% Purpose=${(ahpResult.weights[5]*100).toFixed(1)}%`, 'success');

    log('[2/5] TOPSIS normalizing decision matrix…', 'info');
    log(`Identified ideal best & worst solutions`, 'success');
    log(`Closeness coefficient computed for ${BikeEngine.BIKES.length} bikes`, 'success');

    log('[3/5] Fuzzy membership evaluation running…', 'info');
    log(`Budget MF, Power MF, Mileage MF applied`, 'success');
    log(`Centroid defuzzification complete`, 'success');

    log('[4/5] KNN distance computation (k=10)…', 'info');
    log(`Euclidean distance in 7D normalized space`, 'success');

    log('[5/5] WSM composite scoring…', 'info');
    log(`Linear weighted aggregation complete`, 'success');

    log('─────────────────────────────', 'info');
    log('Ensemble combining (25%+25%+20%+15%+15%)…', 'warning');

    const top = ensemble[0];
    const topScore = Math.round(top.ensembleScore * 100);

    log(`🏆 Top Pick: ${top.bike.name} (${topScore}% match)`, 'success');
    log(`Completed! Rendering ${Math.min(ensemble.length, 9)} recommendations.`, 'success');

    // Update score bars (use top bike's individual model scores)
    setScore('scoreTopsisVal', 'scoreTopsis', top.modelScores.topsis);
    setScore('scoreAhpVal',    'scoreAhp',    top.modelScores.ahp);
    setScore('scoreFuzzyVal',  'scoreFuzzy',  top.modelScores.fuzzy);
    setScore('scoreKnnVal',    'scoreKnn',    top.modelScores.knn);
    setScore('scoreWsmVal',    'scoreWsm',    top.modelScores.wsm);

    // Ensemble display
    document.getElementById('ensembleValue').textContent = topScore + '%';
    document.getElementById('ensembleBike').textContent = `🏆 ${top.bike.name}`;

    // Render results
    renderResults(ensemble.slice(0, 9));

    btn.style.opacity = '1';
    btn.querySelector('.btn-text').textContent = '⚡ Run All 5 Models';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
};

// ─── Result Card Renderer ───
function renderResults(rankedBikes) {
  const grid = document.getElementById('resultsGrid');
  const subtitle = document.getElementById('resultsSubtitle');
  grid.innerHTML = '';
  subtitle.textContent = `Showing top ${rankedBikes.length} bikes based on your preferences.`;

  rankedBikes.forEach((result, i) => {
    const { bike, ensembleScore, modelScores } = result;
    const rank = i + 1;
    const pct = Math.round(ensembleScore * 100);
    const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

    // Segment label colors
    const segColors = {
      commuter: '#60a5fa', naked: '#f97316',
      sports: '#f43f5e', adventure: '#10b981', cruiser: '#a855f7'
    };
    const segColor = segColors[bike.segment] || '#94a3b8';

    const card = document.createElement('div');
    card.className = `result-card ${rankClass}`;
    card.innerHTML = `
      <div class="rank-badge ${rankClass}">${rankLabel}</div>
      <div class="card-header">
        <div class="card-emoji">${bike.emoji}</div>
        <div class="card-title-wrap">
          <div class="card-bike-name">${bike.name}</div>
          <div class="card-brand">${bike.brand.replace('-', ' ').toUpperCase()}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-score-row">
          <div>
            <div class="score-main">${pct}%</div>
            <div class="score-label">Match Score</div>
          </div>
          <div class="match-bar-wrap">
            <div class="match-bar" style="width:0%" data-width="${pct}%"></div>
          </div>
        </div>
        <div class="card-specs">
          <div class="spec-item">
            <span class="spec-label">Engine</span>
            <span class="spec-value">${bike.cc} cc</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Power</span>
            <span class="spec-value">${bike.power} bhp</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Mileage</span>
            <span class="spec-value">~${bike.mileage} kmpl</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Weight</span>
            <span class="spec-value">${bike.weight} kg</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Price</span>
            <span class="spec-value">${formatPrice(bike.price)}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">ABS</span>
            <span class="spec-value ${bike.abs ? 'td-abs-yes' : 'td-abs-no'}">${bike.abs ? '✓ Dual' : '✗ None'}</span>
          </div>
        </div>
        <div class="card-tags">
          <span class="tag" style="color:${segColor};border-color:${segColor}40;background:${segColor}15">
            ${bike.segment.charAt(0).toUpperCase() + bike.segment.slice(1)}
          </span>
          ${bike.pros.map((p, pi) => `<span class="tag ${pi===0?'highlight':''}">${p}</span>`).join('')}
        </div>
        <div class="model-breakdown">
          <span class="model-chip chip-topsis">TOPSIS ${Math.round(modelScores.topsis*100)}%</span>
          <span class="model-chip chip-ahp">AHP ${Math.round(modelScores.ahp*100)}%</span>
          <span class="model-chip chip-fuzzy">Fuzzy ${Math.round(modelScores.fuzzy*100)}%</span>
          <span class="model-chip chip-knn">KNN ${Math.round(modelScores.knn*100)}%</span>
          <span class="model-chip chip-wsm">WSM ${Math.round(modelScores.wsm*100)}%</span>
        </div>
      </div>
    `;
    grid.appendChild(card);

    // Animate match bar after insertion
    setTimeout(() => {
      const bar = card.querySelector('.match-bar');
      if (bar) bar.style.width = bar.dataset.width;
    }, 150 + i * 80);
  });
}

function formatPrice(p) {
  if (p >= 100000) return `₹${(p/100000).toFixed(2)}L`;
  return `₹${(p/1000).toFixed(0)}K`;
}

// ─── Dataset Table ───
function renderDatasetTable(filter = 'all') {
  const tbody = document.getElementById('datasetBody');
  tbody.innerHTML = '';
  const bikes = filter === 'all' ? BikeEngine.BIKES : BikeEngine.BIKES.filter(b => b.segment === filter);

  bikes.forEach(bike => {
    const tr = document.createElement('tr');
    if (filter !== 'all' && bike.segment !== filter) { tr.classList.add('hidden'); }
    tr.innerHTML = `
      <td class="td-name">${bike.name}</td>
      <td class="td-brand">${bike.brand.replace('-', ' ').toUpperCase()}</td>
      <td><span class="td-segment">${bike.segment}</span></td>
      <td>${bike.cc}</td>
      <td>${bike.power}</td>
      <td>${bike.mileage}</td>
      <td>${bike.weight}</td>
      <td>${formatPrice(bike.price)}</td>
      <td class="${bike.abs ? 'td-abs-yes' : 'td-abs-no'}">${bike.abs ? '✓ Yes' : '✗ No'}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.filterDataset = function (filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderDatasetTable(filter);
};

// Init dataset
renderDatasetTable('all');

// ─── Experience pill fix ─── 
// Sync state.experience with pill values
document.querySelectorAll('#experienceGroup .pill').forEach(pill => {
  pill.addEventListener('click', function () {
    state.experience = expMap[this.dataset.value] ?? 1;
  });
});
